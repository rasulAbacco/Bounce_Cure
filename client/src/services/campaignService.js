// services/campaignService.js

export const getCampaigns = () => {
    return Promise.resolve([
        {
            id: 1,
            name: "Black Friday Mega Sale",
            description: "🔥 Massive Black Friday Deals - Up to 70% Off!",
            status: "Active",
            recipients: 15420,
            opens: 10457,
            clicks: 3781,
            openRate: 67.8,
            clickRate: 24.5,
            revenue: "$24,850",
        },
        {
            id: 2,
            name: "Product Launch Newsletter",
            description: "Introducing Our Revolutionary New Product",
            status: "Completed",
            recipients: 8930,
            opens: 4840,
            clicks: 1670,
            openRate: 54.2,
            clickRate: 18.7,
            revenue: "$12,400",
        },
        {
            id: 3,
            name: "Customer Feedback Survey",
            description: "We Value Your Opinion – Quick 2-Minute Survey",
            status: "Paused",
            recipients: 5670,
            opens: 1565,
            clicks: 998,
            openRate: 48.9,
            clickRate: 31.2,
            revenue: "-",
        },
        {
            id: 4,
            name: "Weekly Digest #23",
            description: "Weekly Insights & Industry Updates",
            status: "Draft",
            recipients: 12850,
            opens: 0,
            clicks: 0,
            openRate: 0,
            clickRate: 0,
            revenue: "-",
        },
    ]);
};

export const saveCampaign = (campaign) => {
    return Promise.resolve({ success: true, campaign });
};
