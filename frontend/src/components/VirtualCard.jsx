// frontend/src/components/VirtualCard.jsx
import { FiWifi } from "react-icons/fi";

export default function VirtualCard({ name, last4 }) {
  return (
    <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white p-6 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

      {/* Glossy highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30 pointer-events-none"></div>

      {/* Top Row: Logo + NFC */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-lg font-bold tracking-wide">HORIZON</h2>

        <FiWifi size={26} className="rotate-90 opacity-90" />
      </div>

      {/* Card Number */}
      <div className="text-2xl font-mono tracking-widest mb-8 relative z-10">
        <span>**** **** **** </span>
        <span className="font-bold">{last4}</span>
      </div>

      {/* Card Chip */}
      <div className="relative z-10 mb-8">
        <div className="w-12 h-9 bg-yellow-300 rounded-md shadow-md border border-yellow-200"></div>
      </div>

      {/* Bottom Section */}
      <div className="flex justify-between items-end relative z-10">

        {/* Card Holder */}
        <div>
          <p className="text-xs opacity-70">CARD HOLDER</p>
          <p className="font-semibold text-lg tracking-wide">{name}</p>
        </div>

        {/* Expiry */}
        <div>
          <p className="text-xs opacity-70">VALID THRU</p>
          <p className="font-semibold tracking-wide">12 / 28</p>
        </div>

        {/* Card Brand */}
        <div className="flex flex-col items-end">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
            alt="visa"
            className="w-12 opacity-90"
          />
        </div>
      </div>

    </div>
  );
}
