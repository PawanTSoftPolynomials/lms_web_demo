"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";

export default function ArrangeTokensList({
                                              options = [],
                                              selectedOrder = [],
                                              onOrderChange,
                                          }) {
    const [items, setItems] = useState([]);

    // Initialize items with selectedOrder if present, else copy options
    useEffect(() => {
        if (selectedOrder && selectedOrder.length === options.length) {
            setItems(selectedOrder);
        } else {
            setItems(options);
            onOrderChange(options);
        }
    }, [options, selectedOrder, onOrderChange]);

    const moveUp = (index) => {
        if (index === 0) return;
        const newItems = [...items];
        const temp = newItems[index];
        newItems[index] = newItems[index - 1];
        newItems[index - 1] = temp;
        setItems(newItems);
        onOrderChange(newItems);
    };

    const moveDown = (index) => {
        if (index === items.length - 1) return;
        const newItems = [...items];
        const temp = newItems[index];
        newItems[index] = newItems[index + 1];
        newItems[index + 1] = temp;
        setItems(newItems);
        onOrderChange(newItems);
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-400 mb-2">
                Arrange the following items in the correct logical order using the up and down arrows:
            </p>
            <div className="space-y-2 border border-slate-800 bg-slate-950 p-4 rounded-xl">
                {items.map((item, index) => (
                    <div
                        key={item}
                        className="flex items-center gap-4 bg-slate-900 border border-slate-850 p-4 rounded-lg text-slate-200 select-none shadow-sm"
                    >
                        {/* Grip Indicator */}
                        <div className="text-slate-600">
                            <GripVertical className="h-5 w-5" />
                        </div>

                        {/* Order Number */}
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-800 text-xs font-semibold text-orange-400">
                            {index + 1}
                        </div>

                        {/* Token Text */}
                        <div className="flex-1 font-medium text-white">{item}</div>

                        {/* Move Buttons */}
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className="p-2 bg-slate-850 rounded border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                                title="Move Up"
                            >
                                <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveDown(index)}
                                disabled={index === items.length - 1}
                                className="p-2 bg-slate-850 rounded border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                                title="Move Down"
                            >
                                <ArrowDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
