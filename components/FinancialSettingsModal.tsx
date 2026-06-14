"use client";

import { useState, useEffect } from "react";

export type FixedExpense = {
    id: string;
    title: string;
    amount: number;
    category: string;
    description: string | null;
    isActive: boolean;
};

type Props = {
    selectedMonth: string;
    onClose: () => void;
    onDataChanged: () => void;
};

const EXPENSE_CATEGORIES = ["Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", "Outros"];

const CATEGORY_COLORS: Record<string, string> = {
    Alimentação: "text-emerald-400",
    Transporte: "text-blue-400",
    Moradia: "text-amber-400",
    Lazer: "text-purple-400",
    Saúde: "text-red-400",
    Outros: "text-slate-400",
};

export default function FinancialSettingsModal({ selectedMonth, onClose, onDataChanged }: Props) {
    const monthLabel = new Date(selectedMonth + "-15").toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    // Salary state
    const [baseSalary, setBaseSalary] = useState("");
    const [overtimeAmount, setOvertimeAmount] = useState("");
    const [salarySaving, setSalarySaving] = useState(false);
    const [salaryError, setSalaryError] = useState("");
    const [salarySaved, setSalarySaved] = useState(false);

    // Fixed expenses state
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Add/Edit form state
    const [formTitle, setFormTitle] = useState("");
    const [formAmount, setFormAmount] = useState("");
    const [formCategory, setFormCategory] = useState("Outros");
    const [formDescription, setFormDescription] = useState("");
    const [formSaving, setFormSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [salaryRes, fixedRes, overtimeRes] = await Promise.all([
                fetch("/api/salary-config"),
                fetch("/api/fixed-expenses"),
                fetch(`/api/monthly-overtime?month=${selectedMonth}`),
            ]);
            if (salaryRes.ok) {
                const d = await salaryRes.json();
                setBaseSalary(d?.baseSalary > 0 ? String(d.baseSalary) : "");
            }
            if (fixedRes.ok) {
                const d = await fixedRes.json();
                setFixedExpenses(Array.isArray(d) ? d : []);
            }
            if (overtimeRes.ok) {
                const d = await overtimeRes.json();
                setOvertimeAmount(d?.amount > 0 ? String(d.amount) : "");
            }
        };
        fetchData();
    }, [selectedMonth]);

    const saveSalary = async () => {
        setSalarySaving(true);
        setSalaryError("");
        setSalarySaved(false);
        try {
            const [r1, r2] = await Promise.all([
                fetch("/api/salary-config", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ baseSalary: parseFloat(baseSalary) || 0 }),
                }),
                fetch("/api/monthly-overtime", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ month: selectedMonth, amount: parseFloat(overtimeAmount) || 0 }),
                }),
            ]);
            if (!r1.ok || !r2.ok) {
                setSalaryError("Erro ao salvar. Tente novamente.");
                return;
            }
            setSalarySaved(true);
            onDataChanged();
        } catch {
            setSalaryError("Erro ao salvar. Tente novamente.");
        } finally {
            setSalarySaving(false);
        }
    };

    const openAddForm = () => {
        setEditingId(null);
        setFormTitle("");
        setFormAmount("");
        setFormCategory("Outros");
        setFormDescription("");
        setFormError("");
        setShowAddForm(true);
    };

    const openEditForm = (fe: FixedExpense) => {
        setShowAddForm(false);
        setEditingId(fe.id);
        setFormTitle(fe.title);
        setFormAmount(String(fe.amount));
        setFormCategory(fe.category);
        setFormDescription(fe.description || "");
        setFormError("");
    };

    const cancelForm = () => {
        setShowAddForm(false);
        setEditingId(null);
        setFormError("");
    };

    const saveFixedExpense = async () => {
        if (!formTitle.trim() || !formAmount) {
            setFormError("Preencha o título e o valor.");
            return;
        }
        setFormSaving(true);
        setFormError("");
        try {
            const url = editingId ? `/api/fixed-expenses/${editingId}` : "/api/fixed-expenses";
            const method = editingId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formTitle.trim(),
                    amount: parseFloat(formAmount),
                    category: formCategory,
                    description: formDescription.trim() || null,
                }),
            });
            if (!res.ok) {
                setFormError("Erro ao salvar. Tente novamente.");
                return;
            }
            const saved = await res.json();
            if (editingId) {
                setFixedExpenses(prev => prev.map(fe => fe.id === editingId ? saved : fe));
            } else {
                setFixedExpenses(prev => [...prev, saved]);
            }
            cancelForm();
            onDataChanged();
        } catch {
            setFormError("Erro ao salvar. Tente novamente.");
        } finally {
            setFormSaving(false);
        }
    };

    const deleteFixedExpense = async (id: string) => {
        setDeletingId(id);
        try {
            await fetch(`/api/fixed-expenses/${id}`, { method: "DELETE" });
            setFixedExpenses(prev => prev.filter(fe => fe.id !== id));
            onDataChanged();
        } finally {
            setDeletingId(null);
        }
    };

    const totalFixed = fixedExpenses.reduce((s, fe) => s + fe.amount, 0);
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative h-full w-full max-w-md bg-[#07070d] border-l border-[#1e1e35] overflow-y-auto flex flex-col shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#1e1e35] bg-[#07070d]/95 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-white">Configurações Financeiras</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1e1e35] rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 p-6 space-y-8">
                    {/* Salary Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full bg-emerald-500" />
                            <h3 className="text-xs font-semibold text-white uppercase tracking-widest">Salário</h3>
                        </div>
                        <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl p-4 space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Salário Base Mensal</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={baseSalary}
                                        onChange={e => { setBaseSalary(e.target.value); setSalarySaved(false); }}
                                        placeholder="0,00"
                                        className="w-full bg-[#07070d] border border-[#1e1e35] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">
                                    Extra em{" "}
                                    <span className="text-indigo-400 capitalize">{monthLabel}</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={overtimeAmount}
                                        onChange={e => { setOvertimeAmount(e.target.value); setSalarySaved(false); }}
                                        placeholder="0,00"
                                        className="w-full bg-[#07070d] border border-[#1e1e35] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-600 mt-1">Valor extra recebido somente neste mês</p>
                            </div>
                            {salaryError && (
                                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{salaryError}</p>
                            )}
                            <button
                                onClick={saveSalary}
                                disabled={salarySaving}
                                className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 ${salarySaved
                                    ? "bg-emerald-700 text-emerald-200"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                    }`}
                            >
                                {salarySaving ? "Salvando..." : salarySaved ? "Salvo ✓" : "Salvar"}
                            </button>
                        </div>
                    </section>

                    {/* Fixed Expenses Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-5 rounded-full bg-red-500" />
                                <h3 className="text-xs font-semibold text-white uppercase tracking-widest">Gastos Fixos</h3>
                            </div>
                            {!showAddForm && !editingId && (
                                <button
                                    onClick={openAddForm}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Adicionar
                                </button>
                            )}
                        </div>

                        {/* Inline form */}
                        {(showAddForm || editingId) && (
                            <div className="bg-[#0e0e1a] border border-indigo-500/20 rounded-2xl p-4 mb-3 space-y-3">
                                <p className="text-xs font-semibold text-slate-400">
                                    {editingId ? "Editar gasto fixo" : "Novo gasto fixo"}
                                </p>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                    placeholder="Nome (ex: Internet, Aluguel...)"
                                    className="w-full bg-[#07070d] border border-[#1e1e35] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-600 transition-all"
                                />
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={formAmount}
                                            onChange={e => setFormAmount(e.target.value)}
                                            placeholder="0,00"
                                            className="w-full bg-[#07070d] border border-[#1e1e35] rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                    <select
                                        value={formCategory}
                                        onChange={e => setFormCategory(e.target.value)}
                                        className="flex-1 bg-[#07070d] border border-[#1e1e35] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                                    >
                                        {EXPENSE_CATEGORIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    value={formDescription}
                                    onChange={e => setFormDescription(e.target.value)}
                                    placeholder="Descrição (opcional)"
                                    className="w-full bg-[#07070d] border border-[#1e1e35] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-600 transition-all"
                                />
                                {formError && (
                                    <p className="text-xs text-red-400">{formError}</p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={cancelForm}
                                        className="flex-1 py-2 border border-[#1e1e35] text-slate-400 hover:text-white text-sm rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={saveFixedExpense}
                                        disabled={formSaving}
                                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {formSaving ? "Salvando..." : "Salvar"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        {fixedExpenses.length === 0 ? (
                            <div className="bg-[#0e0e1a] border border-dashed border-[#1e1e35] rounded-2xl p-8 text-center">
                                <p className="text-slate-500 text-sm">Nenhum gasto fixo cadastrado.</p>
                                <p className="text-slate-600 text-xs mt-1">Ex: Internet, Aluguel, Academia...</p>
                            </div>
                        ) : (
                            <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl overflow-hidden">
                                {fixedExpenses.map((fe, i) => (
                                    <div
                                        key={fe.id}
                                        className={`flex items-center gap-3 px-4 py-3 ${i !== fixedExpenses.length - 1 ? "border-b border-[#1e1e35]" : ""} ${editingId === fe.id ? "bg-indigo-600/5" : ""}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{fe.title}</p>
                                            <p className={`text-xs ${CATEGORY_COLORS[fe.category] ?? "text-slate-400"}`}>
                                                {fe.category}
                                            </p>
                                        </div>
                                        <span className="text-sm font-semibold text-red-400 shrink-0">
                                            {fmt(fe.amount)}
                                        </span>
                                        {editingId !== fe.id && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => openEditForm(fe)}
                                                    className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:bg-indigo-600/10 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => deleteFixedExpense(fe.id)}
                                                    disabled={deletingId === fe.id}
                                                    className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {deletingId === fe.id ? (
                                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e35] bg-[#0a0a16]">
                                    <span className="text-xs text-slate-400 font-medium">Total fixo/mês</span>
                                    <span className="text-sm font-bold text-red-400">{fmt(totalFixed)}</span>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}