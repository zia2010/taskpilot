import { useState, useEffect } from 'react';

export function usePersistentStorage<T>(
  key: string,
  initialFactory: () => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as T;
        const fallback = initialFactory();
        if (
          typeof fallback === 'object' &&
          fallback !== null &&
          !Array.isArray(fallback) &&
          typeof parsed === 'object' &&
          parsed !== null &&
          !Array.isArray(parsed)
        ) {
          return { ...fallback, ...parsed };
        }
        return parsed;
      }
    } catch {
      // Fallback to initialFactory
    }
    return initialFactory();
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [key, state]);

  return [state, setState];
}

