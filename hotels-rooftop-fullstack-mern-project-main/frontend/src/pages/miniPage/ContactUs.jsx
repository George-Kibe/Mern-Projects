import React from 'react'

const ContactUs = () => {
  return (
    <section className="bg-white text-primary container mx-auto mt-8 md:px-24 p-8">
    <h2 className="md:text-4xl text-3xl font-medium md:leading-tight pt-8 pb-5">
    Contact Us
    </h2>

    <div className="space-y-6">
      <p>
      For any questions or concerns, please email <a href='mailto:hello@hotels-rooftop.com' className='text-blue-400 italic underline'>emmasmithstay@gmail.com</a> or fill out the form below.
      </p>
      <p>
        If you have additional questions or require more information about our
        Privacy Policy, do not hesitate to contact us.
      </p>
    </div>

  </section>
  )
}

export default ContactUs