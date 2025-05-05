import React from 'react'
import Comment from './Comment';

const Comments = () => {  
  const handleSubmit = (e) => {
    e.preventDefault();
    const desc = e.target.desc.value;
    console.log(desc);
    e.target.reset();
  }
  return (
    <div className="flex flex-col gap-8 lg:w-3/5 mb-12">
      <h1 className="text-xl text-gray-500 underline">Comments</h1>
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-between gap-8 w-full"
      >
        <textarea
          name="desc"
          placeholder="Write a comment..."
          className="w-full p-2 rounded-md"
        />
        <button className="bg-blue-800 px-4 py-3 text-white font-medium rounded-md">
          Send
        </button>
      </form>
      <Comment />
      <Comment />
      <Comment />
    </div>
  )
}

export default Comments