import { create } from 'zustand';
import { leadService } from '../services/lead.service';

const useWishlistStore = create((set, get) => ({
  wishlist: [],
  loading: false,

  setWishlist: (list) => set({ wishlist: list }),

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const list = await leadService.getMyLeads('wishlist');
      set({ wishlist: list || [], loading: false });
    } catch (e) {
      set({ loading: false });
    }
  },

  isWishlisted: (pgId) => {
    return get().wishlist.some((w) => {
      const id = w.pg?._id || w.pg;
      return id === pgId;
    });
  },

  toggleWishlist: async (pgId) => {
    // Optimistic UI updates
    const isAlreadyWishlisted = get().isWishlisted(pgId);
    if (isAlreadyWishlisted) {
      // Remove optimistically
      set((state) => ({
        wishlist: state.wishlist.filter((w) => (w.pg?._id || w.pg) !== pgId),
      }));
    } else {
      // Add optimistically (temp object, will be replaced/refreshed)
      const tempItem = { _id: `temp_${Date.now()}`, pg: { _id: pgId } };
      set((state) => ({
        wishlist: [tempItem, ...state.wishlist],
      }));
    }

    try {
      const result = await leadService.addLead(pgId, 'wishlist');
      // Refetch the list to ensure accurate DB state
      const list = await leadService.getMyLeads('wishlist');
      set({ wishlist: list || [] });
      return result;
    } catch (e) {
      // Rollback: Refetch list on error
      const list = await leadService.getMyLeads('wishlist');
      set({ wishlist: list || [] });
      throw e;
    }
  },
}));

export default useWishlistStore;
