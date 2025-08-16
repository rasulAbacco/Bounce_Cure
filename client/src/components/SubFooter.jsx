import React from 'react'
import { FaExclamationTriangle } from "react-icons/fa";

const SubFooter = () => {
    return (
        <div>
            {/* Disclaimers Section - Top */}
            <div className="bg-black text-left font-light text-sm py-8 px-10 max-w-7xl mx-auto leading-relaxed mb-5 flex flex-col items-center">
                <p className="flex items-center gap-2 font-semibold mb-6 text-2xl text-white">
                    <FaExclamationTriangle className="text-yellow-400" />Disclaimer :</p>
                <ul className="list-disc list-inside space-y-5 text-gray-300 text-base max-w-full">

                    <li className='text-base/[25px] '>
                        <strong>Boost Your Sales with Automated Marketing:</strong> Users leveraging marketing automation
                        through their connected stores generate up to <strong>4x more orders</strong> compared to those relying
                        on bulk email campaigns. Automated workflows like welcome series, cart abandonment reminders,
                        and personalized product recommendations deliver timely and relevant messages that drive higher engagement and conversions.
                    </li>

                    <li className='text-base/[25px]'>
                        <strong>Email Marketing – The Power of Automation:</strong> In 2025, automated emails outperform traditional bulk emails by generating <strong>8 times more opens</strong> and significantly higher revenue.
                        Marketers using automation see <strong>320% more revenue</strong> than those who don't.
                    </li>

                    <li className='text-base/[25px]'>
                        With an average ROI of <strong>$43 for every $1 spent</strong>, email marketing remains the most cost-effective digital channel.
                    </li>

                    <li className='text-base/[25px]'>
                        <strong>SMS Marketing – Instant Engagement:</strong> SMS marketing continues to thrive in 2025, boasting an average open rate of <strong>98%</strong>.
                        In the U.S., SMS is available as an add-on to paid plans, with credits issued monthly upon purchase.
                        Unused credits expire and do not roll over, and pricing varies depending on the provider.
                    </li>

                    <li className='text-base/[25px]'>
                        Integrating SMS with email campaigns can enhance engagement and conversions, especially for time-sensitive promotions and reminders.
                    </li>

                    <li className='text-base/[25px]'>
                        <strong>Why Choose Bounce Cure?</strong>
                             <ul className="list-disc list-inside ml-6 space-y-2 mt-2">

                        <li className='list-none '><strong>Comprehensive Automation:</strong> Seamlessly integrate email and SMS marketing to create cohesive, multi-channel campaigns.</li>
                        <li className='list-none'><strong>Data-Driven Insights:</strong> Utilize predictive analytics to segment your audience and personalize messaging for maximum impact.</li>
                        <li className='list-none'><strong>Scalable Solutions:</strong> Whether you're a small business or a large enterprise, our platform adapts to your needs and grows with you.</li>
                          </ul>
                    </li>

                    <li className='text-base/[25px]'>
                        Experience the future of marketing with Bounce Cure. Our platform empowers you to automate, personalize, and optimize your campaigns, driving higher engagement and revenue.
                    </li>


                </ul>
                <p className="mt-6 text-base/[20px] italic text-md font-bold">
                    For any questions regarding compliance, data handling, or platform usage, please contact our support team.
                </p>
            </div>




        </div>
    )
}

export default SubFooter