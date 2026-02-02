"use client";

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-16 w-16">
            <svg
              className="animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-200"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-slate-900"
              />
            </svg>
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Loading Inventory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Please wait while we fetch your data...
            </p>
          </div>

          <div className="flex gap-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-slate-900" />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-slate-900"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-slate-900"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
