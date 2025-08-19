// Placeholder API simulation

export const getCampaigns = () => {
    return Promise.resolve([
        { id: 1, name: "Summer Sale", status: "Sent", clicks: 120, conversions: 30 },
        { id: 2, name: "Product Launch", status: "Draft", clicks: 0, conversions: 0 },
    ]);
};

export const saveCampaign = (campaign) => {
    return Promise.resolve({ success: true, campaign });
};
