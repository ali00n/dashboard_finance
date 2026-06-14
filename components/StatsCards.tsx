import { Expense } from "@/app/dashboard/page";
import { Income } from "@/components/IncomeTable";

type Props = {
    expenses: Expense[];
    incomes: Income[];
    loading: boolean;
    salaryAmount?: number;
    fixedExpensesTotal?: number;
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    Alimentação: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
    Transporte: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
    Moradia: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
    Lazer: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" },
    Saúde: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
    Outros: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
};

function StatCard({ label, value, icon, sub, color = "indigo" }: {
    label: string; value: string; icon: React.ReactNode; sub?: string; color?: string;
}) {
    const colorMap: Record<string, string> = {
        indigo: "text-indigo-400  bg-indigo-500/10  border-indigo-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-400   bg-amber-500/10   border-amber-500/20",
        purple: "text-purple-400  bg-purple-500/10  border-purple-500/20",
        red: "text-red-400     bg-red-500/10     border-red-500/20",
        blue: "text-blue-400    bg-blue-500/10    border-blue-500/20",
    };
    return (
        // p-4 no mobile, p-6 em telas sm:
        <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl p-4 sm:p-6 hover:border-indigo-500/30 transition-all duration-300 hover:bg-[#111126]">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm font-medium text-slate-400">{label}</p>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center ${colorMap[color] ?? colorMap.indigo}`}>{icon}</div>
            </div>
            {/* Valor principal: menor no mobile para caber sem overflow */}
            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
    );
}

export default function StatsCards({ expenses, incomes, loading, salaryAmount = 0, fixedExpensesTotal = 0 }: Props) {
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const variableExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const variableIncomes = incomes.reduce((s, e) => s + e.amount, 0);

    const totalRecebido = salaryAmount + variableIncomes;
    const totalGasto = fixedExpensesTotal + variableExpenses;
    const balance = totalRecebido - totalGasto;

    const hasSalary = salaryAmount > 0;
    const netSalary = salaryAmount - fixedExpensesTotal;

    if (loading) {
        return (
            // grid-cols-2 no mobile, 4 colunas no lg:
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl p-4 sm:p-6 animate-pulse">
                        <div className="h-3 sm:h-4 bg-[#1e1e35] rounded w-20 sm:w-24 mb-3 sm:mb-4" />
                        <div className="h-6 sm:h-7 bg-[#1e1e35] rounded w-24 sm:w-32" />
                    </div>
                ))}
            </div>
        );
    }

    const balanceColor = balance >= 0 ? "emerald" : "red";
    const netSalaryColor = netSalary >= 0 ? "emerald" : "red";

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
                label="Saldo do Mês"
                value={fmt(balance)}
                color={balanceColor}
                sub={balance >= 0 ? "Positivo ✓" : "Saldo negativo"}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
            />
            <StatCard
                label="Recebido no Mês"
                value={fmt(totalRecebido)}
                color="emerald"
                sub={hasSalary ? `Salário + R$${variableIncomes.toFixed(0)} variável` : `${incomes.length} recebiment${incomes.length !== 1 ? "os" : "o"}`}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>}
            />
            <StatCard
                label="Gasto no Mês"
                value={fmt(totalGasto)}
                color="red"
                sub={fixedExpensesTotal > 0 ? `${fmt(fixedExpensesTotal)} fixo + variável` : `${expenses.length} gasto${expenses.length !== 1 ? "s" : ""}`}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>}
            />
            {hasSalary ? (
                <StatCard
                    label="Salário Líquido"
                    value={fmt(netSalary)}
                    color={netSalaryColor}
                    sub="Após descontar fixos"
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            ) : (
                <StatCard
                    label="Total Recebido"
                    value={fmt(variableIncomes)}
                    color="purple"
                    sub={`${incomes.length} recebiment${incomes.length !== 1 ? "os" : "o"}`}
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                />
            )}
        </div>
    );
}

export { CATEGORY_COLORS };
