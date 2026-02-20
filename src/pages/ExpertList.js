import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const CATEGORIES = ['Technology', 'Business', 'Design', 'Marketing', 'Finance', 'Health', 'Education', 'Legal'];

function StarRating({ rating }) {
  return (
    <span>
      {'★'.repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? '½' : ''}
      <span style={{ color: 'var(--gray-300)' }}>
        {'☆'.repeat(5 - Math.ceil(rating))}
      </span>
    </span>
  );
}

export default function ExpertList() {
  const navigate = useNavigate();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalExperts: 0 });
  const [page, setPage] = useState(1);

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      const { data } = await API.get(`/experts?${params}`);
      setExperts(data.experts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetchExperts(); }, [fetchExperts]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Find Your Expert</h1>
        <p>Connect with industry-leading professionals for personalized sessions</p>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name or specialty..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select className="category-filter" value={category} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Finding experts for you...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load experts</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchExperts}>Try Again</button>
        </div>
      ) : experts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <h3>No experts found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: 20, color: 'var(--gray-500)', fontSize: '0.9rem' }}>
            Showing {experts.length} of {pagination.totalExperts} experts
          </p>
          <div className="experts-grid">
            {experts.map((expert) => (
              <div
                key={expert._id}
                className="card card-hover expert-card"
                onClick={() => navigate(`/experts/${expert._id}`)}
              >
                <div className="expert-card-header">
                  <img
                    src={expert.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`}
                    alt={expert.name}
                    className="expert-avatar"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=6366f1&color=fff`; }}
                  />
                  <div>
                    <div className="expert-name">{expert.name}</div>
                    <span className="expert-category-badge">{expert.category}</span>
                  </div>
                </div>
                <div className="expert-meta">
                  <span className="meta-item">
                    <span className="star-filled">★</span>
                    {expert.rating.toFixed(1)} ({expert.totalReviews} reviews)
                  </span>
                  <span className="meta-item">
                    💼 {expert.experience} yrs
                  </span>
                </div>
                <p className="expert-bio">{expert.bio}</p>
                <div className="expert-footer">
                  <div className="hourly-rate">
                    ₹{expert.hourlyRate} <span>/hr</span>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/book/${expert._id}?name=${encodeURIComponent(expert.name)}`); }}
                  >
                    Book Session
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >‹</button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="pagination-info">…</span>
                    )}
                    <button
                      className={`pagination-btn ${p === page ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
                  </React.Fragment>
                ))}
              <button
                className="pagination-btn"
                disabled={page === pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >›</button>
              <span className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
