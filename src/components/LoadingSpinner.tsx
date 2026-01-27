"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated dots */}
      <div className="flex justify-center gap-1 pt-2">
        <span
          className="w-1.5 h-1.5 rounded-full bg-brand-navy animate-bounce"
          style={{ animationDelay: "0s" }}
        ></span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-brand-navy animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-brand-navy animate-bounce"
          style={{ animationDelay: "0.4s" }}
        ></span>
      </div>
    </div>
  );
}
