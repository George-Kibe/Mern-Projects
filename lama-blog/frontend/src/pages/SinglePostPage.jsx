import React from 'react'
import Image from '../components/Image'
import { Link, useParams } from 'react-router'
import Search from '../components/Search'
import Comments from '../components/Comments'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { format } from 'timeago.js'
import PostMenuActions from '../components/PostMenuActions'
import DOMPurify from 'dompurify'
import { CATEGORIES, categoryLabel } from '../lib/categories'

const fetchPost = async (slug) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${slug}`);
  return res.data;
};

const SinglePostPage = () => {
  const { slug } = useParams();

  const { isPending, error, data } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
  });

  if (isPending) return "loading...";
  if (error?.response?.status === 404) return "Post not found!";
  if (error) return "Something went wrong! " + error.message;
  if (!data) return "Post not found!";
  return (
    <div className="flex flex-col gap-8">
       {/* detail */}
       <div className="flex gap-8">
        <div className="lg:w-3/5 flex flex-col gap-8">
          <h1 className="text-xl md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold">
             {data.title}
          </h1>
         <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Written by</span>
            <Link className="text-blue-800" to={`/posts?author=${data.user?.username || ""}`}>{data.user?.username || ""}</Link>
            <span>on</span>
            <Link className="text-blue-800" to={`/posts?cat=${data.category}`}>{categoryLabel(data.category)}</Link>
            <span>{format(data.createdAt)}</span>
          </div>
          <p className="text-gray-500 font-medium">{data.description}</p>
        </div>
        <div className="hidden lg:block w-2/5">
          <Image
            src={data.img || "postImg.jpeg"}
            w="600"
            h="400"
            alt={data.title}
            className="rounded-2xl object-cover"
          />
        </div>
      </div>
      {/* content */}
      <div className="flex flex-col md:flex-row gap-12 justify-between">
        {/* text */}
        <div className="lg:text-lg flex flex-col gap-6 text-justify">
          <div
            className="post-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(data.content, {
                ADD_TAGS: ["iframe"],
                ADD_ATTR: ["allowfullscreen", "frameborder"],
              }),
            }}
          />
          
        </div>
        {/* menu */}
        <div className="px-4 h-max sticky top-8">
          <h1 className="mb-4 text-sm font-medium">Author</h1>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-8">
              {/* <Image
                src={"userImg.jpeg"}
                className="w-12 h-12 rounded-full object-cover"
                w="48"
                h="48"
              /> */}
              {data.user?.img && (
                <Image
                  src={data.user.img}
                  className="w-12 h-12 rounded-full object-cover"
                  w="48"
                  h="48"
                />
              )}
              { data.user?.username && (
                <Link className="text-blue-800" to={`/posts?author=${data.user.username}`}>{data.user.username}</Link>
              )}
              
            </div>
            <p className="text-sm text-gray-500">
              Lorem ipsum dolor sit amet consectetur
            </p>
            <div className="flex gap-2">
              <Link>
                <Image src="facebook.svg" />
              </Link>
              <Link>
                <Image src="instagram.svg" />
              </Link>
            </div>
          </div>
          <PostMenuActions post={data}/>
          <h1 className="mt-8 mb-4 text-sm font-medium">Categories</h1>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/posts" className="underline">All</Link>
            {CATEGORIES.map((c) => (
              <Link key={c.value} to={`/posts?cat=${c.value}`} className="underline">
                {c.label}
              </Link>
            ))}
          </div>
          <h1 className="mt-8 mb-4 text-sm font-medium">Search</h1>
          <Search />
        </div>
      </div>
      <Comments postId={data._id}/>
    </div>
  )
}

export default SinglePostPage