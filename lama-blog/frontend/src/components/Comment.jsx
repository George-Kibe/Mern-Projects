import React from 'react'
import Image from './Image'

const Comment = ({comment}) => {
  return (
    <div className="p-4 bg-slate-50 rounded-xl mb-8">
      <div className="flex items-center gap-4">
        {!comment?.user?.img && (
          <Image
            src={"userImg.jpeg"}
            className="w-10 h-10 rounded-full object-cover"
            w="40"
          />
        )}
        <span className="font-medium">{"John Doe"}</span>
        <span className="text-sm text-gray-500">
          {"2 days ago"}
        </span>
        {/* {user &&
          (comment.user.username === user.username || role === "admin") && (
            <span
              className="text-xs text-red-300 hover:text-red-500 cursor-pointer"
              onClick={() => mutation.mutate()}
            >
              delete
              {mutation.isPending && <span>(in progress)</span>}
            </span>
          )} */}
      </div>
      <div className="mt-4">
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit, rerum!
        </p>
      </div>
    </div>
  )
}

export default Comment
