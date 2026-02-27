import React, { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIn = async () => {
    setIsLoading(true);
    setStatus("");

    try {
      // 1. Get MAC address from Electron API
      const mac = await window.api.getMacAddress();

      if (!mac) {
        setStatus("Error: Could not retrieve MAC address.");
        setIsLoading(false);
        return;
      }

      // 2. Send to backend
      const response = await fetch("http://localhost:3000/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mac }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(`Success: ${result.message}`);
      } else {
        setStatus(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Check-in error:", error);
      setStatus("Error: Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="glass-panel">
        <h1 className="title">Xin chào</h1>
        <p className="subtitle">Secure Timekeeping System</p>

        <div className="action-area">
          <button
            className={`checkin-btn ${isLoading ? "loading" : ""}`}
            onClick={handleCheckIn}
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner"></span> : "Check In"}
          </button>
        </div>

        {status && (
          <div
            className={`status-message ${status.startsWith("Success") ? "success" : "error"}`}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
