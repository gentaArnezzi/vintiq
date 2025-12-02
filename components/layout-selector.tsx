import { Grid, Image, RectangleVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LayoutType } from '@/lib/canvas-generator';

interface LayoutSelectorProps {
    selectedLayout: LayoutType;
    onLayoutChange: (layout: LayoutType) => void;
}

export default function LayoutSelector({
    selectedLayout,
    onLayoutChange,
}: LayoutSelectorProps) {
    const layouts: { id: LayoutType; label: string; icon: React.ElementType }[] = [
        { id: 'vertical-4', label: 'Strip', icon: RectangleVertical },
        { id: 'grid-2x2', label: 'Grid', icon: Grid },
        { id: 'polaroid', label: 'Polaroid', icon: Image },
    ];

    return (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {layouts.map((layout) => (
                <button
                    key={layout.id}
                    onClick={() => onLayoutChange(layout.id)}
                    className={cn(
                        'flex flex-col items-center gap-2 p-3 min-w-[80px] rounded-xl border transition-all duration-200',
                        (selectedLayout === layout.id || (layout.id === 'vertical-4' && selectedLayout.startsWith('vertical-')))
                            ? 'bg-stone-800 border-stone-800 text-white shadow-md scale-105'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
                    )}
                >
                    <layout.icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{layout.label}</span>
                </button>
            ))}
        </div>
    );
}
