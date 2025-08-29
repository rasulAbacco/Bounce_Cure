import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wand2, LayoutTemplate, ChevronRight, X, ArrowLeft } from 'lucide-react';

const TemplateCard = ({ template, onSelect }) => {
    return (
        <div
            className="border border-gray-700 rounded-lg overflow-hidden hover:border-[#c2831f] transition-colors cursor-pointer"
            onClick={onSelect}
        >
            <div className="h-40 bg-gray-800 flex items-center justify-center">
                <div className="text-gray-500 text-sm">Template Preview</div>
            </div>
            <div className="p-4 bg-gray-900">
                <h3 className="font-medium text-white">{template.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{template.description}</p>
                <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Used {template.usage} times</span>
                    <button className="text-[#c2831f] hover:text-[#d6932a] text-sm font-medium flex items-center">
                        Select <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const templates = [
    {
        id: 1,
        name: 'Welcome Series',
        description: 'Onboard new subscribers',
        usage: 1243,
        category: 'onboarding'
    },
    {
        id: 2,
        name: 'Product Launch',
        description: 'Announce new products',
        usage: 876,
        category: 'promotional'
    },
    {
        id: 3,
        name: 'Newsletter',
        description: 'Regular updates',
        usage: 1567,
        category: 'newsletter'
    },
];

function NewCampaign() {
    const [searchParams] = useSearchParams();
    const [campaignData, setCampaignData] = useState({
        name: '',
        type: 'email',
        subject: '',
        content: '',
        templateId: null
    });

    const creationType = searchParams.get('type') || 'scratch';
    const [step, setStep] = useState(1);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCampaignData(prev => ({ ...prev, [name]: value }));
    };

    const handleTemplateSelect = (template) => {
        setCampaignData(prev => ({ ...prev, templateId: template.id }));
        setStep(2);
    };

    const renderContent = () => {
        if (creationType === 'scratch') {
            return (
                <div className="mt-6">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center text-gray-400 hover:text-white mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-1" /> Back
                    </button>

                    <h2 className="text-xl font-bold mb-6">Build New Campaign from Scratch</h2>

                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Campaign Name</label>
                            <input
                                name="name"
                                value={campaignData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. Summer Sale 2023"
                                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:border-[#c2831f] focus:ring-[#c2831f]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Campaign Type</label>
                            <select
                                name="type"
                                value={campaignData.type}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:border-[#c2831f] focus:ring-[#c2831f]"
                            >
                                <option value="email">Email Campaign</option>
                                <option value="sequence">Email Sequence</option>
                                <option value="social">Social Media</option>
                            </select>
                        </div>

                        {campaignData.type === 'email' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Email Subject</label>
                                <input
                                    name="subject"
                                    value={campaignData.subject}
                                    onChange={handleInputChange}
                                    placeholder="Subject line that gets opens"
                                    className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:border-[#c2831f] focus:ring-[#c2831f]"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                            <textarea
                                name="content"
                                value={campaignData.content}
                                onChange={handleInputChange}
                                rows="8"
                                placeholder="Write your campaign content here..."
                                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:border-[#c2831f] focus:ring-[#c2831f]"
                                required
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-[#c2831f] px-6 py-2 rounded-lg text-white hover:bg-[#b2751c]"
                            >
                                Create Campaign
                            </button>
                        </div>
                    </form>
                </div>
            );
        }

        if (creationType === 'template') {
            if (step === 1) {
                return (
                    <div className="mt-6">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center text-gray-400 hover:text-white mb-4"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" /> Back
                        </button>

                        <h2 className="text-xl font-bold mb-6">Choose a Template</h2>

                        <div className="flex space-x-2 mb-6">
                            <button className="px-3 py-1 bg-gray-800 rounded text-sm">All</button>
                            <button className="px-3 py-1 bg-gray-700 rounded text-sm">Onboarding</button>
                            <button className="px-3 py-1 bg-gray-700 rounded text-sm">Promotional</button>
                            <button className="px-3 py-1 bg-gray-700 rounded text-sm">Newsletter</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map(template => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onSelect={() => handleTemplateSelect(template)}
                                />
                            ))}
                        </div>
                    </div>
                );
            }

            if (step === 2) {
                return (
                    <div className="mt-6">
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center text-gray-400 hover:text-white mb-4"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" /> Back to Templates
                        </button>

                        <h2 className="text-xl font-bold mb-6">Customize Template</h2>

                        <div className="border border-gray-700 rounded-lg p-6 bg-gray-800">
                            <div className="flex">
                                <div className="w-1/4 pr-4 border-r border-gray-700">
                                    <h3 className="font-medium text-white mb-3">Content Blocks</h3>
                                    <div className="space-y-2">
                                        <div className="p-2 bg-gray-700 rounded text-sm cursor-move">Header</div>
                                        <div className="p-2 bg-gray-700 rounded text-sm cursor-move">Text</div>
                                        <div className="p-2 bg-gray-700 rounded text-sm cursor-move">Image</div>
                                        <div className="p-2 bg-gray-700 rounded text-sm cursor-move">Button</div>
                                        <div className="p-2 bg-gray-700 rounded text-sm cursor-move">Footer</div>
                                    </div>
                                </div>
                                <div className="w-3/4 pl-4">
                                    <div className="border border-gray-600 p-4 bg-white text-gray-800">
                                        <div className="text-center py-10">Email Content Preview</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                className="bg-[#c2831f] px-6 py-2 rounded-lg text-white hover:bg-[#b2751c]"
                            >
                                Create Campaign
                            </button>
                        </div>
                    </div>
                );
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
                {renderContent()}
            </div>
        </div>
    );
}

export default NewCampaign;