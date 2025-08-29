const API_URL = "http://localhost:5000/api";

// Fetch all campaigns
export const getCampaigns = async () => {
    try {
        const response = await fetch(`${API_URL}/campaigns`);
        if (!response.ok) throw new Error("Failed to load campaigns");
        return await response.json();
    } catch (error) {
        console.warn("Falling back to default campaigns:", error.message);

        return [
            {
                id: 1,
                name: "Black Friday Mega Sale",
                status: "active",
                recipients: 15420,
                sent: 0,
                opens: 10457,
                openRate: 67.8,
                clicks: 3781,
                replies: 0,
                revenue: "$12,300",
                clickRate: 24.5,
            },
            {
                id: 2,
                name: "Product Launch Newsletter",
                status: "completed",
                recipients: 8930,
                sent: 0,
                opens: 4840,
                openRate: 54.2,
                clicks: 1670,
                replies: 0,
                revenue: "$5,400",
                clickRate: 18.7,
            },
        ];
    }
};

// Delete campaign
export const deleteCampaign = async (id) => {
    const response = await fetch(`${API_URL}/campaigns/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete campaign");
    return true;
};
