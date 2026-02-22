import { Expense } from "@/app/dashboard/page";
import { Income } from "@/components/IncomeTable";

type Props = {
    expenses: Expense[];
    incomes: Income[];
    loading: boolean;
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
        <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:bg-[#111126]">
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorMap[color] ?? colorMap.indigo}`}>{icon}</div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
    );
}

export default function StatsCards({ expenses, incomes, loading }: Props) {
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const now = new Date();

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncomes = incomes.reduce((s, e) => s + e.amount, 0);
    const balance = totalIncomes - totalExpenses;

    const monthlyExpenses = expenses
        .filter(e => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
        .reduce((s, e) => s + e.amount, 0);

    const monthlyIncomes = incomes
        .filter(e => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
        .reduce((s, e) => s + e.amount, 0);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl p-6 animate-pulse">
                        <div className="h-4 bg-[#1e1e35] rounded w-24 mb-4" />
                        <div className="h-7 bg-[#1e1e35] rounded w-32" />
                    </div>
                ))}
            </div>
        );
    }

    const balanceColor = balance >= 0 ? "emerald" : "red";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="Saldo Atual"
                value={fmt(balance)}
                color={balanceColor}
                sub={balance >= 0 ? "Positivo ✓" : "Atenção — saldo negativo"}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
            />
            <StatCard
                label="Recebido no Mês"
                value={fmt(monthlyIncomes)}
                color="emerald"
                sub={now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>}
            />
            <StatCard
                label="Gasto no Mês"
                value={fmt(monthlyExpenses)}
                color="red"
                sub={now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>}
            />
            <StatCard
                label="Total Recebido"
                value={fmt(totalIncomes)}
                color="purple"
                sub={`${incomes.length} recebiment${incomes.length !== 1 ? "os" : "o"}`}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            />
        </div>
    );
}

export { CATEGORY_COLORS };
