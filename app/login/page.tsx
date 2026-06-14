"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tab = "login" | "register";

function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );
}

function PasswordInput({ value, onChange, placeholder, id }: {
    value: string; onChange: (v: string) => void; placeholder: string; id: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                id={id}
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required
                className="w-full px-4 py-3 pr-11 bg-[#07070d] border border-[#1e1e35] rounded-xl text-slate-100 placeholder-slate-600
                    focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
            />
            <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
            >
                <EyeIcon open={show} />
            </button>
        </div>
    );
}

export default function LoginPage() {
    const [tab, setTab] = useState<Tab>("login");
    const router = useRouter();

    // Login state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    // Register state
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirm, setRegConfirm] = useState("");
    const [regCode, setRegCode] = useState("");
    const [regLoading, setRegLoading] = useState(false);
    const [regError, setRegError] = useState("");
    const [regSuccess, setRegSuccess] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError("");

        const result = await signIn("credentials", {
            email: loginEmail,
            password: loginPassword,
            redirect: false,
        });

        setLoginLoading(false);

        if (result?.error) {
            setLoginError("E-mail ou senha inválidos. Se você acabou de criar sua conta, verifique seu e-mail antes de entrar.");
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setRegLoading(true);
        setRegError("");
        setRegSuccess("");

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: regEmail,
                password: regPassword,
                confirmPassword: regConfirm,
                inviteCode: regCode,
            }),
        });

        const data = await res.json();
        setRegLoading(false);

        if (!res.ok) {
            setRegError(data.error ?? "Erro ao criar conta.");
        } else {
            setRegSuccess(data.message ?? "Conta criada! Verifique seu e-mail.");
            setRegEmail("");
            setRegPassword("");
            setRegConfirm("");
            setRegCode("");
        }
    }

    const inputClass = "w-full px-4 py-3 bg-[#07070d] border border-[#1e1e35] rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200";

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl" />
            </div>

            <div className="relative w-full max-w-md px-6 fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4 mx-auto">
                        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Finance Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-1">Controle financeiro pessoal</p>
                </div>

                <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-[#1e1e35]">
                        {(["login", "register"] as Tab[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setLoginError(""); setRegError(""); setRegSuccess(""); }}
                                className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-200 ${tab === t
                                    ? "text-white border-b-2 border-indigo-500 bg-indigo-600/5"
                                    : "text-slate-500 hover:text-slate-300"
                                    }`}
                            >
                                {t === "login" ? "Entrar" : "Criar Conta"}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {/* LOGIN FORM */}
                        {tab === "login" && (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">E-mail</label>
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        required
                                        autoComplete="email"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
                                    <PasswordInput
                                        id="login-password"
                                        value={loginPassword}
                                        onChange={setLoginPassword}
                                        placeholder="Sua senha"
                                    />
                                </div>

                                {loginError && (
                                    <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {loginError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loginLoading}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                                >
                                    {loginLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Entrando...
                                        </span>
                                    ) : "Entrar"}
                                </button>

                                <div className="flex items-center justify-between pt-1">
                                    <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                                        Esqueci minha senha
                                    </Link>
                                    <p className="text-xs text-slate-600">v1.1.0</p>
                                </div>
                            </form>
                        )}

                        {/* REGISTER FORM */}
                        {tab === "register" && (
                            <form onSubmit={handleRegister} className="space-y-4">
                                {regSuccess ? (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 px-4 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                                            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{regSuccess}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setTab("login"); setRegSuccess(""); }}
                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all"
                                        >
                                            Ir para o Login
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">E-mail</label>
                                            <input
                                                type="email"
                                                value={regEmail}
                                                onChange={(e) => setRegEmail(e.target.value)}
                                                placeholder="seu@email.com"
                                                required
                                                autoComplete="email"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Senha <span className="text-slate-500 font-normal">(mín. 8 caracteres)</span></label>
                                            <PasswordInput
                                                id="reg-password"
                                                value={regPassword}
                                                onChange={setRegPassword}
                                                placeholder="Crie uma senha segura"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar Senha</label>
                                            <PasswordInput
                                                id="reg-confirm"
                                                value={regConfirm}
                                                onChange={setRegConfirm}
                                                placeholder="Repita a senha"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Código de Convite</label>
                                            <input
                                                type="text"
                                                value={regCode}
                                                onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                                                placeholder="Ex: AB3X7YKP"
                                                required
                                                maxLength={12}
                                                className={`${inputClass} font-mono tracking-widest`}
                                            />
                                        </div>

                                        {regError && (
                                            <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {regError}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={regLoading}
                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                                        >
                                            {regLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Criando conta...
                                                </span>
                                            ) : "Criar Conta"}
                                        </button>

                                        <p className="text-xs text-slate-600 text-center pt-1">
                                            Precisa de um código? Entre em contato com o administrador.
                                        </p>
                                    </>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}