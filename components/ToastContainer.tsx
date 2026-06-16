"use client";

import { useEffect, useState } from "react";
import { subscribeToasts, ToastItem } from "@/lib/toast";

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => subscribeToasts(setToasts), []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium
                        pointer-events-auto backdrop-blur-sm animate-in slide-in-from-right-4 fade-in duration-200
                        ${t.type === "success"
                            ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
                            : t.type === "error"
                            ? "bg-red-950/90 border-red-500/30 text-red-300"
                            : "bg-indigo-950/90 border-indigo-500/30 text-indigo-300"
                        }`}
                >
                    {t.type === "success" && (
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {t.type === "error" && (
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    {t.type === "info" && (
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    {t.message}
                </div>
            ))}
        </div>
    );
}