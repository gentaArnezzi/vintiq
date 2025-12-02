'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoCountSelectorProps {
    selectedCount: 2 | 3 | 4;
    onCountChange: (count: 2 | 3 | 4) => void;
}

const PHOTO_COUNTS: { count: 2 | 3 | 4; label: string; description: string }[] = [
    { count: 2, label: '2 Photos', description: 'Double strip' },
    { count: 3, label: '3 Photos', description: 'Triple strip' },
    { count: 4, label: '4 Photos', description: 'Classic strip' },
];

export default function PhotoCountSelector({
    selectedCount,
    onCountChange,
}: PhotoCountSelectorProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {PHOTO_COUNTS.map((option) => {
                const isSelected = selectedCount === option.count;

                return (
                    <button
                        key={option.count}
                        onClick={() => onCountChange(option.count)}
                        className={cn(
                            "relative h-20 rounded-lg border transition-all duration-200 overflow-hidden group",
                            isSelected
                                ? "ring-2 ring-stone-900 ring-offset-2 border-transparent bg-stone-50"
                                : "border-stone-200 hover:border-stone-300 bg-white"
                        )}
                    >
                        {/* Background */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                            {/* Number Display */}
                            <div className={cn(
                                "text-2xl font-serif font-bold transition-colors",
                                isSelected ? "text-stone-900" : "text-stone-600"
                            )}>
                                {option.count}
                            </div>
                            
                            {/* Label */}
                            <span className={cn(
                                "text-xs font-medium transition-colors",
                                isSelected ? "text-stone-700" : "text-stone-500"
                            )}>
                                {option.label}
                            </span>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                            <div className="absolute top-1 right-1 bg-stone-900 text-white rounded-full p-0.5">
                                <Check className="w-3 h-3" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

