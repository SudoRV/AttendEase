import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg text-neutral-800 dark:text-white">AttendEase</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/#features" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500 transition">Features</Link>
            <Link to="/about" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500 transition">About</Link>
            <Link to="/ble" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500 transition">BLE Tech</Link>
            <Link to="/team" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500 transition">Team</Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-neutral-700 text-neutral-700 dark:text-white hover:bg-slate-200 dark:hover:bg-neutral-600 transition"
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-indigo-500 border border-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-neutral-700 transition font-medium"
              >
                Sign In
              </Link>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition font-medium"
              >
                Dashboard
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 dark:text-white"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-50 dark:bg-neutral-700 border-t border-slate-200 dark:border-neutral-600">
            <nav className="flex flex-col gap-4 p-4">
              <Link to="/#features" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500">Features</Link>
              <Link to="/about" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500">About</Link>
              <Link to="/ble" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500">BLE Tech</Link>
              <Link to="/team" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500">Team</Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-neutral-600">
                <Link
                  to="/login"
                  className="px-4 py-2 text-center text-indigo-500 border border-indigo-500 rounded-lg"
                >
                  Sign In
                </Link>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-teal-500 text-white rounded-lg font-medium"
                >
                  Dashboard
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
