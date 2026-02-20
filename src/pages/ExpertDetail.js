import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useSocket } from '../context/SocketContext';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [expert, setExpert] = useState(null);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [justBooked, setJustBooked] = useState(null); // { date, time }
  const joinedRef = useRef(false);

  useEffect(() => {
    fetchExpert();
    // eslint-disable-next-line
  }, [id]);

  const fetchExpert = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get(`/experts/${id}`);
      setExpert(data);
      setSlotsByDate(data.slotsByDate || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket || !id || joinedRef.current) return;
    joinedRef.current = true;
    socket.emit('join-expert', id);

    const handleSlotBooked = ({ date, timeSlot }) => {
      setSlotsByDate((prev) => {
        const updated = { ...prev };
        if (updated[date]) {
          updated[date] = updated[date].map((s) =>
            s.time === timeSlot ? { ...s, isBooked: true } : s
          );
        }
        return updated;
      });
      setJustBooked({ date, time: timeSlot });
      setTimeout(() => setJustBooked(null), 2000);
    };

    const handleSlotReleased = ({ date, timeSlot }) => {
      setSlotsByDate((prev) => {
        const updated = { ...prev };
        if (updated[date]) {
          updated[date] = updated[date].map((s) =>
            s.time === timeSlot ? { ...s, isBooked: false } : s
          );
        }
        return updated;
      });
    };

    socket.on('slot-booked', handleSlotBooked);
    socket.on('slot-released', handleSlotReleased);

    return () => {
      socket.emit('leave-expert', id);
      socket.off('slot-booked', handleSlotBooked);
      socket.off('slot-released', handleSlotReleased);
      joinedRef.current = false;
    };
  }, [socket, id]);

  const handleBookSlot = (date, time) => {
    navigate(`/book/${id}?name=${encodeURIComponent(expert.name)}&date=${date}&time=${encodeURIComponent(time)}`);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <p className="loading-text">Loading expert profile...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3>Failed to load expert</h3>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={fetchExpert}>Try Again</button>
    </div>
  );

  if (!expert) return null;

  const dates = Object.keys(slotsByDate).sort();

  return (
    <div>
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back to Experts
      </button>

      <div className="card expert-detail-hero" style={{ marginBottom: 24 }}>
        <img
          src={expert.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`}
          alt={expert.name}
          className="expert-detail-avatar"
          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=6366f1&color=fff&size=100`; }}
        />
        <div className="expert-detail-info">
          <div className="expert-detail-name">{expert.name}</div>
          <span className="expert-category-badge">{expert.category}</span>
          <div className="expert-detail-meta">
            <span className="meta-item">
              <span className="star-filled">★</span>
              {expert.rating.toFixed(1)} ({expert.totalReviews} reviews)
            </span>
            <span className="meta-item">💼 {expert.experience} years experience</span>
          </div>
          <p className="expert-detail-bio">{expert.bio}</p>
        </div>
        <div className="expert-detail-action">
          <div className="rate-big">₹{expert.hourlyRate} <span>/hr</span></div>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/book/${id}?name=${encodeURIComponent(expert.name)}`)}
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="card slots-section">
        <h2>
          Available Time Slots
          <span className="realtime-badge">
            <span className="realtime-dot" />
            Live Updates
          </span>
        </h2>

        {dates.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <div className="empty-icon">📅</div>
            <h3>No upcoming slots</h3>
            <p>Check back later for available sessions</p>
          </div>
        ) : (
          dates.map((date) => (
            <div className="date-group" key={date}>
              <div className="date-label">{formatDate(date)}</div>
              <div className="slots-grid">
                {slotsByDate[date].map((slot) => {
                  const isJustBooked = justBooked?.date === date && justBooked?.time === slot.time;
                  return (
                    <button
                      key={`${date}-${slot.time}`}
                      className={`slot-btn ${slot.isBooked ? 'booked' : ''} ${isJustBooked ? 'just-booked' : ''}`}
                      disabled={slot.isBooked}
                      onClick={() => !slot.isBooked && handleBookSlot(date, slot.time)}
                      title={slot.isBooked ? 'Already booked' : `Book ${slot.time}`}
                    >
                      {slot.time}
                      {slot.isBooked && ' ✗'}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
