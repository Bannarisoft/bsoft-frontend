import { useState } from "react";

export function useLoadingHook<T = undefined>() {
  const [loadingId, setLoadingId] = useState<T | undefined>(undefined);
  const [globalLoading, setGlobalLoading] = useState(false);

  const withLoader = async <R>(
    fn: () => Promise<R>,
    id?: T
  ): Promise<R | undefined> => {
    if (id !== undefined) {
      setLoadingId(id);
    } else {
      setGlobalLoading(true);
    }
    try {
      return await fn();
    } finally {
      if (id !== undefined) {
        setLoadingId(undefined);
      } else {
        setGlobalLoading(false);
      }
    }
  };

  const isLoading = (id?: T): boolean =>
    id !== undefined ? loadingId === id : globalLoading;

  return { withLoader, isLoading };
}
