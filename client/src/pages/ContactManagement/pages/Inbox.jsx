import React, { useState, useEffect } from "react";
import {
  Mail,
  Trash2,
  Star,
  StarOff,
  CheckSquare,
  Square,
  Search,
} from "lucide-react";
import AddEmailModal from "./AddEmailForm";
import Inbox from "../../../components/inbox/Inbox";
const API_URL = import.meta.env.VITE_VRI_URL;
// const InboxPage = () => {
//   const [mails, setMails] = useState([]);
//   const [accounts, setAccounts] = useState([]);
//   const [selectedMail, setSelectedMail] = useState(null);
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [selectedAccount, setSelectedAccount] = useState("all");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch accounts
//   useEffect(() => {
//     const fetchAccounts = async () => {
//       try {
//         const res = await fetch(`${API_URL}/api/email-account`);
//         if (!res.ok) throw new Error("Failed to fetch accounts");
//         const data = await res.json();
//         setAccounts(data);
//       } catch (err) {
//         console.error("Failed to load accounts:", err);
//       }
//     };
//     fetchAccounts();
//   }, []);

//   // Fetch mails
//   useEffect(() => {
//     const fetchMails = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const endpoint =
//           selectedAccount === "all"
//             ? `${API_URL}/api/emails`
//             : `${API_URL}/api/emails?accountId=${selectedAccount}`;
//         const res = await fetch(endpoint);
//         if (!res.ok) throw new Error("Failed to fetch inbox");
//         const data = await res.json();
//         setMails(data);
//       } catch (err) {
//         console.error("Inbox fetch error:", err);
//         setError("Failed to load inbox.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMails();
//     const interval = setInterval(fetchMails, 60 * 1000); // refresh every minute
//     return () => clearInterval(interval);
//   }, [selectedAccount]);

//   // Toggle select
//   const toggleSelect = (id) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   // Delete selected
//   const deleteSelected = () => {
//     setMails((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
//     setSelectedIds([]);
//     setSelectedMail(null);
//   };

//   // Toggle star
//   const toggleStar = (id) => {
//     setMails((prev) =>
//       prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m))
//     );
//   };

//   // Filter + search
//   const filteredMails = mails.filter((mail) => {
//     if (
//       search &&
//       !mail.subject.toLowerCase().includes(search.toLowerCase()) &&
//       !mail.from.toLowerCase().includes(search.toLowerCase())
//     ) {
//       return false;
//     }
//     return true;
//   });

//   return (
//     <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
//       {/* Header */}
//       <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 bg-zinc-800">
//         <h1 className="text-xl font-semibold flex items-center gap-2">
//           <Mail className="w-5 h-5" /> Inbox
//         </h1>

//         {/* Dropdown for account selection */}
//         <select
//           value={selectedAccount}
//           onChange={(e) => setSelectedAccount(e.target.value)}
//           className="bg-zinc-700 text-white px-2 py-1 rounded-md text-sm"
//         >
//           <option value="all">📥 All Accounts</option>
//           {accounts.map((acc) => {
//             const unread = mails.filter(
//               (m) => m.accountId === acc.id && m.status === "unread"
//             ).length;
//             return (
//               <option key={acc.id} value={acc.id}>
//                 {acc.imapUser} {unread > 0 ? `(${unread})` : ""}
//               </option>
//             );
//           })}
//         </select>

//         <AddEmailModal />
//       </div>

//       {/* Content */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Mail List */}
//         <div className="w-1/3 border-r border-zinc-700 flex flex-col overflow-y-auto">
//           {/* Search bar */}
//           <div className="p-3 border-b border-zinc-700 bg-zinc-800 flex items-center gap-2">
//             <Search className="w-4 h-4 text-zinc-400" />
//             <input
//               type="text"
//               placeholder="Search mails..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="flex-1 bg-transparent outline-none text-sm placeholder-zinc-500"
//             />
//           </div>

//           {/* Loading/Error */}
//           {loading ? (
//             <p className="text-center text-zinc-500 py-6">Loading mails...</p>
//           ) : error ? (
//             <p className="text-center text-red-500 py-6">{error}</p>
//           ) : filteredMails.length > 0 ? (
//             <div className="overflow-y-auto flex-1">
//               {filteredMails.map((mail) => (
//                 <div
//                   key={mail.id}
//                   className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-800 cursor-pointer ${selectedMail?.id === mail.id
//                     ? "bg-zinc-800"
//                     : "hover:bg-zinc-800"
//                     }`}
//                 >
//                   <button onClick={() => toggleSelect(mail.id)}>
//                     {selectedIds.includes(mail.id) ? (
//                       <CheckSquare className="w-5 h-5 text-blue-400" />
//                     ) : (
//                       <Square className="w-5 h-5 text-zinc-500" />
//                     )}
//                   </button>
//                   <div
//                     className="flex-1"
//                     onClick={() => setSelectedMail(mail)}
//                   >
//                     <div className="flex justify-between text-sm font-medium">
//                       <span>{mail.from}</span>
//                       <span className="text-xs text-zinc-400">
//                         {new Date(mail.date).toLocaleTimeString()}
//                       </span>
//                     </div>
//                     <p
//                       className={`text-sm ${mail.status === "unread" ? "font-semibold" : ""
//                         }`}
//                     >
//                       {mail.subject}
//                     </p>
//                     <p className="text-xs text-zinc-500 truncate">
//                       {mail.body?.slice(0, 80)}
//                     </p>
//                   </div>
//                   <button onClick={() => toggleStar(mail.id)}>
//                     {mail.starred ? (
//                       <Star className="w-4 h-4 text-yellow-400" />
//                     ) : (
//                       <StarOff className="w-4 h-4 text-zinc-500" />
//                     )}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-center text-zinc-500 py-6">No mails found</p>
//           )}
//         </div>

//         {/* Mail Detail */}
//         <div className="flex-1 p-6 overflow-y-auto">
//           {selectedMail ? (
//             <>
//               <h2 className="text-lg font-semibold mb-1">
//                 {selectedMail.subject}
//               </h2>
//               <p className="text-sm text-zinc-400 mb-4">
//                 From: {selectedMail.from} •{" "}
//                 {new Date(selectedMail.date).toLocaleString()}
//               </p>
//               <div
//                 className="text-base leading-relaxed"
//                 dangerouslySetInnerHTML={{ __html: selectedMail.body }}
//               />
//             </>
//           ) : (
//             <div className="flex h-full items-center justify-center text-zinc-500">
//               Select a mail to read
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Bulk delete button */}
//       {selectedIds.length > 0 && (
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
//           <button
//             onClick={deleteSelected}
//             className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm"
//           >
//             <Trash2 className="w-4 h-4" /> Delete Selected
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

const InboxPage = () => {
  return (

    <Inbox /> 
  )
  
}
export default InboxPage;
