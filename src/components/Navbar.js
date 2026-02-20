import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <div className="logo-icon">✦</div>
        <span className="brand-name">ExpertConnect</span>
      </NavLink>
      <div className="navbar-links">
        <NavLink to="/" end>Experts</NavLink>
        <NavLink to="/my-bookings">My Bookings</NavLink>
      </div>
    </nav>
  );
}
