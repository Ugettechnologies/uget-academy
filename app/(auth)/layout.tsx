import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* Sleek premium glass overlay to preserve readability while maintaining the abstract waves structure */}
      <div className="absolute inset-0 bg-[#0a0f1d]/85 pointer-events-none" />
      
      {/* Subtle brand color glow lights over the texture */}
      <div className="absolute top-[-30%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-[#2563EB]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-[#60A5FA]/5 blur-[120px] pointer-events-none" />

      {/* Centered card wrapper inspired by Resend's layout but with brand navy/slate backdrop blur */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#1E293B]/40 border border-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/60">
        {children}
      </div>
    </div>
  );
}
