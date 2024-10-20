import React from 'react'
import AboutImg from "../../assets/about.jpeg"
const About = () => {
  return (
    <div className='bg-white text-primary container mx-auto mt-8 p-8'>
       <h2 className='md:text-4xl text-3xl font-medium md:leading-tight pt-8 mb-12 md:px-24'>
        About Us
       </h2>
       <div className='md:px-24'>
       <img src={AboutImg} alt=""  className='rounded-full'/>
       <p className='mt-5 text-center md:w-72 text-sm'>Emma Smith</p>
       </div>

       <div className='mt-10 md:px-24 space-y-8'>
        <p>I am a true wanderer at heart with a love for exploring new places and experiencing all that the world has to offer. I have traveled to numerous hotels in a variety of locations and have always been drawn to the excitement and adventure of discovering new cultures and ways of life. I have started this blog <a href="/" className='text-blue-400 underline'>hotels-rooftop.com</a> to share my experience.</p>

        <p>When I’m not planning my next trip, I can often be found sharing my travel stories and experiences with friends and family. I have a talent for capturing the essence of a place and its people in my writing, and my photos and accounts of my travels are always met with enthusiasm and interest. Through my blog I can help others to plan and discover new places.</p>

        <p>In addition to my love for travel, I am also an avid reader and enjoy spending time outdoors. I am an adventurous person who is always up for trying new things, and my enthusiasm and zest for life is contagious.</p>

        <p>My passion for travel and exploration has taken me to some incredible places, and I have no plans of slowing down anytime soon. I am always on the lookout for my next adventure and am excited to see where my travels will take me next.</p>
       </div>
    </div>
  )
}

export default About