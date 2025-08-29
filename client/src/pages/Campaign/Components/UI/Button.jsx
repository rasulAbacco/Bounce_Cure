import React from "react";

const Button = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center gap-2 px-5 py-2 
                 font-semibold bg-[#dfa13f] text-white rounded-md overflow-hidden
                 transition-all duration-300 ease-out
                 hover:text-[#dfa13f] hover:bg-transparent hover:border hover:border-[#dfa13f]
                 group"
    >
      <span className="flex items-center font-bold  gap-2 relative z-10">
        {children}
      </span>
      
      {/* Shine effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r 
                       from-transparent via-white/30 to-transparent 
                       -translate-x-full group-hover:translate-x-full 
                       transition-transform duration-700 ease-out"></span>
    </button>
  );
};

export default Button;
