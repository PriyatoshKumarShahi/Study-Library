// Loader.jsx
import React from "react";

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center  z-50 transition-opacity duration-300">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gray-800/90 border border-gray-700 shadow-2xl animate-fadeIn">
        
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        
        {/* Message */}
        <span className="text-gray-200 text-lg font-medium tracking-wide">
          {message}
        </span>
      </div>
    </div>
  );
}
