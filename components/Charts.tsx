"use client";

import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Expense, Income } from "@/types";
import { EXPENSE_CATEGORY_HEX } from "@/lib/categories";

type Props = {
    filteredExpenses: Expense[];
    allExpenses: Expense[];
    allIncomes: Income[];
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtAxis = (v: number) => {
    if (v === 0) return "R$0";
    if (v >= 1000) return `R$${Math.round(v / 1000)}k`;
    return `R$${v}`;
};

const tooltipStyle = {
    contentStyle: {
        background: "#0e0e1a",
        border: "1px solid #1e1e35",
        borderRadius: "12px",
        fontSize: "12px",
        color: "#fff",
    },
    labelStyle: { color: "#94a3b8" },
    itemStyle: { color: "#fff" },
};

export default function Charts({ filteredExpenses, allExpenses, allIncomes }: Props) {
    const categoryData = Object.entries(
        filteredExpenses.reduce<Record<string, number>>((acc, e) => {
            acc[e.category] = (acc[e.category] ?? 0) + e.amount;
            return acc;
        }, {})
    )
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const totalPie = categoryData.reduce((s, e) => s + e.value, 0);

    const barData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - (5 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
        const income = allIncomes
            .filter(e => e.date.slice(0, 7) === key)
            .reduce((s, e) => s + e.amount, 0);
        const expense = allExpenses
            .filter(e => e.date.slice(0, 7) === key)
            .reduce((s, e) => s + e.amount, 0);
        return { label, income, expense };
    });

    const hasExpenses = categoryData.length > 0;
    const hasBarData = barData.some(m => m.income > 0 || m.expense > 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Donut — gastos por categoria */}
            <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl p-5">
                <h4 className="text-sm font-semibold text-white mb-4">Gastos por Categoria</h4>
                {hasExpenses ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-40 h-40 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={44}
                                        outerRadius={68}
                                        paddingAngle={3}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {categoryData.map((entry, i) => (
                                            <Cell key={i} fill={EXPENSE_CATEGORY_HEX[entry.name] ?? EXPENSE_CATEGORY_HEX["Outros"]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(v) => [fmt(Number(v ?? 0)), ""]}
                                        {...tooltipStyle}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2.5 flex-1 min-w-0 w-full">
                            {categoryData.map(entry => {
                                const pct = totalPie > 0 ? Math.round((entry.value / totalPie) * 100) : 0;
                                const color = EXPENSE_CATEGORY_HEX[entry.name] ?? EXPENSE_CATEGORY_HEX["Outros"];
                                return (
                                    <div key={entry.name} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                                            <span className="text-xs text-slate-400 truncate">{entry.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs text-slate-600">{pct}%</span>
                                            <span className="text-xs font-semibold text-white">{fmt(entry.value)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-36 gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#1e1e35] flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        </div>
                        <p className="text-slate-600 text-xs">Nenhum gasto no período</p>
                    </div>
                )}
            </div>

            {/* Barras — evolução 6 meses */}
            <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-white">Evolução — Últimos 6 Meses</h4>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-sm bg-emerald-500" />Recebimentos
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-sm bg-red-500" />Gastos
                        </span>
                    </div>
                </div>
                {hasBarData ? (
                    <ResponsiveContainer width="100%" height={168}>
                        <BarChart data={barData} barGap={3} barCategoryGap="32%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" vertical={false} />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: "#64748b", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: "#64748b", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={fmtAxis}
                                width={46}
                            />
                            <Tooltip
                                formatter={(v, name) => [
                                    fmt(Number(v ?? 0)),
                                    name === "income" ? "Recebimentos" : "Gastos",
                                ]}
                                {...tooltipStyle}
                            />
                            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-36 gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#1e1e35] flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <p className="text-slate-600 text-xs">Sem dados nos últimos 6 meses</p>
                    </div>
                )}
            </div>
        </div>
    );
}