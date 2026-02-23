"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import StatsCards from "@/components/StatsCards";
import ExpenseTable from "@/components/ExpenseTable";
import IncomeTable from "@/components/IncomeTable";
import AddExpenseModal from "@/components/AddExpenseModal";
import EditExpenseModal from "@/components/EditExpenseModal";
import AddIncomeModal from "@/components/AddIncomeModal";
import EditIncomeModal from "@/components/EditIncomeModal";
import { Income } from "@/components/IncomeTable";

export type Expense = {
    id: string;
    title: string;
    amount: number;
    category: string;
    description: string | null;
    date: string;
    createdAt: string;
};

type View = "gastos" | "recebimentos";

export default function DashboardPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>("gastos");

    const [showAddExpense, setShowAddExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [showAddIncome, setShowAddIncome] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [expRes, incRes] = await Promise.all([
                fetch("/api/expenses"),
                fetch("/api/incomes"),
            ]);

            if (expRes.status === 401 || incRes.status === 401) {
                window.location.href = "/login";
                return;
            }

            setExpenses(await expRes.json().then(d => Array.isArray(d) ? d : []));
            setIncomes(await incRes.json().then(d => Array.isArray(d) ? d : []));
        } catch {
            setExpenses([]); setIncomes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleDeleteExpense = async (id: string) => {
        await fetch(`/api/expenses/${id}`, { method: "DELETE" });
        fetchAll();
    };

    const handleDeleteIncome = async (id: string) => {
        await fetch(`/api/incomes/${id}`, { method: "DELETE" });
        fetchAll();
    };

    const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
        {
            id: "gastos",
            label: "Gastos",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
            ),
        },
        {
            id: "recebimentos",
            label: "Recebimentos",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header — px-4 no mobile, px-6 em telas maiores (sm:) */}
            <header className="sticky top-0 z-10 border-b border-[#1e1e35] bg-[#07070d]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            {/* No mobile o título é menor (text-sm), fica maior em sm: */}
                            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">Finance Dashboard</h1>
                            <p className="text-xs text-slate-500 hidden sm:block">Controle pessoal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="hidden sm:block text-sm text-slate-400">
                            Olá, <span className="text-indigo-400 font-medium">alissondev</span>
                        </span>
                        <button
                            onClick={async () => {
                                await signOut({ redirect: false });
                                window.location.href = "/login";
                            }}
                            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-[#1e1e35] rounded-lg transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {/* "Sair" só aparece em sm: e acima — no mobile fica só o ícone */}
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 max-w-7xl mx-auto w-full">
                {/* Sidebar: hidden no mobile (hidden), flex no md: */}
                <aside className="hidden md:flex flex-col w-52 shrink-0 border-r border-[#1e1e35] px-4 py-8 gap-1">
                    <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-3 px-3">Menu</p>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left
                ${view === item.id
                                    ? item.id === "gastos"
                                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-[#1e1e35] border border-transparent"
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </aside>

                {/* Main — padding menor no mobile */}
                <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8 min-w-0">
                    {/* Mobile nav tabs — flex-1 faz cada tab ocupar metade da largura */}
                    <div className="flex md:hidden gap-2 mb-4">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border
                  ${view === item.id
                                        ? item.id === "gastos"
                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "text-slate-400 bg-[#0e0e1a] border-[#1e1e35]"
                                    }`}
                            >
                                {item.icon}{item.label}
                            </button>
                        ))}
                    </div>

                    {/* Título da página + botão de ação */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-8">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Visão Geral</h2>
                            <p className="text-slate-400 text-xs sm:text-sm mt-1">
                                {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {view === "gastos" ? (
                                <button
                                    onClick={() => setShowAddExpense(true)}
                                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl
                    transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] w-full sm:w-auto justify-center"
                                >
                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {/* Texto compacto no mobile */}
                                    <span className="sm:hidden">Novo Gasto</span>
                                    <span className="hidden sm:inline">Adicionar Gasto</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowAddIncome(true)}
                                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl
                    transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] w-full sm:w-auto justify-center"
                                >
                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="sm:hidden">Novo Recebimento</span>
                                    <span className="hidden sm:inline">Adicionar Recebimento</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats — responsividade já está no StatsCards */}
                    <StatsCards expenses={expenses} incomes={incomes} loading={loading} />

                    {/* Tabela */}
                    <div className="mt-6 sm:mt-8">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-base sm:text-lg font-semibold text-white">
                                {view === "gastos" ? "Histórico de Gastos" : "Histórico de Recebimentos"}
                            </h3>
                            <span className="text-xs sm:text-sm text-slate-500">
                                {view === "gastos"
                                    ? `${expenses.length} ${expenses.length === 1 ? "registro" : "registros"}`
                                    : `${incomes.length} ${incomes.length === 1 ? "registro" : "registros"}`}
                            </span>
                        </div>

                        {view === "gastos" ? (
                            <ExpenseTable
                                expenses={expenses}
                                loading={loading}
                                onEdit={setEditingExpense}
                                onDelete={handleDeleteExpense}
                            />
                        ) : (
                            <IncomeTable
                                incomes={incomes}
                                loading={loading}
                                onEdit={setEditingIncome}
                                onDelete={handleDeleteIncome}
                            />
                        )}
                    </div>
                </main>
            </div>

            {/* Modals */}
            {showAddExpense && (
                <AddExpenseModal onClose={() => setShowAddExpense(false)} onSaved={() => { setShowAddExpense(false); fetchAll(); }} />
            )}
            {editingExpense && (
                <EditExpenseModal expense={editingExpense} onClose={() => setEditingExpense(null)} onSaved={() => { setEditingExpense(null); fetchAll(); }} />
            )}
            {showAddIncome && (
                <AddIncomeModal onClose={() => setShowAddIncome(false)} onSaved={() => { setShowAddIncome(false); fetchAll(); }} />
            )}
            {editingIncome && (
                <EditIncomeModal income={editingIncome} onClose={() => setEditingIncome(null)} onSaved={() => { setEditingIncome(null); fetchAll(); }} />
            )}
        </div>
    );
}
