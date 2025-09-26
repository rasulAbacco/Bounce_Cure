// export const getEmails = async () => {
//     // Replace with actual API call later
//     return [
//         {
//             id: '1',
//             from: 'lead@example.com',
//             to: 'you@crm.com',
//             subject: 'New Lead Opportunity',
//             body: 'Hi there! I’m interested in your product...',
//             date: new Date().toISOString(),
//             tags: ['lead'],
//             status: 'unread',
//         },
//         {
//             id: '2',
//             from: 'marketing@agency.com',
//             to: 'you@crm.com',
//             subject: 'Marketing Campaign Stats',
//             body: 'Here’s the performance breakdown...',
//             date: new Date().toISOString(),
//             tags: ['marketing'],
//             status: 'read',
//         },
//     ];
// };
const API_URL = import.meta.env.VITE_VRI_URL;
export const getEmails = async () => {
    const response = await fetch(`${API_URL}/api/emails`);
    if (!response.ok) throw new Error('Failed to fetch emails');
    return await response.json();
};
