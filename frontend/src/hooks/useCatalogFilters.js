import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_SORT = 'title-asc';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

const DIFFICULTY_WEIGHTS = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

/**
 * Custom hook for catalog filtering, sorting, pagination, and URL sync.
 *
 * @param {Array} projects - Raw project items from API or database
 * @param {Object} [options] - Configuration options
 * @param {number} [options.pageSize=20] - Number of items per page
 * @param {number} [options.debounceMs=300] - Search debounce duration in ms
 */
export function useCatalogFilters(projects = [], options = {}) {
  const { pageSize = DEFAULT_PAGE_SIZE, debounceMs = 300 } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  // ── 1. Read Initial State from URL Query Params ─────────────────────────────
  const initialQ = searchParams.get('q') || '';
  const initialDomain = searchParams.get('domain') || 'All Domains';
  const initialDifficulty = searchParams.get('difficulty') || 'All';
  const initialDuration = searchParams.get('duration') || 'All';
  const initialSort = searchParams.get('sort') || DEFAULT_SORT;
  const initialPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  // Local immediate input state for search (so typing feels snappy)
  const [searchInput, setSearchInput] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);

  const [domainFilter, setDomainFilter] = useState(initialDomain);
  const [difficultyFilter, setDifficultyFilter] = useState(initialDifficulty);
  const [durationFilter, setDurationFilter] = useState(initialDuration);
  const [sortOption, setSortOption] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Track whether initial mount has passed to avoid unnecessary replaceState
  const isFirstMount = useRef(true);

  // ── 2. Debounce Search Input (300ms) ─────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(searchInput.trim());
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [searchInput, debounceMs]);

  // Keep searchInput in sync if URL query param changes externally (e.g. back button)
  useEffect(() => {
    const qFromUrl = searchParams.get('q') || '';
    if (qFromUrl !== searchInput && qFromUrl !== debouncedQ) {
      setSearchInput(qFromUrl);
      setDebouncedQ(qFromUrl);
    }
    const domainFromUrl = searchParams.get('domain') || 'All Domains';
    if (domainFromUrl !== domainFilter) setDomainFilter(domainFromUrl);

    const diffFromUrl = searchParams.get('difficulty') || 'All';
    if (diffFromUrl !== difficultyFilter) setDifficultyFilter(diffFromUrl);

    const durFromUrl = searchParams.get('duration') || 'All';
    if (durFromUrl !== durationFilter) setDurationFilter(durFromUrl);

    const sortFromUrl = searchParams.get('sort') || DEFAULT_SORT;
    if (sortFromUrl !== sortOption) setSortOption(sortFromUrl);

    const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    if (pageFromUrl !== currentPage) setCurrentPage(pageFromUrl);
  }, [searchParams]);

  // ── 3. Reset Page to 1 when filters or sort change ──────────────────────────
  const isFilterActive = useMemo(() => {
    return (
      debouncedQ !== '' ||
      domainFilter !== 'All Domains' ||
      difficultyFilter !== 'All' ||
      durationFilter !== 'All' ||
      sortOption !== DEFAULT_SORT
    );
  }, [debouncedQ, domainFilter, difficultyFilter, durationFilter, sortOption]);

  // ── 4. Sync Filter State to URL Query Parameters ────────────────────────────
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (debouncedQ) params.set('q', debouncedQ);
    if (domainFilter && domainFilter !== 'All Domains' && domainFilter !== 'All') {
      params.set('domain', domainFilter);
    }
    if (difficultyFilter && difficultyFilter !== 'All' && difficultyFilter !== 'All Difficulties') {
      params.set('difficulty', difficultyFilter);
    }
    if (durationFilter && durationFilter !== 'All' && durationFilter !== 'All Durations') {
      params.set('duration', durationFilter);
    }
    if (sortOption && sortOption !== DEFAULT_SORT) {
      params.set('sort', sortOption);
    }
    if (currentPage > 1) {
      params.set('page', String(currentPage));
    }

    setSearchParams(params, { replace: true });
  }, [debouncedQ, domainFilter, difficultyFilter, durationFilter, sortOption, currentPage, setSearchParams]);

  // ── 5. Build Dynamic Options from Available Data ────────────────────────────
  const domainOptions = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      if (p.domain) set.add(p.domain.trim());
    });
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b));
    return ['All Domains', ...sorted];
  }, [projects]);

  const difficultyOptions = useMemo(() => {
    return ['All Difficulties', 'Beginner', 'Intermediate', 'Advanced'];
  }, []);

  const durationOptions = useMemo(() => {
    const set = new Set();
    let hasNotSet = false;

    projects.forEach((p) => {
      const dur = p.estimated_duration ? p.estimated_duration.trim() : '';
      if (!dur || dur === '—' || dur === '-') {
        hasNotSet = true;
      } else {
        set.add(dur);
      }
    });

    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    const result = ['All Durations', ...list];
    if (hasNotSet) result.push('Not set');
    return result;
  }, [projects]);

  const sortOptions = useMemo(() => {
    return [
      { value: 'title-asc', label: 'Title A–Z' },
      { value: 'title-desc', label: 'Title Z–A' },
      { value: 'diff-asc', label: 'Difficulty (Beginner→Advanced)' },
      { value: 'newest', label: 'Newest first' },
    ];
  }, []);

  // ── 6. Filter & Sort Data (AND Logic) ───────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    const qLower = debouncedQ.toLowerCase();

    const filtered = projects.filter((p) => {
      // 1. Search (case-insensitive by project title)
      if (qLower && !(p.title || '').toLowerCase().includes(qLower)) {
        return false;
      }

      // 2. Domain
      if (domainFilter !== 'All Domains' && domainFilter !== 'All') {
        if ((p.domain || '').toLowerCase() !== domainFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Difficulty
      if (difficultyFilter !== 'All' && difficultyFilter !== 'All Difficulties') {
        if ((p.difficulty || '').toLowerCase() !== difficultyFilter.toLowerCase()) {
          return false;
        }
      }

      // 4. Duration
      if (durationFilter !== 'All' && durationFilter !== 'All Durations') {
        const pDur = (p.estimated_duration || '').trim();
        if (durationFilter === 'Not set') {
          if (pDur && pDur !== '—' && pDur !== '-') return false;
        } else {
          if (pDur.toLowerCase() !== durationFilter.toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });

    // Sort
    return filtered.sort((a, b) => {
      if (sortOption === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortOption === 'title-desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      if (sortOption === 'diff-asc') {
        const wA = DIFFICULTY_WEIGHTS[(a.difficulty || '').toLowerCase()] || 2;
        const wB = DIFFICULTY_WEIGHTS[(b.difficulty || '').toLowerCase()] || 2;
        if (wA !== wB) return wA - wB;
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortOption === 'newest') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id || 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id || 0;
        return dateB - dateA;
      }
      return 0;
    });
  }, [projects, debouncedQ, domainFilter, difficultyFilter, durationFilter, sortOption]);

  // ── 7. Pagination ───────────────────────────────────────────────────────────
  const totalFiltered = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProjects = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, safePage, pageSize]);

  // ── 8. Active Filter Chips ──────────────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips = [];

    if (debouncedQ) {
      chips.push({
        id: 'q',
        label: `"${debouncedQ}"`,
        onRemove: () => {
          setSearchInput('');
          setDebouncedQ('');
          setCurrentPage(1);
        },
      });
    }

    if (domainFilter !== 'All Domains' && domainFilter !== 'All') {
      chips.push({
        id: 'domain',
        label: domainFilter,
        onRemove: () => {
          setDomainFilter('All Domains');
          setCurrentPage(1);
        },
      });
    }

    if (difficultyFilter !== 'All' && difficultyFilter !== 'All Difficulties') {
      chips.push({
        id: 'difficulty',
        label: difficultyFilter,
        onRemove: () => {
          setDifficultyFilter('All');
          setCurrentPage(1);
        },
      });
    }

    if (durationFilter !== 'All' && durationFilter !== 'All Durations') {
      chips.push({
        id: 'duration',
        label: durationFilter === 'Not set' ? 'Duration: Not set' : durationFilter,
        onRemove: () => {
          setDurationFilter('All');
          setCurrentPage(1);
        },
      });
    }

    if (sortOption !== DEFAULT_SORT) {
      const match = sortOptions.find((s) => s.value === sortOption);
      chips.push({
        id: 'sort',
        label: `Sort: ${match ? match.label : sortOption}`,
        onRemove: () => {
          setSortOption(DEFAULT_SORT);
          setCurrentPage(1);
        },
      });
    }

    return chips;
  }, [debouncedQ, domainFilter, difficultyFilter, durationFilter, sortOption, sortOptions]);

  // ── 9. Clear All Filters ───────────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setSearchInput('');
    setDebouncedQ('');
    setDomainFilter('All Domains');
    setDifficultyFilter('All');
    setDurationFilter('All');
    setSortOption(DEFAULT_SORT);
    setCurrentPage(1);
  }, []);

  // Filter setters that automatically reset to page 1
  const updateDomain = useCallback((val) => {
    setDomainFilter(val);
    setCurrentPage(1);
  }, []);

  const updateDifficulty = useCallback((val) => {
    setDifficultyFilter(val);
    setCurrentPage(1);
  }, []);

  const updateDuration = useCallback((val) => {
    setDurationFilter(val);
    setCurrentPage(1);
  }, []);

  const updateSort = useCallback((val) => {
    setSortOption(val);
    setCurrentPage(1);
  }, []);

  const updateSearchInput = useCallback((val) => {
    setSearchInput(val);
    setCurrentPage(1);
  }, []);

  // ── 10. Subtitle Text ───────────────────────────────────────────────────────
  const subtitle = useMemo(() => {
    const totalRaw = projects.length;
    if (!isFilterActive) {
      return `${totalRaw} active catalog projects`;
    }
    return `Showing ${totalFiltered} of ${totalRaw} projects`;
  }, [projects.length, isFilterActive, totalFiltered]);

  // ── 11. Query params payload (for future server-side API swap) ──────────────
  const serverQueryParams = useMemo(() => {
    return {
      q: debouncedQ || undefined,
      domain: domainFilter !== 'All Domains' && domainFilter !== 'All' ? domainFilter : undefined,
      difficulty: difficultyFilter !== 'All' && difficultyFilter !== 'All Difficulties' ? difficultyFilter : undefined,
      duration: durationFilter !== 'All' && durationFilter !== 'All Durations' ? durationFilter : undefined,
      sort: sortOption,
      page: safePage,
      limit: pageSize,
    };
  }, [debouncedQ, domainFilter, difficultyFilter, durationFilter, sortOption, safePage, pageSize]);

  return {
    // Current filter states
    searchInput,
    debouncedQ,
    domainFilter,
    difficultyFilter,
    durationFilter,
    sortOption,
    currentPage: safePage,
    pageSize,

    // Options for dropdowns
    domainOptions,
    difficultyOptions,
    durationOptions,
    sortOptions,

    // Filtered data & pagination
    filteredProjects: filteredAndSorted,
    paginatedProjects,
    totalFiltered,
    totalRaw: projects.length,
    totalPages,

    // UI Helpers
    isFilterActive,
    activeChips,
    subtitle,
    serverQueryParams,

    // Action handlers
    setSearchInput: updateSearchInput,
    setDomainFilter: updateDomain,
    setDifficultyFilter: updateDifficulty,
    setDurationFilter: updateDuration,
    setSortOption: updateSort,
    setCurrentPage,
    clearFilters,
  };
}
