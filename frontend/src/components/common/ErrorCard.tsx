import React from 'react';

interface ErrorCardProps {
  message: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ message }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-2xl border border-rose-500/30 bg-slate-950/95 px-4 py-3 text-sm text-rose-100 shadow-2xl backdrop-blur-md animate-fade-in">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
          !
        </span>
        <p className="leading-5">{message}</p>
      </div>
    </div>
  );
};