"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import StatsCards from "@/components/StatsCards";
import ExpenseTable from "@/components/ExpenseTable";
import AddExpenseModal from "@/components/AddExpenseModal";
import EditExpenseModal from "@/components/EditExpenseModal";

export type Expense = {
    id: string;
    title: string;
    amount: number;
    category: string;
    description: string | null;
    date: string;
    createdAt: string;
};

export default function DashboardPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const fetchExpenses = useCallback(async () => {
        try {
            const res = await fetch("/api/expenses");
            const data = await res.json();
            setExpenses(Array.isArray(data) ? data : []);
        } catch {
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleDelete = async (id: string) => {
        await fetch(`/api/expenses/${id}`, { method: "DELETE" });
        fetchExpenses();
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-[#1e1e35] bg-[#07070d]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-tight">Finance Dashboard</h1>
                            <p className="text-xs text-slate-500">Controle pessoal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:block text-sm text-slate-400">
                            Olá, <span className="text-indigo-400 font-medium">alissondev</span>
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-[#1e1e35] rounded-lg transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                {/* Page title + action buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500
                text-white text-sm font-semibold rounded-xl transition-all duration-200
                hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Adicionar Gasto
                        </button>
                    </div>
                </div>

                {/* Stats cards */}
                <StatsCards expenses={expenses} loading={loading} />

                {/* Expense table */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Histórico de Gastos</h3>
                        <span className="text-sm text-slate-500">
                            {expenses.length} {expenses.length === 1 ? "registro" : "registros"}
                        </span>
                    </div>
                    <ExpenseTable
                        expenses={expenses}
                        loading={loading}
                        onEdit={setEditingExpense}
                        onDelete={handleDelete}
                    />
                </div>
            </main>

            {/* Modals */}
            {showAddModal && (
                <AddExpenseModal
                    onClose={() => setShowAddModal(false)}
                    onSaved={() => {
                        setShowAddModal(false);
                        fetchExpenses();
                    }}
                />
            )}

            {editingExpense && (
                <EditExpenseModal
                    expense={editingExpense}
                    onClose={() => setEditingExpense(null)}
                    onSaved={() => {
                        setEditingExpense(null);
                        fetchExpenses();
                    }}
                />
            )}
        </div>
    );
}
