"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Token de verificação não encontrado.");
            return;
        }

        fetch(`/api/auth/verify-email?token=${token}`)
            .then(async (res) => {
                const data = await res.json();
                if (res.ok && data.ok) {
                    setStatus("success");
                } else {
                    setStatus("error");
                    setMessage(data.error ?? "Link inválido ou expirado.");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage("Erro ao verificar. Tente novamente.");
            });
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md px-6">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4 mx-auto">
                        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Finance Dashboard</h1>
                </div>

                <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl p-8 shadow-2xl shadow-black/50 text-center">
                    {status === "loading" && (
                        <div className="space-y-4">
                            <div className="w-12 h-12 mx-auto rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                            <p className="text-slate-400">Verificando seu e-mail...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="space-y-5">
                            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">E-mail confirmado!</h2>
                                <p className="text-slate-400 text-sm">Sua conta está ativa. Você já pode fazer login.</p>
                            </div>
                            <Link
                                href="/login"
                                className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
                            >
                                Ir para o Login
                            </Link>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-5">
                            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Link inválido</h2>
                                <p className="text-slate-400 text-sm">{message}</p>
                            </div>
                            <Link
                                href="/login"
                                className="block w-full py-3 border border-[#1e1e35] text-slate-400 hover:text-white hover:bg-[#1e1e35] font-medium rounded-xl transition-colors"
                            >
                                Voltar para o Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense>
            <VerifyEmailContent />
        </Suspense>
    );
}