// frontend/src/components/OtpSentAnimation.jsx
import { useEffect } from "react";
import Lottie from "lottie-react";
import animationData from "../assets/otp-sent.json";

export default function OtpSentAnimation({ onFinished }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished();
    }, 1800); // animation timing

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-2xl shadow-xl w-64 flex flex-col items-center">
        <Lottie animationData={animationData} loop={false} style={{ height: 130 }} />
        <p className="mt-2 text-center font-semibold text-blue-700">OTP Sent!</p>
      </div>
    </div>
  );
}
