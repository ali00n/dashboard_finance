import { Expense } from "@/app/dashboard/page";

type Props = {
    expenses: Expense[];
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

function StatCard({
    label,
    value,
    icon,
    sub,
    color = "indigo",
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    sub?: string;
    color?: string;
}) {
    const colorMap: Record<string, string> = {
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    };

    return (
        <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:bg-[#111126]">
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorMap[color] ?? colorMap.indigo}`}>
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
    );
}

export default function StatsCards({ expenses, loading }: Props) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const now = new Date();
    const monthly = expenses
        .filter((e) => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, e) => sum + e.amount, 0);

    const categorySums: Record<string, number> = {};
    expenses.forEach((e) => {
        categorySums[e.category] = (categorySums[e.category] ?? 0) + e.amount;
    });
    const topCategory = Object.entries(categorySums).sort((a, b) => b[1] - a[1])[0];

    const fmt = (v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="Total de Gastos"
                value={fmt(total)}
                color="indigo"
                sub="Todos os registros"
                icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                }
            />
            <StatCard
                label="Gastos do Mês"
                value={fmt(monthly)}
                color="emerald"
                sub={now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                }
            />
            <StatCard
                label="Maior Categoria"
                value={topCategory ? topCategory[0] : "—"}
                color="amber"
                sub={topCategory ? fmt(topCategory[1]) : "Sem dados"}
                icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                }
            />
            <StatCard
                label="Transações"
                value={expenses.length.toString()}
                color="purple"
                sub="Total de registros"
                icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                }
            />
        </div>
    );
}

export { CATEGORY_COLORS };
