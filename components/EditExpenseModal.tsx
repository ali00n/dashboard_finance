"use client";

import { useState } from "react";
import { Expense } from "@/app/dashboard/page";

const CATEGORIES = ["Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", "Outros"];

type Props = {
    expense: Expense;
    onClose: () => void;
    onSaved: () => void;
};

export default function EditExpenseModal({ expense, onClose, onSaved }: Props) {
    const [form, setForm] = useState({
        title: expense.title,
        amount: expense.amount.toString(),
        category: expense.category,
        description: expense.description ?? "",
        date: new Date(expense.date).toISOString().split("T")[0],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch(`/api/expenses/${expense.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        setLoading(false);

        if (!res.ok) {
            setError("Erro ao atualizar gasto.");
            return;
        }

        onSaved();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4" onClick={onClose}>
            <div
                className="w-full max-w-md bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl shadow-2xl slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e1e35]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-white">Editar Gasto</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#1e1e35] rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Título *</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-[#07070d] border border-[#1e1e35] rounded-xl text-slate-100 placeholder-slate-600 text-sm
                focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Valor (R$) *</label>
                            <input
                                name="amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.amount}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-[#07070d] border border-[#1e1e35] rounded-xl text-slate-100 text-sm
                  focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Data</label>
                            <input
                                name="date"
                                type="date"
                                value={form.date}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-[#07070d] border border-[#1e1e35] rounded-xl text-slate-100 text-sm
                  focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoria *</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-[#07070d] border border-[#1e1e35] rounded-xl text-slate-100 text-sm
                focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição (opcional)</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-2.5 bg-[#07070d] border border-[#1e1e35] rounded-xl text-slate-100 placeholder-slate-600 text-sm
                focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-medium text-slate-400 hover:text-white bg-[#1e1e35] hover:bg-[#252540] rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50
                rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]"
                        >
                            {loading ? "Salvando..." : "Atualizar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
