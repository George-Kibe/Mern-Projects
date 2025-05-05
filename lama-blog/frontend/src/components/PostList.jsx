import React from 'react'
import PostListItem from './PostListItem'
const post = {
  title: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.",
  img: "/featured1.jpeg",
  category: "web Development",
  user: {
    username: "John Doe",
  },
  createdAt: "2 days ago",
  slug: "lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit",
}
const PostList = () => {
  return (
    <div className='flex flex-col gap-12 mb-8'>
      <PostListItem post={post} />
      <PostListItem post={post} />
      <PostListItem post={post} />
    </div>
  )
}

export default PostList
