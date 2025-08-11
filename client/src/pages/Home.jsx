import React from "react";
import {
  CheckCircle,
  Eye,
  Shield,
  TrendingUp,
  Mail,
  Users,
  Clock,
} from "lucide-react";
import mailveri from "../assets/mailveri.png";

function Home() {
 return (
  <div className="text-white">
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-[#c2831f]">
            Why use an email verification service?
          </h1>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Boost email campaign performance */}
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Boost email campaign performance
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Our email verification service will improve your campaigns by
                identifying the most high-quality subscribers on your list.
                Deliver more emails to real people who are engaged with your
                brand and want to hear from you.
              </p>
            </div>
          </div>

          {/* Improve your inbox visibility */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Improve your inbox visibility
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Protect your IP and domain reputation by removing inactive
                subscribers from your campaigns. Better deliverability means
                higher inbox placement and more engagement from your audience.
              </p>
            </div>
          </div>

          {/* Reduce your email bounce rate */}
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 p-3 rounded-full flex-shrink-0">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Reduce your email bounce rate
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Email verification services are the only reliable way to stop
                email bounces. They detect misspelled addresses and filter out
                inactive accounts so you only send to engaged subscribers.
              </p>
            </div>
          </div>

          {/* Increase your email ROI */}
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 p-3 rounded-full flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Increase your email ROI
              </h3>
              <p className="text-gray-300 leading-relaxed">
                ROI benefits like using safety prevention and Spam Scoring.
                Email verification and threat reports present your ROI. With a
                good email list, more emails get delivered to engaged
                subscribers.
              </p>
            </div>
          </div>
        </div>

        {/* How to use section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-[#c2831f]">
            How to use the BounceCure email verification service
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Features */}
          <div className="space-y-12">
            {/* Check new emails on the go */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100">
                <Mail className="w-32 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Check new emails on the go
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  You can upload a new batch of subscribers, validate them
                  quickly and make it very simple to verify your CRM or mailing
                  list, so there are less bounces.
                </p>
              </div>
            </div>

            {/* A bulk email verification service */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-100">
                <Users className="w-32 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  A bulk email verification service
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Even new brands about your list. Upload your customer
                  database to this bulk email verification service and get the
                  full scoop on email engagement and deliverability rates.
                </p>
              </div>
            </div>

            {/* Real-time email verification service */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100">
                <Clock className="w-32 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Real-time email verification service
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  You can have access through their existing spam email
                  monitoring via website/tools with real-time API in use and old
                  bad email addresses based on your subscriber and contact that
                  match.
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Dashboard Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="rounded-lg shadow-lg overflow-hidden">
              <img src="/Home/email.png" alt="Mail Verification" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/*  */}

    <section className="py-16 px-6 md:px-20">
      <div className="text-center max-w-4xl mx-auto mb-12 px-4">
        <h3 className="font-semibold text-lg text-white">
          Beyond Email Verification:
        </h3>
        <h1 className="text-3xl md:text-4xl font-bold text-[#c2831f] mt-2">
          Email Deliverability Consulting
        </h1>
        <p className="text-gray-300 mt-4 leading-relaxed">
          Our team of experts is here to guide you through the complex world
          of email deliverability. From comprehensive audits to tailored
          advice, we provide actionable insights to optimize your email
          campaigns and reach the inbox consistently.
        </p>
      </div>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left Side - Image */}
        <div className="flex justify-center">
          <img
            src="../public/home/delivary.png"
            alt="delivary"
            className="max-w-md w-full drop-shadow-lg"
          />
        </div>

        {/* Right Side - Content */}
        <div>
          {/* Features */}
          <ul className="space-y-5">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-green-600 w-6 h-6 flex-shrink-0" />
              <p>
                <span className="font-semibold text-white">
                  Deliverability Audits:
                </span>{" "}
                Comprehensive analysis of your email infrastructure,
                practices, and performance.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-blue-600 w-6 h-6 flex-shrink-0" />
              <p>
                <span className="font-semibold text-white">
                  Strategic Recommendations:
                </span>{" "}
                Tailored action plans designed to improve your inbox placement
                and sender reputation.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-pink-600 w-6 h-6 flex-shrink-0" />
              <p>
                <span className="font-semibold text-white">
                  Ongoing Support:
                </span>{" "}
                Benefit from our continuous monitoring and expert advice as you
                refine your email strategies.
              </p>
            </li>
          </ul>

          {/* Buttons */}
          <div className="mt-8 flex gap-4 ">
            <button className="bg-[#c2831f] text-white px-6 py-3 rounded-lg shadow hover:bg-[#c2831f] transition cursor-pointer">
              SCHEDULE A CONSULTATION
            </button>
            <button className="border-2 border-[#c2831f] text-white px-6 py-3 rounded-lg hover:bg-[#c2831f] transition cursor-pointer">
              SEE SERVICES
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>

);

}

export default Home;
