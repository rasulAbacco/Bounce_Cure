import React, { createContext, useState } from 'react';

export const CampaignContext = createContext();

export const CampaignProvider = ({ children }) => {
    const [campaigns, setCampaigns] = useState([]);

    const addCampaign = (campaign) => {
        setCampaigns((prev) => [...prev, { ...campaign, id: Date.now() }]);
    };

    return (
        <CampaignContext.Provider value={{ campaigns, addCampaign }}>
            {children}
        </CampaignContext.Provider>
    );
};
