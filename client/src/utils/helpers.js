/**
 * Utility: Format numbers into readable strings
 */
export const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
};

/**
 * Utility: Format dates into dd/mm/yyyy
 */
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB");
};
