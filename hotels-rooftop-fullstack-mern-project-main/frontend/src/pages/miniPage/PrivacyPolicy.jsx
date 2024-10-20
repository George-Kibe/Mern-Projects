import React from "react";

const PrivacyPolicy = () => {
  return (
    <section className="bg-white text-primary container mx-auto mt-8 md:px-24 p-8">
      <h2 className="md:text-4xl text-3xl font-medium md:leading-tight pt-8 pb-5">
        Privacy Policy
      </h2>

      <div className="space-y-6">
        <p>
          At hotels-with.com, accessible from{" "}
          <a href="/" className="text-blue-400 underline">
            https://hotels-rooftop.com/
          </a>
          , one of our main priorities is the privacy of our visitors. This
          Privacy Policy document contains types of information that is
          collected and recorded by hotels-with.com and how we use it.
        </p>
        <p>
          If you have additional questions or require more information about our
          Privacy Policy, do not hesitate to contact us.
        </p>
        <p>
          This Privacy Policy applies only to our online activities and is valid
          for visitors to our website with regards to the information that they
          shared and/or collect in hotels-with.com. This policy is not
          applicable to any information collected offline or via channels other
          than this website.
        </p>
      </div>

      <div className="space-y-6 pt-5">
        <h3 className="text-2xl font-medium">Consent</h3>
        <p>
          By using our website, you hereby consent to our Privacy Policy and
          agree to its terms.
        </p>

        <h3 className="text-2xl font-medium">Information we collect</h3>
        <p>
          The personal information that you are asked to provide, and the
          reasons why you are asked to provide it, will be made clear to you at
          the point we ask you to provide your personal information.
        </p>
        <p>
          If you contact us directly, we may receive additional information
          about you such as your name, email address, phone number, the contents
          of the message and/or attachments you may send us, and any other
          information you may choose to provide.
        </p>
        <p>
          When you register for an Account, we may ask for your contact
          information, including items such as name, company name, address,
          email address, and telephone number.
        </p>
      </div>

      <div className="space-y-6 pt-5">
        <h3 className="text-2xl font-medium">How we use your information</h3>
        <p>We use the information we collect in various ways, including to:</p>
        <ul className="list-disc pl-8">
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our website</li>
          <li>Develop new products, services, features, and functionality</li>
          <li>
            Communicate with you, either directly or through one of our
            partners, including for customer service,
            <br />
            to provide you with updates and other information relating to the
            website, and for marketing and promotional purposes
          </li>
          <li>Send you emails</li>
          <li>Find and prevent fraud</li>
        </ul>
      </div>

      <div className="space-y-6 pt-5">
        <h3 className="text-2xl font-medium">Log Files</h3>
        <p>
          hotels-with.com follows a standard procedure of using log files. These
          files log visitors when they visit websites. All hosting companies do
          this and a part of hosting services’ analytics. The information
          collected by log files include internet protocol (IP) addresses,
          browser type, Internet Service Provider (ISP), date and time stamp,
          referring/exit pages, and possibly the number of clicks. These are not
          linked to any information that is personally identifiable. The purpose
          of the information is for analyzing trends, administering the site,
          tracking users’ movement on the website, and gathering demographic
          information.
        </p>

        <h3 className="text-2xl font-medium">Cookies and Web Beacons</h3>
        <p>
          Like any other website, hotels-with.com uses ‘cookies’. These cookies
          are used to store information including visitors’ preferences, and the
          pages on the website that the visitor accessed or visited. The
          information is used to optimize the users’ experience by customizing
          our web page content based on visitors’ browser type and/or other
          information.
        </p>

        <h3 className="text-2xl font-medium">Our Advertising Partners</h3>
        <p>
          Some of advertisers on our site may use cookies and web beacons. Our
          advertising partners are listed below. Each of our advertising
          partners has their own Privacy Policy for their policies on user data.
          For easier access, we hyperlinked to their Privacy Policies below.
        </p>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
