import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Components/Layout/Layout";
import { Plus, Mail } from "lucide-react"; // icons

const CreateCampaign = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="bg-white text-black p-10 rounded-2xl shadow-xl w-full max-w-4xl">
                    {/* Header */}
                    <h1 className="text-2xl font-bold mb-2">Create New Campaign</h1>
                    <p className="text-gray-600 mb-8">Choose how you want to start</p>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Start from Scratch */}
                        <div
                            onClick={() => navigate("/editor/new?scratch=true")}
                            className="cursor-pointer border-2 border-yellow-500 rounded-xl p-8 text-center hover:shadow-lg transition"
                        >
                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-yellow-100">
                                    <Plus className="text-yellow-600 w-7 h-7" />
                                </div>
                            </div>
                            <h2 className="text-lg font-semibold mb-2">Start from Scratch</h2>
                            <p className="text-gray-600 text-sm">
                                Create a completely custom campaign with your own content and design
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                                • Full customization • Advanced options
                            </p>
                        </div>

                        {/* Choose Template */}
                        <div
                            onClick={() => navigate("/editor/new?template=true")}
                            className="cursor-pointer border-2 border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition"
                        >
                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100">
                                    <Mail className="text-gray-600 w-7 h-7" />
                                </div>
                            </div>
                            <h2 className="text-lg font-semibold mb-2">Choose Template</h2>
                            <p className="text-gray-600 text-sm">
                                Start with a professionally designed template and customize it to your needs
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                                • 50+ templates • Proven designs
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CreateCampaign;
