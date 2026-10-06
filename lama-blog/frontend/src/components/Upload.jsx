import { useAuth } from "@clerk/react";
import axios from "axios";
import { api, authHeaders, errorMessage } from "../lib/api";
import { useRef } from "react";
import { toast } from "react-toastify";

// Fetch a short-lived signature from our API, then upload straight to Cloudinary.
const uploadToCloudinary = async (file, type, token, onProgress) => {
  const { data: auth } = await api.get("/posts/upload-auth", authHeaders(token));

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", auth.apiKey);
  formData.append("timestamp", auth.timestamp);
  formData.append("signature", auth.signature);
  formData.append("folder", auth.folder);

  const resourceType = type === "video" ? "video" : "image";
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${auth.cloudName}/${resourceType}/upload`,
    formData,
    {
      onUploadProgress: (progress) =>
        onProgress(
          Math.round((progress.loaded / (progress.total || file.size)) * 100)
        ),
    }
  );

  return res.data;
};

// Cloudinary free-plan limits; checked here so oversized files never use an upload slot.
const MAX_BYTES = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024 };

const Upload = ({ children, type, setProgress, setData, className = "inline-flex" }) => {
  const ref = useRef(null);
  const { getToken } = useAuth();

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES[type]) {
      toast.error(`That ${type} is too large. The limit is ${MAX_BYTES[type] / 1024 / 1024} MB.`);
      return;
    }

    try {
      const token = await getToken();
      const data = await uploadToCloudinary(file, type, token, setProgress);
      setData(data);
    } catch (error) {
      setProgress(0);
      // Cloudinary errors come back as { error: { message } }.
      toast.error(error.response?.data?.error?.message || errorMessage(error));
    }
  };

  return (
    <>
      <input
        type="file"
        className="hidden"
        ref={ref}
        accept={`${type}/*`}
        onChange={handleChange}
      />
      <button
        type="button"
        className={`cursor-pointer rounded-xl text-left ${className}`}
        onClick={() => ref.current.click()}
      >
        {children}
      </button>
    </>
  );
};

export default Upload;
