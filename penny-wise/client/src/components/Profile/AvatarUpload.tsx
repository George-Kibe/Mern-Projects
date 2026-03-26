import { useAuthStore } from "@/store/authStore";
import { getInitials } from "@/utils/getInitials";
import { Trash2, Upload, User } from "lucide-react";
import { useState } from "react";

export default function AvatarUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { user, uploadAvatar, deleteAvatar, isLoading, error } = useAuthStore();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    useAuthStore.setState({ error: null });

    await uploadAvatar(selectedFile);

    if (!error) {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your avatar?",
    );

    if (!confirmed) return;

    await deleteAvatar();

    setSelectedFile(null);
    setPreviewUrl(null);
  }

  const avatarUrl = user?.avatar
    ? `http://localhost:8000/uploads/avatars/${user.avatar}`
    : null;

  return (
    <div className=" border border-purple-950 rounded-sm p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        Profile Picture
      </h3>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg">
        <div className="">
          {previewUrl || avatarUrl ? (
            <img
              src={previewUrl || avatarUrl || ""}
              alt="Avatar"
              className="size-32 rounded-full object-cover border-2 border-purple-500"
            />
          ) : (
            <div className="size-32 rounded-full bg-purple-900/30 border-2 border-purple-500 flex items-center justify-center">
              {user ? (
                <span className="text-3xl font-bold text-gray-100">
                  {getInitials(user.name)}
                </span>
              ) : (
                <User className="size-12 text-gray-400" />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 flex-1 items-center">
          <div className="flex gap-3">
            <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-sm cursor-pointer flex items-center gap-2 transition-colors">
              <Upload className="size-4" />
              Choose Photo
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />
            </label>

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-sm transition-colors"
              >
                {isLoading ? "Uploading..." : "Upload"}
              </button>
            )}

            {user?.avatar && !selectedFile && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-800 hover:bg-red-900 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-sm flex items-center gap-2 transition-colors"
              >
                <Trash2 className="size-4" />
                {isLoading ? "Deleting..." : "Remove Photo"}
              </button>
            )}
          </div>

          <p className="text-sm text-gray-400">JPG or PNG. Max size 5MB.</p>

          {selectedFile && (
            <p className="text-sm text-green-400">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
