import { memo } from 'react';
import { Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast = memo(function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-[#FF4D12]/45 bg-[#141414] px-4 py-2.5 text-xs font-mono-tech text-white shadow-2xl">
      <Sparkles className="w-3.5 h-3.5 text-[#FF4D12]" />
      <span>{message}</span>
    </div>
  );
});

