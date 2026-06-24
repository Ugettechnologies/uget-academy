import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const dimensions = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-20 w-auto',
  };

  const pxSizes = {
    sm: 32,
    md: 48,
    lg: 80,
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo-clean.png"
        alt="UGET Logo"
        width={pxSizes[size] * 3}
        height={pxSizes[size]}
        className={`${dimensions[size]} object-contain`}
        priority
      />
      {showText && (
        <span className="font-sans font-bold tracking-tight text-white select-none text-xl">
          UGET <span className="text-[#60A5FA] font-medium">Academy</span>
        </span>
      )}
    </div>
  );
}
