// src/pages/owner/MyListings.jsx

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, MapPin, X, Search } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Pagination from '../../components/common/Pagination';
import pgService from '../../services/pg.service';
import toast from 'react-hot-toast';
import axios from 'axios';

const PAGE_SIZE = 12;

export default function MyListings() {
  const [pgs, setPGs] = useState([]);
  const [updateRequests, setUpdateRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  // ── Debounce search input ──────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Fetch update requests once ────────────────────────────
  useEffect(() => {
    pgService
      .getMyUpdateRequests()
      .then(setUpdateRequests)
      .catch((e) => toast.error(e.message));
  }, []);

  // ── Main data fetcher with cancellation ───────────────────
  const fetchMyListings = useCallback(async () => {
    // Cancel any in‑flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (debouncedQuery) params.q = debouncedQuery;

      const response = await pgService.getMyPaginated(params, { signal: controller.signal });
      const { pgs: listings, pagination: pag } = response.data;

      setPGs(listings || []);
      setPagination({
        ...pag,
        limit: PAGE_SIZE,
        totalPages: Math.max(1, pag?.totalPages || 1),
      });
    } catch (err) {
      if (axios.isCancel(err)) return;
      toast.error(err.response?.data?.message || err.message || 'Failed to load listings');
    }
  }, [debouncedQuery, page]);

  useEffect(() => {
    fetchMyListings();
    return () => abortControllerRef.current?.abort();
  }, [fetchMyListings]);

  // ── Delete handler ────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await pgService.remove(id);
      setPGs((prev) => prev.filter((pg) => pg._id !== id));
      toast.success('Listing deleted');
      // Refetch to get accurate pagination
      fetchMyListings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Page change handler ───────────────────────────────────
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Render helpers ────────────────────────────────────────
  const isInitialLoad = loading && pgs.length === 0;
  const showEmptyState = !loading && pagination.total === 0 && !debouncedQuery;
  const showNoResults = !loading && pagination.total === 0 && debouncedQuery;
  const activeSearch = debouncedQuery.trim();

  const action = (
    <button className="btn btn-primary" onClick={() => navigate('/owner/listings/add')}>
      <Plus size={16} /> Add New PG
    </button>
  );

  return (
    <PageWrapper title="My Listings" subtitle="Manage your PG listings" action={action}>
      {/* ── Search bar ──────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, area, city, address or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search your listings"
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        {activeSearch && (
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Showing results for “{activeSearch}”
          </p>
        )}
      </div>

      {/* ── Loading skeletons (initial) ────────────────── */}
      {isInitialLoad && (
        <div className="grid-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 160, marginBottom: 12, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '80%' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state (no listings at all) ────────────── */}
      {showEmptyState && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No listings yet</p>
          <button className="btn btn-primary" onClick={() => navigate('/owner/listings/add')}>
            <Plus size={16} /> Add Your First PG
          </button>
        </div>
      )}

      {/* ── No search results ───────────────────────────── */}
      {showNoResults && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#6b7280' }}>No listings match your search.</p>
          <button
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* ── Listings grid ───────────────────────────────── */}
      {!isInitialLoad && pgs.length > 0 && (
        <>
          <div className="grid-3" style={{ transition: 'opacity 0.2s' }}>
            {pgs.map((pg) => {
              const req = updateRequests.find(
                (r) =>
                  r.pg?._id === pg._id &&
                  ['pending', 'correction_required'].includes(r.status)
              );

              return (
                <div key={pg._id} className="pg-card">
                  <img
                    className="pg-card-img"
                    src={pg.photos?.[0]?.url || 'https://via.placeholder.com/400x180?text=No+Photo'}
                    alt={pg.name}
                  />
                  <div className="pg-card-body">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div>
                        <div className="pg-card-title">{pg.name}</div>
                        <div
                          className="pg-card-location"
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <MapPin size={12} />
                          {pg.area}, {pg.city}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span className={`badge badge-${pg.status}`}>{pg.status}</span>
                        {req && (
                          <span
                            className="badge"
                            style={{
                              background: req.status === 'pending' ? '#fffbeb' : '#fee2e2',
                              color: req.status === 'pending' ? '#d97706' : '#dc2626',
                              border: `1px solid ${req.status === 'pending' ? '#fef3c7' : '#fca5a5'}`,
                              margin: 0,
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                            }}
                          >
                            {req.status === 'pending' ? '🕐 Pending' : '⚠️ Correct'}
                          </span>
                        )}
                      </div>
                    </div>

                    {req?.status === 'correction_required' && req?.adminComment && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#b91c1c',
                          background: '#fef2f2',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          marginBottom: '0.5rem',
                          fontStyle: 'italic',
                        }}
                      >
                        Fix needed: “{req.adminComment}”
                      </div>
                    )}

                    {pg.rent?.single && (
                      <div className="pg-card-rent">₹{pg.rent.single.toLocaleString()}/mo</div>
                    )}
                    {pg.isVerified && (
                      <span className="badge badge-verified" style={{ marginTop: 6 }}>
                        ✓ Verified
                      </span>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => navigate(`/owner/listings/${pg._id}/edit`)}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}
                        onClick={() => handleDelete(pg._id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination ───────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} listings
            </span>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </PageWrapper>
  );
}