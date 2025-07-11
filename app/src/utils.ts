import { useState } from "react";

export function useStack<T>(initialValue: T[] = []) {
    const [stack, setStack] = useState<T[]>(initialValue);

    const push = (item: T) => {
        setStack(prev => [...prev, item]);
    };

    const pop = () => {
        setStack(prev => {
            if (prev.length === 0) return prev;
            
            return prev.slice(0, -1);
        });
    };

    const reset = () => {
        setStack(initialValue);
    };

    const current = stack[stack.length - 1];
    const previous = stack[stack.length - 2];

    return {
        stack,
        current,
        previous,
        push,
        pop,
        reset
    };
};