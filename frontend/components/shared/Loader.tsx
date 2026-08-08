import React from "react";

export const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0d0f] bg-grid-pattern">
      {/* Soft radial mint gradient in background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,153,0.07)_0%,transparent_60%)] pointer-events-none" />
      
      {/* Terminal loader window */}
      <div className="terminal-loader border border-[#1e242b] bg-[#121518]/95 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.6),0_0_30px_rgba(0,229,153,0.04)] backdrop-blur-md">
        <div className="terminal-header">
          <div className="terminal-title">Status</div>
          <div className="terminal-controls">
            <div className="control close" />
            <div className="control minimize" />
            <div className="control maximize" />
          </div>
        </div>
        <div className="text">Loading...</div>
      </div>
    </div>
  );
};
