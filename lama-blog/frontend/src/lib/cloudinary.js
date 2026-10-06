const UPLOAD_SEGMENT = "/upload/";

export const isCloudinaryUrl = (src) =>
  typeof src === "string" &&
  src.includes("res.cloudinary.com") &&
  src.includes(UPLOAD_SEGMENT);

// Insert a transformation string right after /upload/ in a Cloudinary URL.
// e.g. .../image/upload/v1/lama-blog/x.jpg -> .../image/upload/f_auto,q_auto,w_600,c_limit/v1/lama-blog/x.jpg
export const cloudinaryUrl = (src, { w, h, quality = "auto", blur } = {}) => {
  if (!isCloudinaryUrl(src)) return src;

  const parts = ["f_auto", `q_${quality}`];
  if (w) parts.push(`w_${Math.round(w)}`);
  if (h) parts.push(`h_${Math.round(h)}`);
  // Both dimensions -> crop to fill, letting Cloudinary pick the subject.
  parts.push(w && h ? "c_fill,g_auto" : "c_limit");
  if (blur) parts.push(`e_blur:${blur}`);

  const index = src.indexOf(UPLOAD_SEGMENT) + UPLOAD_SEGMENT.length;
  return `${src.slice(0, index)}${parts.join(",")}/${src.slice(index)}`;
};
