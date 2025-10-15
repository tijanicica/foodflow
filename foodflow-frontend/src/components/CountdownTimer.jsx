// src/components/CountdownTimer.jsx
import React, { useState, useEffect } from "react";

// Prop se zove `assignedAt` radi generičnosti, ali mi ćemo mu proslediti `creationTime`
const CountdownTimer = ({ assignedAt, durationInSeconds = 120 }) => {
  const calculateTimeLeft = () => {
    const startTime = new Date(assignedAt).getTime();
    const deadline = startTime + durationInSeconds * 1000;
    const now = new Date().getTime();
    const difference = deadline - now;

    return difference > 0 ? Math.floor(difference / 1000) : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const progressPercentage = (timeLeft / durationInSeconds) * 100;

  return (
    <div className="w-32">
      <div className="flex items-center justify-between text-xs font-mono mb-1">
        <span>Response Time</span>
        <span
          className={timeLeft < 30 ? "text-red-500 font-bold" : "text-gray-600"}
        >
          {minutes}:{seconds}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-colors duration-500 ${
            progressPercentage > 50
              ? "bg-green-500"
              : progressPercentage > 25
              ? "bg-orange-500"
              : "bg-red-500"
          }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CountdownTimer;
