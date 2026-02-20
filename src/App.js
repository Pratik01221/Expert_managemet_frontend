import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ExpertList from './pages/ExpertList';
import ExpertDetail from './pages/ExpertDetail';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import './index.css';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ExpertList />} />
              <Route path="/experts/:id" element={<ExpertDetail />} />
              <Route path="/book/:expertId" element={<Booking />} />
              <Route path="/my-bookings" element={<MyBookings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
