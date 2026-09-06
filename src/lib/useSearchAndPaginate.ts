"use client";

import { useState, useMemo, useRef, useEffect } from "react";

/**
 * Client-side search + pagination hook.
 * Works on any array of objects with searchable string fields.
 */
export function useSearchAndPaginate<T>(
  items: T[],
  options: {
    /** Keys to search within each item (e.g. ["name", "email"]) */
    searchKeys: (keyof T)[];
    /** Items per page (default 10) */
    pageSize?: number;
  }
) {
  const { searchKeys, pageSize = 10 } = options;
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const prevQuery = useRef(query);

  // Reset to page 1 when the search query changes — done in render
  // rather than an effect to avoid cascading renders.
  if (prevQuery.current !== query) {
    prevQuery.current = query;
    if (page !== 1) setPage(1);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      searchKeys.some((key) => {
        const val = item[key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [items, query, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    query,
    setQuery,
    page: currentPage,
    setPage,
    pageSize,
    totalPages,
    totalItems: filtered.length,
    paginated,
  };
}
