import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="border-b border-line bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-semibold text-white">
            {user?.name?.slice(0, 2)?.toUpperCase() || 'VB'}
          </div>
          <div>
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="text-lg font-semibold text-ink">
              VisionBoard
            </Link>
            <div className="text-xs text-slate-500">Plan / Track / Achieve</div>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
                Dashboard
              </NavLink>
              <NavLink to="/goals" className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
                Goals
              </NavLink>
              <NavLink to="/ai-insights" className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
                AI Insights
              </NavLink>
              <NavLink to="/predictions" className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
                Predictions
              </NavLink>
              <button onClick={handleLogout} className="btn-secondary" type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
