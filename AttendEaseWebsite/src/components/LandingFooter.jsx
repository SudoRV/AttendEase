import React from 'react';
import { FiArrowRight, FiInfo, FiUsers, FiCpu, FiHeart, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';
import Logo from "../images/attendease_icon.png";

export default function LandingFooter() {
    return (
        <footer className="bg-neutral-950 text-white pt-16 pb-8 border-t border-neutral-800/50 mt-auto">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6 group cursor-default">
                        <div className="p-2 bg-indigo-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                            <img src={Logo} className='h-5' alt="Logo" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">
                            Attend<span className="text-indigo-500">Ease</span>
                        </span>
                    </div>

                    <p className="text-neutral-400 max-w-sm text-center leading-relaxed text-sm">
                        Revolutionizing attendance management with smart, reliable, and real-time tracking technology.
                    </p>

                    <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4 mt-10 text-sm font-medium text-neutral-400">
                        <a href="/about" className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors duration-200">
                            <FiInfo size={16} /> About
                        </a>
                        <a href="/team" className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors duration-200">
                            <FiUsers size={16} className="text-indigo-500" /> Team
                        </a>
                        <a href="/ble" className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors duration-200">
                            <FiCpu size={16} className="text-indigo-500" /> BLE Technology
                        </a>
                    </nav>

                    <div className="flex gap-5 mt-12">
                        {[
                            { Icon: FiGithub, href: "#" },
                            { Icon: FiTwitter, href: "#" },
                            { Icon: FiLinkedin, href: "#" }
                        ].map((social, i) => (
                            <a
                                key={i}
                                href={social.href}
                                className="p-3 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300"
                            >
                                <social.Icon size={18} />
                            </a>
                        ))}
                    </div>

                    <div className="w-full pt-8 mt-12 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">
                        <p>© {new Date().getFullYear()} AttendEase. All rights reserved.</p>
                        <p className="flex items-center gap-1.5">
                            Built with <FiHeart className="text-rose-500 fill-rose-500" size={12} /> for modern institutions
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}