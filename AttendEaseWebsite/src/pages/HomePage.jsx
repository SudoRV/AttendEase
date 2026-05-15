import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiWifi, FiWifiOff, FiBluetooth, FiClock } from 'react-icons/fi';
import LandingHeader from '../components/LandingHeader';
import { useTheme } from '../context/ThemeContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white">
        <LandingHeader />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-indigo-50 dark:bg-neutral-800 rounded-full border border-indigo-200 dark:border-indigo-500">
              <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">Smart Attendance Management</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
              Attendance Made Easy
            </h1>

            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
              AttendEase revolutionizes college attendance tracking with real-time synchronization, offline-capable notifications, and seamless teacher-student interaction.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
              >
                Try Dashboard
              </button>
              <button
                onClick={() => navigate('/about')}
                className="px-8 py-3 border border-indigo-500 text-indigo-500 rounded-lg font-semibold hover:bg-indigo-50 dark:hover:bg-neutral-800 transition"
              >
                Learn More
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-indigo-500">100%</div>
                <p className="text-neutral-600 dark:text-neutral-400">Uptime</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-500">Real-time</div>
                <p className="text-neutral-600 dark:text-neutral-400">Sync</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-500">Offline</div>
                <p className="text-neutral-600 dark:text-neutral-400">Ready</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-neutral-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Core Features</h2>
              <p className="text-neutral-600 dark:text-neutral-400">Everything you need for modern attendance management</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📊',
                  title: 'Real-time Dashboard',
                  desc: 'View attendance analytics instantly with beautiful visualizations'
                },
                {
                  icon: '📱',
                  title: 'Mobile Access',
                  desc: 'Manage attendance from any device, anywhere, anytime'
                },
                {
                  icon: '📢',
                  title: 'Instant Notifications',
                  desc: 'Get alerts for announcements and attendance updates'
                },
                {
                  icon: '✓',
                  title: 'Leave Management',
                  desc: 'Simple approval workflow for leave requests'
                },
                {
                  icon: '📅',
                  title: 'Schedule Sync',
                  desc: 'Automatic timetable management and sync'
                },
                {
                  icon: '🔒',
                  title: 'Secure Access',
                  desc: 'Role-based access for students and teachers'
                }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white dark:bg-neutral-700 rounded-xl border border-slate-200 dark:border-neutral-600 hover:shadow-lg transition"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-500 to-teal-500 rounded-2xl p-12 text-white text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Attendance?</h2>
            <p className="text-indigo-100 mb-8 text-lg">
              Join thousands of institutions using AttendEase for seamless attendance management
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Get Started Now
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-neutral-900 text-white py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-neutral-400">
              AttendEase - Making Attendance Management Simple & Reliable
            </p>
            <div className="flex justify-center gap-6 mt-4 text-sm text-neutral-500">
              <a href="/about" className="hover:text-indigo-400">About</a>
              <a href="/team" className="hover:text-indigo-400">Team</a>
              <a href="/ble" className="hover:text-indigo-400">Technology</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
