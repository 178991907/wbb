import React from 'react';
import Image from 'next/image';

interface LogoDisplayProps {
  logoUrl?: string;
  siteName?: string;
}

export function LogoDisplay({ logoUrl, siteName = "Site Logo" }: LogoDisplayProps) {
  if (logoUrl) {
    return (
      <div className="flex flex-col items-center justify-center select-none">
        <Image
          src={logoUrl}
          alt={siteName}
          width={600} // Updated width
          height={200} // Updated height
          className="rounded-md object-contain mb-2"
          data-ai-hint="logo company"
          priority // Adding priority as it's likely LCP
        />
         {/* Optionally display site name below image if needed
        <p className="text-xl font-semibold text-foreground">{siteName}</p>
        */}
      </div>
    );
  }

  // Fallback to the original styled logo if no logoUrl is provided
  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="flex items-center space-x-1 mb-1">
        <span className="bg-red-500 text-white text-3xl font-bold px-3 py-1 rounded transform -skew-x-6">K</span>
        <span className="bg-orange-400 text-white text-3xl font-bold px-3 py-1 rounded transform -skew-x-6">e</span>
        <span className="bg-green-500 text-white text-3xl font-bold px-3 py-1 rounded transform -skew-x-6">T</span>
        <span className="text-blue-600 text-5xl font-bold ml-2">Erin</span>
      </div>
      <div className="text-center">
        <p className="text-xl font-semibold text-foreground">全科启蒙</p>
        <p className="text-xs text-muted-foreground">0-12岁</p>
      </div>
    </div>
  );
}
