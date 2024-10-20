import React, { useState } from 'react'
import { usePostCommentMutation } from '../../../redux/features/comments/commentsApi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFetchBlogByIdQuery } from '../../../redux/features/blogs/blogsApi';

const PostAComment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const { user } = useSelector((state) => state.auth);
  console.log(user?._id)
  // console.log(id)
  const [postComment] = usePostCommentMutation();

  // refetching afer comments
  const { refetch } = useFetchBlogByIdQuery(id, {
    skip: !id, // Skip fetching if id is not available
  });

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!user) {
        alert('You must be logged in to post a comment');
        navigate('/login');
        return;
    }
    
    const newComment = {
      comment: comment,
      user: user?._id,
      postId: id
    }

    console.log(newComment)
    try {
        const response = await postComment(newComment).unwrap();
        console.log(response)
        alert('Comment posted successfully!')
        setComment(''); 
        refetch(); 
    } catch (err) {
        alert(err.message);
    }
};
  return (
    <div className='mt-8'>
        <h3 className="text-lg font-medium mb-8">Leave a Comment</h3>
        <form onSubmit={handleSubmit}>
            <textarea 
             value={comment} 
             onChange={(e) => setComment(e.target.value)}
            name="text" id="text" cols="30" rows="10" 
            className='w-full bg-bgPrimary focus:outline-none p-5'
            placeholder='Share your opinion about this post....'
            />
            <button type="submit" className='w-full mt-5 bg-primary hover:bg-indigo-500 text-white font-medium py-3 rounded-md'>Submit</button>      
        </form>
    </div>
  )
}

export default PostAComment
