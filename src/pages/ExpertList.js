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
      setError("Failed to load experts. Check backend URL.");
      setExperts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

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
      <h1>Find Your Expert</h1>

      {/* Filters */}
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select value={category} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && <p>Loading experts...</p>}

      {/* Error */}
      {!loading && error && (
        <div>
          <p style={{ color: "red" }}>{error}</p>
          <button onClick={fetchExperts}>Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && (!experts || experts.length === 0) && (
        <p>No experts found.</p>
      )}

      {/* Experts */}
      {!loading && !error && experts?.length > 0 && (
        <>
          <p>
            Showing {experts.length} of {pagination?.totalExperts || 0} experts
          </p>

          <div>
            {experts.map((expert) => (
              <div
                key={expert?._id}
                onClick={() => navigate(`/experts/${expert?._id}`)}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  marginBottom: "10px",
                  cursor: "pointer",
                }}
              >
                <h3>{expert?.name || "Unnamed Expert"}</h3>
                <p>Category: {expert?.category || "N/A"}</p>
                <p>
                  ⭐{" "}
                  {expert?.rating
                    ? expert.rating.toFixed(1)
                    : "0.0"}{" "}
                  ({expert?.totalReviews || 0} reviews)
                </p>
                <p>Experience: {expert?.experience || 0} yrs</p>
                <p>₹{expert?.hourlyRate || 0}/hr</p>

                <button
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
            ))}
          </div>
        </>
      )}
    </div>
  );
}