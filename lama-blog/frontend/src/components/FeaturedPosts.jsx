import React from 'react'
import Image from './Image'
import { Link } from 'react-router-dom'

const FeaturedPosts = () => {
  return (
    <div className="mt-8 flex flex-col lg:flex-row gap-8">
      {/* First */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        {/* image */}
        <Image src={"/featured1.jpeg"} className="rounded-3xl object-cover"  alt="featured1" w="895" />
        {/* details */}
        <div className="flex flex-center gap-2 md:gap-4">
          <h1 className="font-semibold lg:text-lg text-gray-700">01</h1>
          <Link className='text-blue-800 lg-text-lg'>Web Design and Dev</Link>
          <span className="text-gray-500">2 days Ago</span>
        </div>
        {/* title */}
        <Link to={"/posts/test"} className="text-xl lg:text-2xl font-semibold lg:font-bold">
          Lorem ipsum dolor sit amet consectetur adipisicing
        </Link>
        {/* description */}
        <p className="text-gray-500">
          Lorem ipsum dolor sit amet consectetur adipisicing
        </p>
      </div>

      {/* Others */}
      <div className="w-full lg:w-1/2 flex flex-col gap-2 md:gap-4">
        {/* second */}
        <div className="lg:h-1/3 flex justify-between gap-4">
          <div className="w-1/3 aspect-video">
            <Image
              src={"/featured2.jpeg"}
              className="rounded-3xl object-contain w-full h-full"
              alt="featured2"
              w="298"
            />
          </div>
          {/* details and title */}
          <div className="w-2/3">
          {/* details */}
            <div className="flex items-center gap-4 text-sm lg:text-base mb-4">
              <h1 className="font-semibold">02</h1>
              <Link to={"/posts/test"} className="text-blue-800">Web Design and Dev</Link>
              <span className="text-gray-500">2 days Ago</span>
            </div>
            {/* title */}
            <Link to={"/posts/test"} className="text-base sm:text-lg md:text-2xl font-medium">
              Lorem ipsum dolor sit amet consectetur adipisicing
            </Link>
          </div>
        </div>
        {/* third */}
        <div className="lg:h-1/3 flex justify-between gap-2 md:gap-4">
          <div className="w-1/3 aspect-video">
            <Image
              src={"/featured3.jpeg"}
              className="rounded-3xl object-contain w-full h-full"
              alt="featured3"
              w="298"
            />
          </div>
          {/* details and title */}
          <div className="w-2/3">
          {/* details */}
            <div className="flex items-center gap-4 text-sm lg:text-base mb-4">
              <h1 className="font-semibold">03</h1>
              <Link to={"/posts/test"} className="text-blue-800">Web Design and Dev</Link>
              <span className="text-gray-500">1 day Ago</span>
            </div>
            {/* title */}
            <Link to={"/posts/test"} className="text-base sm:text-lg md:text-2xl font-medium">
              Lorem ipsum dolor sit amet consectetur adipisicing
            </Link>
          </div>
        </div>
        {/* Fourth */}
        <div className="lg:h-1/3 flex justify-between gap-2 md:gap-4">
         <div className="w-1/3 aspect-video">
            <Image
              src={"/featured4.jpeg"}
              className="rounded-3xl object-contain w-full h-full"
              alt="featured4"
              w="298"
            />
          </div>
          {/* details and title */}
          <div className="w-2/3">
          {/* details */}
            <div className="flex items-center gap-4 text-sm lg:text-base mb-4">
              <h1 className="font-semibold">04</h1>
              <Link to={"/posts/test"} className="text-blue-800">Web Design and Dev</Link>
              <span className="text-gray-500">5 day Ago</span>
            </div>
            {/* title */}
            <Link to={"/posts/test"} className="text-base sm:text-lg md:text-2xl font-medium">
              Lorem ipsum dolor sit amet consectetur adipisicing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedPosts