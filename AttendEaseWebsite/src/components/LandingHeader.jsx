import { useEffect, useState } from "react";
import {
    FiGithub as Github,
    FiLinkedin as Linkedin,
    FiMail as Mail,
    FiDownload as Download,
    FiSmartphone as Smartphone,
    FiGrid as LayoutDashboard,
    FiUsers as Users,
    FiInfo as Info,
    FiChevronRight as ChevronRight,
    FiShield as Shield,
    FiZap as Zap,
    FiBell as Bell,
    FiBarChart2 as BarChart2,
    FiExternalLink as ExternalLink,
    FiCalendar as Calendar,
    FiWifiOff as Offline,
    FiHome,
} from "react-icons/fi";

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { AppStates } from '../services/states';

import Logo from "../images/AttendEase_icon_colored.png";
import LogoA from "../images/attendease_icon.png";
import { Bluetooth } from "lucide-react";


const NAV_TABS = [
    { id: 'home', label: 'Home', link: '/', icon: <FiHome size={15} /> },
    { id: 'about', label: 'About Us', link: '/about', icon: <Info size={15} /> },
    { id: 'ble', label: 'BLE Tech', link: '/ble', icon: <Bluetooth size={15} /> },
    { id: 'developers', label: 'About Developers', link: '/team', icon: <Users size={15} /> },
    { id: 'download', label: 'Download App', link: '/download', icon: <Download size={15} /> },
    { id: 'dashboard', label: 'Dashboard', link: '/dashboard', icon: <LayoutDashboard size={15} /> },
];

export default function LandingHeader({ toggleSidebar }) {
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { userData, } = AppStates();

    return (
        <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/20 dark:bg-black/30 dark:border-neutral-700 border-t-0 border-l-0 border-r-0 border-solid border-b-2 border-indigo-500">
            
            <div className="flex items-center justify-between h-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
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

                    {/* Desktop CTA Buttons */}
                    <div className="hidden md:flex gap-3">
                        {
                            !!!userData?.user_id?.trim() && (
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
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:shadow-lg transition font-medium border-none"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>

            </div>

            {/* tabs */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-2 lg:px-8 -mb-0.5 overflow-x-auto overflow-y-hidden">
                <div className="max-w-4xl items-left justify-left flex gap-2 mx-2 md:gap-5">
                    {NAV_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                navigate(tab.link);
                            }}
                            className={`rounded-t-2xl flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${location.pathname === tab.link
                                ? 'text-gray-800 dark:text-neutral-100 border-indigo-500 dark:border-neutral-700 dark:border-b-0 border-solid border-3 border-b-transparent bg-[#f5f7fb] dark:bg-neutral-900'
                                : 'border-t-1 border-r-1 border-l-1 mb-0.5 border-b-0 border-slate-500/20 border-solid bg-neutral-50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400 hover:text-slate-100 hover:bg-indigo-500'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
};