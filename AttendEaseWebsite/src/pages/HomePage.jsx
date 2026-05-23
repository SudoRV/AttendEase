import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiZap, FiCloudOff, FiArrowRight } from 'react-icons/fi';
import LandingHeader from '../components/LandingHeader';
import { useTheme } from '../context/ThemeContext';
import LandingFooter from '../components/LandingFooter';

export default function HomePage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`${isDark ? 'dark' : ''} h-full`}>
      <LandingHeader />

      {/* Hero Section*/}
      <section className="px-4 sm:px-6 lg:px-8 -mt-[6rem] h-full flex flex-col items-center justify-center py-16 md:py-24 bg-[#f5f7fb] dark:bg-neutral-900">
        
        <div className="max-w-5xl mx-auto text-center mt-[4rem]">
          <div className="inline-block mb-4 px-4 py-2 bg-indigo-50 dark:bg-neutral-800 rounded-full border border-indigo-200 dark:border-indigo-500">
            <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">Smart Academics Management</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-500 via-indigo-600 to-neutral-900 dark:to-neutral-50 bg-clip-text text-transparent">
            Academics Made Easy
          </h1>

          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            AttendEase revolutionizes college attendance tracking with real-time synchronization, offline-capable notifications, and seamless teacher-student interaction.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105 border-none"
            >
              Try Dashboard
            </button>
            <button
              onClick={() => navigate('/about')}
              className="px-8 py-3 border border-indigo-500 text-indigo-500 rounded-lg font-semibold bg-transparent hover:bg-indigo-50 dark:hover:bg-neutral-800 transition"
            >
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Uptime Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-50 to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-850 p-8 border border-neutral-200/70 dark:border-neutral-700 shadow-md transition-all duration-300 hover:shadow-xl hover:border-indigo-500/30 hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl transition-all duration-500 group-hover:bg-indigo-500/20 group-hover:scale-150" />
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px] text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/80">
                    Reliability
                  </span>
                  <div className="text-indigo-600 bg-white p-2.5 rounded-xl shadow-sm border border-neutral-200/40 group-hover:rotate-6 transition-transform">
                    <FiShield size={20} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white mb-1">100%</div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Uptime engine built for zero-fault execution.</p>
                </div>
              </div>
            </div>

            {/* Sync Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-50 to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-850 p-8 border border-neutral-200/70 dark:border-neutral-700 shadow-md transition-all duration-300 hover:shadow-xl hover:border-teal-500/30 hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-teal-500/10 blur-2xl transition-all duration-500 group-hover:bg-teal-500/20 group-hover:scale-150" />
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px] text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100/80">
                    Pipeline
                  </span>
                  <div className="text-teal-600 bg-white p-2.5 rounded-xl shadow-sm border border-neutral-200/40 group-hover:rotate-6 transition-transform">
                    <FiZap size={20} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white mb-1">Real-time</div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Instant bidirectional data synchronization.</p>
                </div>
              </div>
            </div>

            {/* Offline Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-50 to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-850 p-8 border border-neutral-200/70 dark:border-neutral-700 shadow-md transition-all duration-300 hover:shadow-xl hover:border-amber-500/30 hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl transition-all duration-500 group-hover:bg-amber-500/20 group-hover:scale-150" />
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px] text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/80">
                    Local First
                  </span>
                  <div className="text-amber-600 bg-white p-2.5 rounded-xl shadow-sm border border-neutral-200/40 group-hover:rotate-6 transition-transform">
                    <FiCloudOff size={20} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white mb-1">Offline</div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Full functionality, with or without internet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className="!h-full bg-[#f5f7fb] dark:bg-neutral-900 text-neutral-800 dark:text-white flex flex-col">

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-900">
          <div className="relative max-w-5xl mx-auto overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-teal-500 p-8 md:p-16 text-center shadow-2xl shadow-indigo-500/20">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path>
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">
                Ready to Transform Your <br className="hidden md:block" /> Attendance?
              </h2>
              <p className="max-w-xl mx-auto text-indigo-50 mb-10 text-lg md:text-xl font-light leading-relaxed">
                Join Hundreds of institutions using <span className="font-semibold text-white">AttendEase</span> for seamless, automated academics management.
              </p>

              <button
                onClick={() => navigate('/dashboard')}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-400/30 hover:scale-105 active:scale-95 transition-all duration-300 border-none"
              >
                Get Started Now
                <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <p className="mt-6 text-indigo-100/70 text-sm font-medium">
                No credit card required • free trial / early access
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <LandingFooter />
        
      </div>
    </div>
  );
};