import { cloudinaryUrl, isCloudinaryUrl } from "../lib/cloudinary";

// `priority` is for above-the-fold images (e.g. a post cover): load eagerly, fetch first.
const Image = ({ src, className, w, h, alt = "", priority = false }) => {
  if (!src) return null;

  // Local assets live in /public; other absolute URLs (e.g. Clerk avatars) pass through.
  if (!isCloudinaryUrl(src)) {
    let url = /^https?:\/\//.test(src) ? src : `/${src}`;
    // Clerk avatars accept a width param; avoid downloading 1000px for a 48px avatar.
    if (url.startsWith("https://img.clerk.com/") && w) {
      url += `${url.includes("?") ? "&" : "?"}width=${Number(w) * 2}`;
    }
    return (
      <img
        src={url}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        alt={alt}
        width={w}
        height={h}
      />
    );
  }

  const width = w ? Number(w) : undefined;
  const height = h ? Number(h) : undefined;
  const dimensions = { w: width, h: height };
  const retina = { w: width && width * 2, h: height && height * 2 };
  // Tiny blurred version shown while the real image loads.
  const placeholder = cloudinaryUrl(src, {
    w: 40,
    h: width && height ? Math.round((40 * height) / width) : undefined,
    quality: 10,
    blur: 1000,
  });

  return (
    <img
      src={cloudinaryUrl(src, dimensions)}
      srcSet={`${cloudinaryUrl(src, dimensions)} 1x, ${cloudinaryUrl(src, retina)} 2x`}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      alt={alt}
      width={width}
      height={height}
      style={{
        backgroundImage: `url(${placeholder})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
};

export default Image;
