import { Expense } from "@/app/dashboard/page";
import { CATEGORY_COLORS } from "@/components/StatsCards";

type Props = {
    expenses: Expense[];
    loading: boolean;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
};

export default function ExpenseTable({ expenses, loading, onEdit, onDelete }: Props) {
    const fmt = (v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const fmtDate = (d: string) =>
        new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    if (loading) {
        return (
            <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl overflow-hidden">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 border-b border-[#1e1e35] last:border-0 animate-pulse">
                        <div className="w-8 h-8 bg-[#1e1e35] rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-[#1e1e35] rounded w-48" />
                            <div className="h-3 bg-[#1e1e35] rounded w-24" />
                        </div>
                        <div className="h-5 bg-[#1e1e35] rounded w-20" />
                    </div>
                ))}
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-[#1e1e35] rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 2.5 2 2.5-2 3.5 2z"
                        />
                    </svg>
                </div>
                <p className="text-slate-400 font-medium">Nenhum gasto registrado</p>
                <p className="text-slate-600 text-sm mt-1">Clique em "Adicionar Gasto" para começar</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0e0e1a] border border-[#1e1e35] rounded-2xl overflow-hidden">
            {/* Table header - hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#07070d] border-b border-[#1e1e35] text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Gasto</div>
                <div className="col-span-2">Categoria</div>
                <div className="col-span-2">Data</div>
                <div className="col-span-2 text-right">Valor</div>
                <div className="col-span-2 text-center">Ações</div>
            </div>

            {expenses.map((expense, idx) => {
                const catStyle = CATEGORY_COLORS[expense.category] ?? CATEGORY_COLORS["Outros"];
                return (
                    <div
                        key={expense.id}
                        className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-[#1e1e35] last:border-0
              hover:bg-[#111126] transition-colors duration-150 items-center fade-in"
                        style={{ animationDelay: `${idx * 40}ms` }}
                    >
                        {/* Title + description */}
                        <div className="col-span-12 md:col-span-4">
                            <p className="font-medium text-white text-sm">{expense.title}</p>
                            {expense.description && (
                                <p className="text-xs text-slate-500 mt-0.5 truncate">{expense.description}</p>
                            )}
                        </div>

                        {/* Category badge */}
                        <div className="col-span-6 md:col-span-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${catStyle.bg} ${catStyle.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                                {expense.category}
                            </span>
                        </div>

                        {/* Date */}
                        <div className="col-span-6 md:col-span-2 text-sm text-slate-400">
                            {fmtDate(expense.date)}
                        </div>

                        {/* Amount */}
                        <div className="col-span-6 md:col-span-2 text-right">
                            <span className="text-sm font-semibold text-red-400">{fmt(expense.amount)}</span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-6 md:col-span-2 flex items-center justify-center gap-2">
                            <button
                                onClick={() => onEdit(expense)}
                                title="Editar"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-white
                  bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40
                  rounded-lg transition-all duration-200"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                                Editar
                            </button>
                            <button
                                onClick={() => onDelete(expense.id)}
                                title="Excluir"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-white
                  bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40
                  rounded-lg transition-all duration-200"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
