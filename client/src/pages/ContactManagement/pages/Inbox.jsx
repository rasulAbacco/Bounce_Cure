//client/src/pages/ContactManagement/pages/Inbox.jsx
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

const InboxPage = () => {
  return (

    <Inbox /> 
  )
  
}
export default InboxPage;
