import React,  { useState } from 'react'
import PostListItem from './PostListItem'
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";

import axios from 'axios';

const post = {
  title: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.",
  img: "/featured1.jpeg",
  category: "web Development",
  user: {
    username: "John Doe",
  },
  createdAt: "2 days ago",
  slug: "lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit",
}

const fetchPosts = async (pageParam, searchParams) => {
  const searchParamsObj = Object.fromEntries([...searchParams]);

  console.log(searchParamsObj);

  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts`, {
    params: { page: pageParam, limit: 10, ...searchParamsObj },
  });
  return res.data;
};


const PostList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["posts", searchParams.toString()],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam, searchParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
  });

  // if (status === "loading") return "Loading...";
  if (isFetching && !error) return "Loading...";

  // if (status === "error") return "Something went wrong!";
  if (error) return "Something went wrong!";

  const allPosts = data?.pages?.flatMap((page) => page.posts) || [];
  console.log("All Posts: ", allPosts);
  
  return (
    <div className='flex flex-col gap-12 mb-8'>
      <InfiniteScroll
        dataLength={allPosts.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={<h4>Loading more posts...</h4>}
        endMessage={
          <p>
            <b>All posts loaded!</b>
          </p>
        }
      >
        {allPosts.map((post) => (
          <PostListItem key={post._id} post={post} />
        ))}
      </InfiniteScroll>
    </div>
  )
}

export default PostList
