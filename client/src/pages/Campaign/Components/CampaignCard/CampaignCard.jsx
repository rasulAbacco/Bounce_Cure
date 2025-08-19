import React from 'react';

const CampaignCard = ({ campaign }) => {
    return (
        <div className="border p-4 rounded shadow-sm bg-black">
            <h2 className="font-bold">{campaign.name}</h2>
            <p>Status: {campaign.status}</p>
            <p>Clicks: {campaign.clicks}</p>
            <p>Conversions: {campaign.conversions}</p>
        </div>
    );
};

export default CampaignCard;
