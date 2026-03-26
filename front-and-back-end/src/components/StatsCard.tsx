"use client";

import { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value?: string | number;
  unit?: string;
  children?: ReactNode; // For custom content like charts
  className?: string;
};

export default function StatsCard({
  title,
  value,
  unit,
  children,
  className = "",
}: StatsCardProps) {
  return (
    <div
      className={`bg-[#36393f] rounded-xl shadow-lg p-6 border border-[#72767d] text-[#dcddde] ${className}`}
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {children ? (
        <div className="w-full">{children}</div>
      ) : (
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-[#5865f2]">{value}</p>
          {unit && <p className="text-sm opacity-75">{unit}</p>}
        </div>
      )}
    </div>
  );
}
