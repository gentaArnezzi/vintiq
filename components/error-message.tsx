'use client';

import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    onClose: () => void;
}

export default function ErrorMessage({ message, onClose }: ErrorMessageProps) {
    if (!message) return null;

    return (
        <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-sm text-red-600 font-medium leading-relaxed">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="text-red-400 hover:text-red-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
