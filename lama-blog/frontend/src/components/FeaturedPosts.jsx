import { Link } from "react-router";
import Image from "./Image";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";
import { categoryLabel } from "../lib/categories";

const fetchPost = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/posts?featured=true&limit=4&sort=newest`
  );
  return res.data;
};

const FeaturedPosts = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["featuredPosts"],
    queryFn: () => fetchPost(),
  });

  if (isPending) return "loading...";
  if (error) return "Something went wrong!" + error.message;

  const posts = data.posts;
  if (!posts || posts.length === 0) {
    return null;
  }
  return (
    <div className="mt-8 flex flex-col lg:flex-row gap-8">
      {/* First */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        {/* image */}
        {posts[0].img && <Image
          src={posts[0].img}
          alt={posts[0].title}
          className="rounded-3xl object-cover w-full"
          w="800"
          h="450"
        />}
        {/* details */}
        <div className="flex items-center gap-4">
          <h1 className="font-semibold lg:text-lg">01.</h1>
          <Link className="text-blue-800 lg:text-lg" to={`/posts?cat=${posts[0].category}`}>
            {categoryLabel(posts[0].category)}
          </Link>
          <span className="text-gray-500">{format(posts[0].createdAt)}</span>
        </div>
        {/* title */}
        <Link
          to={`/posts/${posts[0].slug}`}
          className="text-xl lg:text-3xl font-semibold lg:font-bold"
        >
          {posts[0].title}
        </Link>
      </div>
      {/* Others */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        {posts.slice(1, 4).map((post, index) => (
          <div key={post._id} className="lg:h-1/3 flex justify-between gap-4">
            {post.img && (
              <div className="w-1/3 aspect-video">
                <Image
                  src={post.img}
                  alt={post.title}
                  className="rounded-3xl object-cover w-full h-full"
                  w="298"
                  h="168"
                />
              </div>
            )}
            {/* details and title */}
            <div className="w-2/3">
              {/* details */}
              <div className="flex items-center gap-4 text-sm lg:text-base mb-4">
                <h1 className="font-semibold">{String(index + 2).padStart(2, "0")}.</h1>
                <Link className="text-blue-800" to={`/posts?cat=${post.category}`}>
                  {categoryLabel(post.category)}
                </Link>
                <span className="text-gray-500 text-sm">{format(post.createdAt)}</span>
              </div>
              {/* title */}
              <Link
                to={`/posts/${post.slug}`}
                className="text-base sm:text-lg md:text-2xl lg:text-xl xl:text-2xl font-medium"
              >
                {post.title}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedPosts;