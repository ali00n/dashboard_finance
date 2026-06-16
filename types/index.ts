export type Expense = {
    id: string;
    title: string;
    amount: number;
    category: string;
    description: string | null;
    date: string;
    createdAt: string;
};

export type Income = {
    id: string;
    title: string;
    amount: number;
    category: string;
    description: string | null;
    date: string;
    createdAt?: string;
};