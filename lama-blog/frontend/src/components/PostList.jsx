import PostListItem from './PostListItem'
import { useSearchParams } from 'react-router';
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from 'axios';

const fetchPosts = async (pageParam, searchParams) => {
  const searchParamsObj = Object.fromEntries([...searchParams]);

  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts`, {
    params: { page: pageParam, limit: 10, ...searchParamsObj },
  });
  return res.data;
};


const PostList = () => {
  const [searchParams] = useSearchParams();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isPending,
  } = useInfiniteQuery({
    queryKey: ["posts", searchParams.toString()],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam, searchParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
  });

  // Only block on the first page; later pages load inside InfiniteScroll.
  if (isPending) return "Loading...";

  if (error) return "Something went wrong!";

  const allPosts = data?.pages?.flatMap((page) => page.posts) || [];

  return (
    <div className='flex flex-col gap-12 mb-8'>
      <InfiniteScroll
        dataLength={allPosts.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={<h4>Loading more posts...</h4>}
        endMessage={
          <p>
            <b>{allPosts.length ? "All posts loaded!" : "No posts found."}</b>
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
