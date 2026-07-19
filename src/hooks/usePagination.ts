import { useState } from 'react';
export function usePagination(initialPage = 0, initialSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [size] = useState(initialSize);
  return { page, size, goToPage: setPage, nextPage: () => setPage(p => p+1), prevPage: () => setPage(p => Math.max(0,p-1)), reset: () => setPage(0) };
}
