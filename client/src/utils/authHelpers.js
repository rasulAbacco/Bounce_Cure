// src/utils/authHelpers.js

// ==================== Token Helpers ====================

// Save token in localStorage
export const setToken = (token) => {
    localStorage.setItem("authToken", token);
};

// Get token from localStorage
export const getToken = () => {
    return localStorage.getItem("authToken");
};

// Remove token
export const removeToken = () => {
    localStorage.removeItem("authToken");
};

// ==================== Auth Status ====================
export const isLoggedIn = () => {
    return !!getToken();
};

// ==================== Format Helpers ====================
export const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
};

// Mask Email (e.g., test***@gmail.com)
export const maskEmail = (email) => {
    const [name, domain] = email.split("@");
    return `${name.slice(0, 3)}***@${domain}`;
};

// Mask Phone (e.g., +91*****1234)
export const maskPhone = (phone) => {
    return phone.replace(/.(?=.{4})/g, "*");
};
