import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const CATEGORIES = [
  "Technology",
  "Business",
  "Design",
  "Marketing",
  "Finance",
  "Health",
  "Education",
  "Legal",
];

export default function ExpertList() {
  const navigate = useNavigate();

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalExperts: 0,
  });
  const [page, setPage] = useState(1);

  const fetchExperts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page,
        limit: 9,
      });

      if (search) params.append("search", search);
      if (category) params.append("category", category);

      const response = await API.get(`/experts?${params}`);
      const data = response?.data || {};

      setExperts(data?.experts || []);
      setPagination(
        data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalExperts: 0,
        }
      );
    } catch (err) {
      console.error("Fetch Experts Error:", err);
      setError("Failed to load experts.");
      setExperts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

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
        <p>Connect with industry-leading professionals</p>
      </div>

      <div className="filters-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select
          className="category-filter"
          value={category}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading experts...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchExperts}>
            Retry
          </button>
        </div>
      ) : !experts || experts.length === 0 ? (
        <div className="empty-state">
          <p>No experts found.</p>
        </div>
      ) : (
        <>
          <p className="results-count">
            Showing {experts.length} of {pagination?.totalExperts || 0} experts
          </p>

          <div className="experts-grid">
            {experts.map((expert) => (
              <div
                key={expert?._id}
                className="card card-hover expert-card"
                onClick={() => navigate(`/experts/${expert?._id}`)}
              >
                <div className="expert-card-header">
                  <img
                    src={
                      expert?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        expert?.name || "User"
                      )}`
                    }
                    alt={expert?.name}
                    className="expert-avatar"
                  />

                  <div>
                    <div className="expert-name">
                      {expert?.name || "Unnamed Expert"}
                    </div>
                    <span className="expert-category-badge">
                      {expert?.category || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="expert-meta">
                  <span>
                    ⭐{" "}
                    {expert?.rating
                      ? expert.rating.toFixed(1)
                      : "0.0"}{" "}
                    ({expert?.totalReviews || 0})
                  </span>

                  <span>💼 {expert?.experience || 0} yrs</span>
                </div>

                <p className="expert-bio">
                  {expert?.bio || "No bio available."}
                </p>

                <div className="expert-footer">
                  <div className="hourly-rate">
                    ₹{expert?.hourlyRate || 0} /hr
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/book/${expert?._id}?name=${encodeURIComponent(
                          expert?.name || ""
                        )}`
                      );
                    }}
                  >
                    Book Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}