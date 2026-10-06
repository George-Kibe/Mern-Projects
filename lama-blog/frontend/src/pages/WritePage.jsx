import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth, useUser } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { ImageSquare, PencilSimpleLine, VideoCamera, X } from "@phosphor-icons/react";
import { api, authHeaders, errorMessage } from "../lib/api";
import { CATEGORIES } from "../lib/categories";
import Upload from "../components/Upload";
import Image from "../components/Image";
import StateMessage from "../components/StateMessage";

const MIN_CONTENT = 100;
const DESCRIPTION_MAX = 200;

const FieldError = ({ name, errors }) =>
  errors[name] ? (
    <p id={`write-${name}-error`} className="mt-2 text-sm text-danger">
      {errors[name]}
    </p>
  ) : null;

const textLength = (html) => html.replace(/<[^>]*>/g, "").trim().length;

const WritePage = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [cover, setCover] = useState(null);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState({});

  const isUploading = 0 < progress && progress < 100;

  const addImage = (img) =>
    setValue(
      (prev) =>
        prev + `<p><img src="${img.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_1200,c_limit/")}" alt=""/></p>`
    );
  const addVideo = (video) =>
    setValue(
      (prev) =>
        prev + `<p><iframe class="ql-video" src="${video.secure_url.replace("/upload/", "/upload/q_auto/")}"></iframe></p>`
    );

  const mutation = useMutation({
    mutationFn: async (post) => api.post("/posts", post, authHeaders(await getToken())),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postsMeta"] });
      toast.success("Your post is live");
      navigate(`/posts/${res.data.slug}`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (!isLoaded) {
    return (
      <div className="container-page flex flex-col gap-6 py-12" aria-busy="true">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container-page py-16">
        <StateMessage
          title="Sign in to write a post"
          body="Members can publish articles with images and video."
          action={<Link to="/login" className="btn btn-primary">Sign in</Link>}
        />
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!title.trim()) next.title = "Add a title.";
    if (!description.trim()) next.description = "Add a short summary readers see in lists.";
    if (textLength(value) < MIN_CONTENT)
      next.content = `Write at least ${MIN_CONTENT} characters (${textLength(value)} so far).`;
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`write-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    mutation.mutate({
      title: title.trim(),
      category,
      description: description.trim(),
      img: cover?.secure_url || "",
      content: value,
    });
  };

  return (
    <div className="container-page py-8 md:py-12">
      <form onSubmit={handleSubmit} noValidate className="mx-auto flex max-w-[52rem] flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold md:text-4xl">Write a post</h1>
          <p className="text-ink-soft">Your post is published as soon as you save it.</p>
        </header>

        {/* Cover */}
        <div className="flex flex-col">
          <span className="field-label">Cover image</span>
          {cover ? (
            <div className="relative overflow-hidden rounded-xl shadow-card">
              <Image src={cover.secure_url} w="832" h="416" alt="Cover preview" className="aspect-[2/1] w-full object-cover" />
              <div className="absolute right-4 bottom-4 flex gap-2">
                <Upload type="image" setProgress={setProgress} setData={setCover}>
                  <span className="btn btn-secondary">Replace</span>
                </Upload>
                <button type="button" className="btn btn-secondary" onClick={() => setCover(null)}>
                  <X size={16} aria-hidden />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <Upload type="image" setProgress={setProgress} setData={setCover} className="block w-full">
              <div className="flex aspect-[3/1] min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-card/50 text-ink-soft transition-colors hover:border-accent hover:text-accent">
                <ImageSquare size={32} aria-hidden />
                <span className="font-medium">Add a cover image</span>
                <span className="text-sm text-ink-faint">JPG, PNG or WebP, up to 10 MB</span>
              </div>
            </Upload>
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col">
          <label htmlFor="write-title" className="field-label">Title</label>
          <input
            id="write-title"
            type="text"
            value={title}
            maxLength={140}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "write-title-error" : undefined}
            placeholder="What are you writing about?"
            className="field text-xl font-semibold md:text-2xl"
          />
          <FieldError name="title" errors={errors} />
        </div>

        <div className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="flex flex-col">
            <label htmlFor="write-category" className="field-label">Subject</label>
            <select
              id="write-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field field-select"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between">
              <label htmlFor="write-description" className="field-label">Summary</label>
              <span className="text-sm text-ink-faint tabular-nums">{description.length}/{DESCRIPTION_MAX}</span>
            </div>
            <textarea
              id="write-description"
              rows={2}
              value={description}
              maxLength={DESCRIPTION_MAX}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "write-description-error" : undefined}
              placeholder="One or two sentences shown on post cards"
              className="field resize-y"
            />
            <FieldError name="description" errors={errors} />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <span className="field-label" id="write-content-label">Post</span>
            <div className="mb-2 flex gap-2">
              <Upload type="image" setProgress={setProgress} setData={addImage}>
                <span className="btn btn-ghost min-h-9 py-1 text-sm">
                  <ImageSquare size={18} aria-hidden />
                  Image
                </span>
              </Upload>
              <Upload type="video" setProgress={setProgress} setData={addVideo}>
                <span className="btn btn-ghost min-h-9 py-1 text-sm">
                  <VideoCamera size={18} aria-hidden />
                  Video
                </span>
              </Upload>
            </div>
          </div>
          <div
            id="write-content"
            tabIndex={-1}
            aria-labelledby="write-content-label"
            className={`overflow-hidden rounded-xl bg-card shadow-card ${errors.content ? "ring-2 ring-danger" : ""}`}
          >
            <ReactQuill theme="snow" value={value} onChange={setValue} readOnly={isUploading} placeholder="Start writing" />
          </div>
          <FieldError name="content" errors={errors} />
        </div>

        {isUploading && (
          <div className="flex flex-col gap-2" role="status">
            <span className="text-sm text-ink-soft tabular-nums">Uploading {progress}%</span>
            <div className="h-1 overflow-hidden rounded-full bg-line-soft">
              <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-end">
          <Link to="/posts" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending || isUploading}>
            <PencilSimpleLine size={18} weight="bold" aria-hidden />
            {mutation.isPending ? "Publishing" : "Publish post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WritePage;
