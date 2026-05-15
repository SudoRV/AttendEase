import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from '../components/LandingHeader';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white">
      <LandingHeader />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="mb-8 text-indigo-500 hover:text-indigo-600 font-semibold flex items-center gap-2"
          >
            ← Back to Home
          </button>

          <h1 className="text-4xl font-bold mb-12 bg-gradient-to-r from-indigo-500 to-teal-500 bg-clip-text text-transparent">
            About AttendEase
          </h1>

          {/* Section 1: Foundational Idea */}
          <section className="mb-12 p-8 bg-indigo-50 dark:bg-neutral-800 rounded-xl border border-indigo-200 dark:border-indigo-600">
            <h2 className="text-3xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">The Foundational Idea</h2>
            <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Attendance management has been a persistent challenge in educational institutions for decades.
              Traditional paper-based or spreadsheet systems are error-prone, time-consuming, and lack real-time insights.
            </p>
            <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
              The core idea behind AttendEase emerged from a simple observation: in today's connected world,
              attendance tracking should be instantaneous, transparent, and accessible from any device. We envisioned a
              system that could bridge the gap between teachers and students with seamless communication and automatic
              synchronization.
            </p>
          </section>

          {/* Section 2: How It Evolved */}
          <section className="mb-12 p-8 bg-teal-50 dark:bg-neutral-800 rounded-xl border border-teal-200 dark:border-teal-600">
            <h2 className="text-3xl font-bold mb-4 text-teal-600 dark:text-teal-400">Evolution of the Idea</h2>
            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              <div>
                <h3 className="font-bold text-lg mb-2">Phase 1: The Problem</h3>
                <p>We identified key pain points: manual roll calls consume class time, paper records get lost,
                and attendance data isn't real-time accessible to students.</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Phase 2: Digital First</h3>
                <p>Moved from manual systems to a centralized digital platform with real-time synchronization
                and cross-device access.</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Phase 3: Intelligent Features</h3>
                <p>Added leave management, analytics, notifications, and a mobile-first interface for better user experience.</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Phase 4: Offline Resilience</h3>
                <p>Introduced BLE mesh networking to enable offline-first synchronization and notification delivery even
                when internet connectivity is unreliable.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Project Name Evolution */}
          <section className="mb-12 p-8 bg-slate-100 dark:bg-neutral-800 rounded-xl border border-slate-300 dark:border-neutral-700">
            <h2 className="text-3xl font-bold mb-4">Project Name Evolution</h2>
            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p><strong>Initial Name:</strong> "InstantRoll" - Focused on quick attendance marking</p>
              <p><strong>Iteration 2:</strong> "AttendHub" - Emphasized community and connectivity</p>
              <p><strong>Final Name:</strong> <strong className="text-indigo-600 dark:text-indigo-400">AttendEase</strong> -
              Reflects the simplicity and ease of use that defines the platform</p>
            </div>
          </section>

          {/* Section 4: How the App Works */}
          <section className="mb-12 p-8 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
            <h2 className="text-3xl font-bold mb-6">How AttendEase Works</h2>
            <div className="space-y-6">
              <div className="pl-6 border-l-4 border-indigo-500">
                <h3 className="font-bold text-lg mb-2">Teacher Marks Attendance</h3>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Teachers open the AttendEase app, select the course and time slot, and mark students present/absent
                  in seconds using the intuitive interface.
                </p>
              </div>

              <div className="pl-6 border-l-4 border-teal-500">
                <h3 className="font-bold text-lg mb-2">Real-time Synchronization</h3>
                <p className="text-neutral-700 dark:text-neutral-300">
                  The data is instantly synced to the central database and pushed to student devices through push notifications
                  and automatic dashboard updates.
                </p>
              </div>

              <div className="pl-6 border-l-4 border-indigo-500">
                <h3 className="font-bold text-lg mb-2">Student View</h3>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Students can view their attendance records in real-time, track progress towards minimum attendance requirements,
                  and receive instant alerts for any announcements.
                </p>
              </div>

              <div className="pl-6 border-l-4 border-teal-500">
                <h3 className="font-bold text-lg mb-2">Leave Requests & Approval</h3>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Students submit leave requests which flow to the admin for approval. Once approved, the system automatically
                  adjusts attendance records.
                </p>
              </div>

              <div className="pl-6 border-l-4 border-indigo-500">
                <h3 className="font-bold text-lg mb-2">Analytics & Insights</h3>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Comprehensive dashboards provide attendance trends, insights, and reports for teachers and administrators
                  to identify patterns and take action.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Core Features */}
          <section className="mb-12 p-8 bg-gradient-to-br from-indigo-50 to-teal-50 dark:from-neutral-800 dark:to-neutral-800 rounded-xl border border-indigo-200 dark:border-indigo-600">
            <h2 className="text-3xl font-bold mb-6">Core Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Real-time Synchronization', desc: 'All data syncs instantly across devices' },
                { title: 'Mobile-First Design', desc: 'Optimized for phones, tablets, and desktops' },
                { title: 'Offline Support via BLE', desc: 'Works without internet using Bluetooth mesh' },
                { title: 'Leave Management', desc: 'Streamlined request and approval workflow' },
                { title: 'Instant Notifications', desc: 'Push alerts for announcements and updates' },
                { title: 'Analytics Dashboard', desc: 'Visual insights into attendance patterns' },
                { title: 'Role-Based Access', desc: 'Secure separation of student and teacher views' },
                { title: 'Cross-Platform', desc: 'Works on Web, iOS, and Android' }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0 mt-1">✓</div>
                  <div>
                    <h4 className="font-bold">{feature.title}</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience AttendEase?</h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-xl transition"
            >
              Try the Dashboard
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
