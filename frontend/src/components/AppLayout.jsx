import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { clearSession, getStoredUser } from '../utils/auth';
import { assets } from '../assets/assets';
import './AppLayout.css';

const AppLayout = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout API failures and clear the local session anyway.
    }

    clearSession();
    navigate('/auth');
  };

  return (
    <div className='app-shell'>
      <aside className='app-sidebar'>
        <div className='sidebar-brand'>
          <img src={assets.logo} alt='XPressify logo' className='sidebar-logo' />
          <div>
            <h1>XPressify</h1>
            <p>Emotion-led music</p>
          </div>
        </div>

        <nav className='sidebar-nav'>
          <NavLink to='/dashboard' className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to='/music' className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            Music
          </NavLink>
          <NavLink to='/capture' className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            Capture
          </NavLink>
          <NavLink to='/insights' className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            Insights
          </NavLink>
          <NavLink to='/library' className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            Library
          </NavLink>
        </nav>

        <div className='sidebar-footer'>
          <div className='sidebar-user'>
            <span className='sidebar-user-label'>Signed in as</span>
            <strong>{user?.name || user?.email || 'User'}</strong>
          </div>
          <button className='sidebar-logout' onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className='app-content'>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;