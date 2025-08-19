import { useContext } from "react";
import { CampaignContext } from "../contexts/CampaignContext";

/**
 * Custom hook to easily access campaigns and actions
 */
const useCampaigns = () => {
    const context = useContext(CampaignContext);
    if (!context) {
        throw new Error("useCampaigns must be used within a CampaignProvider");
    }
    return context;
};

export default useCampaigns;
