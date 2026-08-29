import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { AppStates } from '../services/states';

import Logo from "../images/AttendEase_icon_colored.png";
import LogoA from "../images/attendease_icon.png";

export default function LandingHeader({ toggleSidebar }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const { user, } = AppStates();

  return (
    <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/20 dark:bg-black/20 border-b border-slate-200 dark:border-neutral-700 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div onClick={toggleSidebar} className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-800 to-indigo-400 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={LogoA} className='h-[55%] hover:rotate-[20deg] transition-all duration-300 cursor-pointer' />
            </div>
            <span className="font-bold text-lg text-neutral-800 dark:text-white">AttendEase</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 border-none">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-neutral-700 text-neutral-700 dark:text-white hover:bg-slate-200 dark:hover:bg-neutral-600 transition border-none"
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/#features" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500 transition no-underline">Features</Link>
              <Link to="/about" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500 transition no-underline">About</Link>
              <Link to="/ble" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500 transition no-underline">BLE Tech</Link>
              <Link to="/team" className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-500 transition no-underline">Team</Link>
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex gap-3">
              {
                !!!user?.id?.trim() && (
                  <Link
                    to="/login"
                    className="px-4 py-2 text-center text-indigo-500 border border-indigo-500 rounded-lg !bg-red-400"
                  >
                    Sign In
                  </Link>
                )
              }

              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:shadow-lg transition font-medium border-none"
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

                {
                  !user?.id?.trim() && (
                    <Link
                      to="/login"
                      className="px-4 py-2 text-center text-indigo-500 border border-indigo-500 rounded-lg"
                    >
                      Sign In
                    </Link>
                  )
                }

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
