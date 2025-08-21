import React from 'react';

const Button = ({ children, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 font-bold bg-[#dfa13f] text-white rounded hover:bg-white hover:text-[#dc9627]"
        >
            {children}
        </button>
    );
};

export default Button;
