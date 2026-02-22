"use client";

import { useState } from "react";

type Income = {
    id: string;
    title: string;
    amount: number;
    category: string;
    description: string | null;
    date: string;
};

const INCOME_CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    Salário: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
    Freelance: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
    Investimento: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" },
    Bônus: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
    Outro: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
};

function DeleteModal({ income, onConfirm, onCancel }: { income: Income; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4" onClick={onCancel}>
            <div className="w-full max-w-sm bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl shadow-2xl slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center px-6 pt-8 pb-2">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-white text-center">Excluir recebimento?</h2>
                    <p className="text-slate-400 text-sm text-center mt-1.5">
                        Tem certeza que deseja excluir <span className="text-white font-medium">"{income.title}"</span>?
                        <br /><span className="text-slate-500 text-xs">Esta ação não pode ser desfeita.</span>
                    </p>
                </div>
                <div className="flex gap-3 px-6 py-5">
                    <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-medium text-slate-400 hover:text-white bg-[#1e1e35] hover:bg-[#252540] rounded-xl transition-colors">Cancelar</button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.98]">Sim, excluir</button>
                </div>
            </div>
        </div>
    );
}

type Props = {
    incomes: Income[];
    loading: boolean;
    onEdit: (income: Income) => void;
    onDelete: (id: string) => void;
};

export type { Income };

export default function IncomeTable({ incomes, loading, onEdit, onDelete }: Props) {
    const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);

    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    if (loading) {
        return (
            <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl overflow-hidden">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 border-b border-[#1e1e35] last:border-0 animate-pulse">
                        <div className="w-8 h-8 bg-[#1e1e35] rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2"><div className="h-4 bg-[#1e1e35] rounded w-48" /><div className="h-3 bg-[#1e1e35] rounded w-24" /></div>
                        <div className="h-5 bg-[#1e1e35] rounded w-20" />
                    </div>
                ))}
            </div>
        );
    }

    if (incomes.length === 0) {
        return (
            <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-[#1e1e35] rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-slate-400 font-medium">Nenhum recebimento registrado</p>
                <p className="text-slate-600 text-sm mt-1">Clique em "Adicionar Recebimento" para começar</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#07070d] border-b border-[#1e1e35] text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <div className="col-span-4">Recebimento</div>
                    <div className="col-span-2">Categoria</div>
                    <div className="col-span-2">Data</div>
                    <div className="col-span-2 text-right">Valor</div>
                    <div className="col-span-2 text-center">Ações</div>
                </div>

                {incomes.map((income, idx) => {
                    const catStyle = INCOME_CATEGORY_COLORS[income.category] ?? INCOME_CATEGORY_COLORS["Outro"];
                    return (
                        <div key={income.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-[#1e1e35] last:border-0 hover:bg-[#111126] transition-colors duration-150 items-center fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                            <div className="col-span-12 md:col-span-4">
                                <p className="font-medium text-white text-sm">{income.title}</p>
                                {income.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{income.description}</p>}
                            </div>
                            <div className="col-span-6 md:col-span-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${catStyle.bg} ${catStyle.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                                    {income.category}
                                </span>
                            </div>
                            <div className="col-span-6 md:col-span-2 text-sm text-slate-400">{fmtDate(income.date)}</div>
                            <div className="col-span-6 md:col-span-2 text-right">
                                <span className="text-sm font-semibold text-emerald-400">{fmt(income.amount)}</span>
                            </div>
                            <div className="col-span-6 md:col-span-2 flex items-center justify-center gap-2">
                                <button onClick={() => onEdit(income)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg transition-all duration-200">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Editar
                                </button>
                                <button onClick={() => setDeletingIncome(income)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all duration-200">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {deletingIncome && (
                <DeleteModal
                    income={deletingIncome}
                    onConfirm={() => { onDelete(deletingIncome.id); setDeletingIncome(null); }}
                    onCancel={() => setDeletingIncome(null)}
                />
            )}
        </>
    );
}

export { INCOME_CATEGORY_COLORS };
