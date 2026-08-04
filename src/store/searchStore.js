import { create } from 'zustand';

const RECENT_SEARCHES_KEY = 'pginfo_recent_searches';
const MAX_RECENT_SEARCHES = 10;

const useSearchStore = create((set, get) => ({
  recentSearches: [],
  suggestions: [],
  searchResults: [],
  filters: {},
  sortBy: 'newest',
  isSearching: false,
  hasSearched: false,
  resultsPagination: null,

  // Load from localStorage
  loadRecentSearches: () => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        set({ recentSearches: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  },

  addRecentSearch: (query) => {
    if (!query?.trim()) return;
    const trimmed = query.trim();

    set((state) => {
      const filtered = state.recentSearches.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent searches:', e);
      }

      return { recentSearches: updated };
    });
  },

  removeRecentSearch: (query) => {
    set((state) => {
      const updated = state.recentSearches.filter(
        (s) => s.toLowerCase() !== query.toLowerCase()
      );

      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent searches:', e);
      }

      return { recentSearches: updated };
    });
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.error('Failed to clear recent searches:', e);
    }
  },

  setSuggestions: (suggestions) => set({ suggestions }),
  clearSuggestions: () => set({ suggestions: [] }),

  setSearchResults: (results, pagination = null) =>
    set({ searchResults: results, resultsPagination: pagination, hasSearched: true }),

  clearSearchResults: () =>
    set({ searchResults: [], resultsPagination: null, hasSearched: false }),

  setFilters: (filters) => set({ filters }),
  setSortBy: (sortBy) => set({ sortBy }),
  clearFilters: () => set({ filters: {}, sortBy: 'newest' }),

  setIsSearching: (isSearching) => set({ isSearching }),

  resetSearch: () =>
    set({
      suggestions: [],
      searchResults: [],
      filters: {},
      sortBy: 'newest',
      isSearching: false,
      hasSearched: false,
      resultsPagination: null,
    }),
}));

export default useSearchStore;
