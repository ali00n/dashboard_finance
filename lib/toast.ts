export type ToastType = "success" | "error" | "info";

export type ToastItem = {
    id: string;
    message: string;
    type: ToastType;
};

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
    const snapshot = [...toasts];
    listeners.forEach(l => l(snapshot));
}

export function toast(message: string, type: ToastType = "success", duration = 3000) {
    const id = Math.random().toString(36).slice(2, 9);
    toasts = [...toasts, { id, message, type }];
    notify();
    setTimeout(() => {
        toasts = toasts.filter(t => t.id !== id);
        notify();
    }, duration);
}

export function subscribeToasts(listener: Listener): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}