export const EXPENSE_CATEGORIES = ["Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", "Outros"] as const;
export const INCOME_CATEGORIES = ["Salário", "Freelance", "Investimento", "Bônus", "Outro"] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];

export const EXPENSE_CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    Alimentação: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
    Transporte:  { bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-400"    },
    Moradia:     { bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-400"   },
    Lazer:       { bg: "bg-purple-500/10",  text: "text-purple-400",  dot: "bg-purple-400"  },
    Saúde:       { bg: "bg-red-500/10",     text: "text-red-400",     dot: "bg-red-400"     },
    Outros:      { bg: "bg-slate-500/10",   text: "text-slate-400",   dot: "bg-slate-400"   },
};

export const EXPENSE_CATEGORY_HEX: Record<string, string> = {
    Alimentação: "#10b981",
    Transporte:  "#3b82f6",
    Moradia:     "#f59e0b",
    Lazer:       "#a855f7",
    Saúde:       "#ef4444",
    Outros:      "#64748b",
};

export const INCOME_CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    Salário:      { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
    Freelance:    { bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-400"    },
    Investimento: { bg: "bg-purple-500/10",  text: "text-purple-400",  dot: "bg-purple-400"  },
    Bônus:        { bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-400"   },
    Outro:        { bg: "bg-slate-500/10",   text: "text-slate-400",   dot: "bg-slate-400"   },
};