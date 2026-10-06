import { useAuth } from "@clerk/react";
import axios from "axios";
import { useRef } from "react";
import { toast } from "react-toastify";

// Fetch a short-lived signature from our API, then upload straight to Cloudinary.
const uploadToCloudinary = async (file, type, token, onProgress) => {
  const { data: auth } = await axios.get(
    `${import.meta.env.VITE_API_URL}/posts/upload-auth`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

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

const Upload = ({ children, type, setProgress, setData }) => {
  const ref = useRef(null);
  const { getToken } = useAuth();

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;

    try {
      const token = await getToken();
      const data = await uploadToCloudinary(file, type, token, setProgress);
      setData(data);
    } catch (error) {
      console.log(error);
      setProgress(0);
      toast.error(
        error.response?.data?.error?.message || `${type} upload failed!`
      );
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
      <div className="cursor-pointer" onClick={() => ref.current.click()}>
        {children}
      </div>
    </>
  );
};

export default Upload;
