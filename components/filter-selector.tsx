'use client';

import { FILTERS, type FilterType } from '@/lib/image-filters';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSelectorProps {
    selectedFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export default function FilterSelector({
    selectedFilter,
    onFilterChange,
}: FilterSelectorProps) {
    const filterTypes = Object.keys(FILTERS) as FilterType[];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {filterTypes.map((filterType) => {
                const filter = FILTERS[filterType];
                const isSelected = selectedFilter === filterType;

                return (
                    <button
                        key={filterType}
                        onClick={() => onFilterChange(filterType)}
                        className={cn(
                            "relative p-3 rounded-lg border text-left transition-all duration-200",
                            isSelected
                                ? "bg-stone-900 border-stone-900 text-white shadow-md"
                                : "bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                        )}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className={cn("font-medium text-sm", isSelected ? "text-white" : "text-stone-800")}>
                                {filter.displayName}
                            </span>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <p className={cn("text-[10px] leading-tight", isSelected ? "text-stone-300" : "text-stone-400")}>
                            {filter.description}
                        </p>
                    </button>
                );
            })}
        </div>
    );
}
