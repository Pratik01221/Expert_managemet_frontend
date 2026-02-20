import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const STATUS_CONFIG = {
  pending: { label: 'Pending', className: 'status-pending', icon: '⏳' },
  confirmed: { label: 'Confirmed', className: 'status-confirmed', icon: '✅' },
  completed: { label: 'Completed', className: 'status-completed', icon: '🎉' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled', icon: '❌' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const fetchBookings = async (e) => {
    e?.preventDefault();
    if (!inputEmail.trim()) return;
    const trimmed = inputEmail.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }
    setEmail(trimmed);
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const { data } = await API.get(`/bookings?email=${encodeURIComponent(trimmed)}`);
      setBookings(data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') fetchBookings(); };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await API.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>Track and manage your expert sessions</p>
      </div>

      <div className="email-lookup">
        <input
          className="search-input"
          type="email"
          placeholder="Enter your email to find bookings..."
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ maxWidth: 400, padding: '11px 16px' }}
        />
        <button className="btn btn-primary" onClick={fetchBookings} disabled={loading}>
          {loading ? '⏳' : '🔍'} Find Bookings
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Loading your bookings...</p>
        </div>
      )}

      {!loading && searched && bookings.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No bookings found</h3>
          <p>We couldn't find any bookings for <strong>{email}</strong></p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse Experts
          </Link>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <>
          <p style={{ marginBottom: 16, color: 'var(--gray-500)', fontSize: '0.9rem' }}>
            Found {bookings.length} booking{bookings.length !== 1 ? 's' : ''} for {email}
          </p>
          <div className="bookings-list">
            {bookings.map((b) => {
              const statusConf = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <div key={b._id} className="card booking-item">
                  <div>
                    <div className="booking-expert-name">
                      {b.expertId?.name || b.expertName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 6 }}>
                      {b.expertId?.category || ''}
                    </div>
                    <div className="booking-details">
                      <span className="booking-detail">📅 {formatDate(b.date)}</span>
                      <span className="booking-detail">🕐 {b.timeSlot}</span>
                      <span className="booking-detail">👤 {b.userName}</span>
                    </div>
                    {b.notes && (
                      <p style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                        "{b.notes.substring(0, 80)}{b.notes.length > 80 ? '...' : ''}"
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <span className={`status-badge ${statusConf.className}`}>
                      {statusConf.icon} {statusConf.label}
                    </span>
                    {b.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.75rem', color: 'var(--success)', borderColor: 'var(--success)' }}
                          onClick={() => handleStatusUpdate(b._id, 'confirmed')}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.75rem', color: 'var(--error)', borderColor: 'var(--error)' }}
                          onClick={() => {
                            if (window.confirm('Cancel this booking?')) {
                              handleStatusUpdate(b._id, 'cancelled');
                            }
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {b.status === 'confirmed' && (
                      <button
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleStatusUpdate(b._id, 'completed')}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!searched && (
        <div className="card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
            Find Your Bookings
          </h3>
          <p style={{ color: 'var(--gray-400)', maxWidth: 340, margin: '0 auto' }}>
            Enter the email address you used when booking to see all your sessions
          </p>
        </div>
      )}
    </div>
  );
}
