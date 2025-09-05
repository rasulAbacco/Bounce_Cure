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

export const getEmails = async () => {
    const response = await fetch('http://localhost:5000/api/emails');
    if (!response.ok) throw new Error('Failed to fetch emails');
    return await response.json();
};
