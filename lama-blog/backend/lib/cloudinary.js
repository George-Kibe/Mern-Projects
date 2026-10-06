import { v2 as cloudinary } from "cloudinary";

// The SDK reads CLOUDINARY_URL from the environment automatically.
cloudinary.config({ secure: true });

export const UPLOAD_FOLDER = "lama-blog";

// Signed params the browser needs to upload straight to Cloudinary.
export const getUploadSignature = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder: UPLOAD_FOLDER };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, api_secret);

  return { ...paramsToSign, signature, apiKey: api_key, cloudName: cloud_name };
};

// https://res.cloudinary.com/<cloud>/image/upload/v123/lama-blog/abc.jpg
//   -> { resourceType: "image", publicId: "lama-blog/abc" }
const parseCloudinaryUrl = (url) => {
  const match = url?.match(
    /res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(lama-blog\/[^.]+)\.\w+$/
  );
  return match ? { resourceType: match[1], publicId: match[2] } : null;
};

export const deleteImage = async (url) => {
  const asset = parseCloudinaryUrl(url);
  if (!asset) return;

  try {
    await cloudinary.uploader.destroy(asset.publicId, {
      resource_type: asset.resourceType,
    });
  } catch (error) {
    console.log("Cloudinary delete failed: ", error.message);
  }
};

// Images/videos uploaded into a post body. Seed media is shared between
// posts, so it is left alone.
export const deleteContentMedia = async (html = "") => {
  const urls = html.match(/https:\/\/res\.cloudinary\.com\/[^"'\s)<>]+/g) || [];
  const owned = urls.filter((url) => !url.includes(`/${UPLOAD_FOLDER}/seed/`));
  await Promise.all([...new Set(owned)].map(deleteImage));
};

export default cloudinary;
