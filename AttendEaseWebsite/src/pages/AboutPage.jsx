import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Bell,
  Users,
  ShieldCheck,
  Clock3,
  Database,
  ArrowRight,
  BookOpen,
  Workflow,
  CheckCircle2,
} from 'lucide-react';
import LandingHeader from '../components/LandingHeader';
import { useTheme } from '../context/ThemeContext';
import LandingFooter from '../components/LandingFooter';

export default function AboutPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const problems = [
    {
      icon: Clock3,
      title: 'Communication Delays',
      desc: 'Students often arrive for classes only to discover that lectures were cancelled or rescheduled due to delayed communication.',
    },
    {
      icon: CalendarDays,
      title: 'Static Timetables',
      desc: 'Traditional notice-board timetables cannot reflect substitutions, venue changes, or emergency schedule updates in real-time.',
    },
    {
      icon: Bell,
      title: 'No Real-Time Updates',
      desc: 'Institutes struggle to instantly notify students and faculty about important academic announcements and changes.',
    },
    {
      icon: Workflow,
      title: 'Manual Faculty Workflow',
      desc: 'Leave approvals and class substitutions are still handled manually, making the process slow and inefficient.',
    },
  ];

  const features = [
    {
      icon: CalendarDays,
      title: 'Dynamic Timetable',
      desc: 'Students receive real-time timetable updates including cancelled classes, substituted lectures, room changes, and rescheduled sessions.',
    },
    {
      icon: Workflow,
      title: 'Class Substitution System',
      desc: 'Teachers can cancel lectures while other faculty members can acquire and substitute those classes dynamically.',
    },
    {
      icon: Users,
      title: 'Student Leave Management',
      desc: 'Students can submit leave applications digitally while faculty can approve or decline requests directly from the dashboard.',
    },
    {
      icon: Database,
      title: 'Attendance Dashboard',
      desc: 'Students can access attendance reports and academic dashboard data fetched directly from the university system.',
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access Control',
      desc: 'Separate secure dashboards for students, teachers, and administration with controlled feature access.',
    },
    {
      icon: Bell,
      title: 'Scoped Alerts & Announcements',
      desc: 'Announcements and academic alerts are delivered only to relevant branches, semesters, sections, or affected students.',
    },
    {
      icon: Workflow,
      title: 'BLE Mesh Notification Delivery',
      desc: 'BLE mesh technology helps deliver notifications to nearby devices even during poor network connectivity conditions.',
    },
    {
      icon: CheckCircle2,
      title: 'Cross Platform Access',
      desc: 'The system provides both mobile and web applications for seamless academic management across devices.',
    },
  ];

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen bg-[#f5f7fb] dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100`}>
      <LandingHeader />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className='max-w-[1350px] mx-auto space-y-20'>

          {/* HERO */}
          <section className="grid gap-16 items-center">
            <div className='w-full'>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 mb-6 text-sm font-medium">
                <BookOpen className="w-4 h-4" />
                Academic Scheduler & Management System
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-neutral-900 dark:text-neutral-100 mb-8">
                Real-Time Academic
                <span className="text-indigo-600"> Management</span>
                <br />
                For Modern Institutions.
              </h1>

              <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300 leading-relaxed mb-10">
                The Academic Scheduler & Management System is a centralized academic communication
                and management platform designed for educational institutions. The system provides
                both a mobile application and a web application that bridge the communication gap
                between students, teachers, and administration through real-time academic coordination.

                <br />
                <br />

                The platform replaces outdated paper-based timetables and delayed manual communication
                with a dynamic timetable system capable of instantly reflecting cancelled classes,
                substituted lectures, venue changes, and schedule modifications in real time. Whenever
                a timetable is modified, affected students immediately receive push notifications,
                ensuring they are always updated before attending a class.

                <br />
                <br />

                Teachers can cancel lectures, announce substitutions, and manage academic updates
                directly through the platform. Other faculty members can acquire or substitute classes,
                and the system automatically notifies only the affected students to avoid unnecessary
                alerts and communication clutter.

                <br />
                <br />

                The system also includes a digital leave management workflow where students can submit
                leave applications and teachers can approve or decline requests directly through their
                dashboard. In addition, students have access to their attendance reports, academic
                dashboard, announcements, and timetable data fetched directly from the university system.

                <br />
                <br />

                The core focus of the platform is real-time academic synchronization through dynamic
                timetables, scoped notifications, substitution management, targeted announcements,
                attendance visibility, and streamlined communication between students and faculty.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                {[
                  'Dynamic Timetables',
                  'Class Substitution System',
                  'Scoped Announcements',
                  'Student Leave Management',
                  'BLE Mesh Notification Delivery',
                  'Real-Time Notifications',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="px-5 py-3 rounded-xl bg-indigo-100 border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="group px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-3 hover:bg-indigo-700 transition-all duration-300 border-none"
              >
                Launch Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
            </div>

            {/* Preview Card */}
            {/* <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-sm text-neutral-500">Today’s Schedule</p>
                <h3 className="text-2xl font-bold mt-1 text-neutral-900">Wednesday</h3>
              </div>

              <div className="px-4 py-2 rounded-lg bg-green-50 text-green-700 border border-green-100 text-sm font-medium">
                Live Sync Enabled
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  time: '09:00 AM',
                  subject: 'Cryptography',
                  status: 'Cancelled',
                },
                {
                  time: '11:00 AM',
                  subject: 'Operating Systems',
                  status: 'Active',
                },
                {
                  time: '01:00 PM',
                  subject: 'DBMS Lab',
                  status: 'Room Changed',
                },
              ].map((cls, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-5 rounded-2xl border border-neutral-200 bg-neutral-50"
                >
                  <div>
                    <p className="text-sm text-neutral-500">{cls.time}</p>
                    <h4 className="font-semibold text-lg text-neutral-900">{cls.subject}</h4>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      cls.status === 'Cancelled'
                        ? 'bg-red-50 text-red-700'
                        : cls.status === 'Room Changed'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {cls.status}
                  </div>
                </div>
              ))}
            </div>
          </div> */}
          </section>

          {/* INTRODUCTION */}
          <section className="max-w-5xl mx-auto text-center">
            <p className="text-indigo-600 font-semibold uppercase tracking-[0.2em] text-sm mb-4">
              Why This System Exists
            </p>

            <h2 className="text-5xl font-black text-neutral-900 dark:text-neutral-100 leading-tight mb-8">
              Built To Eliminate Academic Coordination Problems
            </h2>

            <div className="space-y-6 text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <p>
                Educational institutions still rely on static notice boards, delayed announcements, and manual schedule coordination. These outdated workflows create confusion for students, increase administrative overhead, and make real-time academic communication difficult.
              </p>

              <p>
                Students often travel to college only to discover that a class was cancelled. Faculty members manually coordinate substitutions and leave requests. Printed timetables cannot reflect emergency updates, room changes, or live schedule modifications.
              </p>

              <p>
                This platform centralizes timetables, announcements, substitutions, and leave management into one connected digital ecosystem that keeps students and faculty instantly informed.
              </p>
            </div>
          </section>

          {/* PROBLEMS */}
          <section>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-neutral-900 dark:text-neutral-100 mb-6">
                Problems Solved By The Platform
              </h2>

              <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
                The system is designed around real-world academic management challenges faced daily inside institutions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {problems.map((problem, idx) => {
                const Icon = problem.icon;

                return (
                  <div
                    key={idx}
                    className="
                    rounded-3xl p-8 transition-all duration-300 hover:shadow-xl
                    bg-white border border-neutral-200
                    dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-xl
                    dark:hover:bg-white/[0.07]
                  "
                  >
                    <div
                      className="
                      w-14 h-14 rounded-2xl flex items-center justify-center mb-6
                      bg-indigo-100 text-indigo-700
                      dark:bg-indigo-500/20 dark:text-indigo-300
                    "
                    >
                      <Icon className="w-7 h-7" />
                    </div>

                    <h3
                      className="
                      text-2xl font-bold mb-4
                      text-neutral-900
                      dark:text-white
                    "
                    >
                      {problem.title}
                    </h3>

                    <p
                      className="
                      text-lg leading-relaxed
                      text-neutral-600
                      dark:text-gray-300
                    "
                    >
                      {problem.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FEATURES */}
          <section>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-neutral-900 dark:text-neutral-100 mb-6">
                Core Features
              </h2>

              <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-4xl mx-auto leading-relaxed">
                The platform combines real-time timetable synchronization, academic
                communication, attendance visibility, and faculty workflow management
                into one centralized academic ecosystem for students, teachers, and administration.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={idx}
                    className="
                    group rounded-3xl p-8 transition-all duration-300
                    hover:shadow-2xl hover:-translate-y-1
                    bg-white shadow-md border border-neutral-200
                    dark:bg-white/5 dark:border-white/10 dark:shadow-none
                    dark:hover:bg-white/[0.07]
                  "
                  >
                    <div
                      className="
                      w-14 h-14 rounded-2xl flex items-center justify-center mb-6
                      bg-indigo-100 text-indigo-700
                      transition-all duration-300
                      group-hover:bg-indigo-600 group-hover:text-white
                      dark:bg-indigo-500/20 dark:text-indigo-300
                    "
                    >
                      <Icon className="w-7 h-7" />
                    </div>

                    <h3
                      className="
                      text-2xl font-bold mb-4
                      text-neutral-900
                      dark:text-white
                    "
                    >
                      {feature.title}
                    </h3>

                    <p
                      className="
                      text-lg leading-relaxed
                      text-neutral-600
                      dark:text-gray-300
                    "
                    >
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* WORKFLOW */}
          <section className="w-full mx-auto py-10">
            <div className="mb-16">
              <h2 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 mb-5">
                How The System Works
              </h2>

              <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                The Academic Scheduler & Management System connects students,
                teachers, and administration through a centralized real-time
                academic coordination platform. The system continuously synchronizes
                timetable updates, notifications, attendance information, and
                academic communication across both web and mobile applications.
              </p>
            </div>

            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    Dynamic Timetable Synchronization
                  </h3>

                  <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Students access a dynamic timetable through the web and mobile
                    application. Unlike traditional static timetables, the system
                    updates schedules in real time whenever classes are cancelled,
                    substituted, rescheduled, or shifted to different venues.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    Real-Time Notification Delivery
                  </h3>

                  <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Whenever timetable modifications occur, the platform automatically
                    delivers push notifications to affected students. Notifications are
                    scoped intelligently so that only relevant students receive updates,
                    reducing unnecessary alerts and maintaining efficient communication.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    Faculty Class Cancellation & Substitution
                  </h3>

                  <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Teachers can cancel lectures directly through the platform.
                    Other faculty members can acquire and substitute those classes,
                    allowing institutions to maintain uninterrupted academic operations.
                    Students affected by substitutions are notified instantly.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  4
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    Student Leave Workflow
                  </h3>

                  <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Students can submit leave applications digitally through their
                    dashboard. Faculty members can review, approve, or decline
                    requests directly from the system, reducing paperwork and
                    simplifying academic administration.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  5
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    Attendance & Academic Dashboard
                  </h3>

                  <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Students can access attendance reports and academic dashboard
                    data fetched directly from the university system. This provides
                    centralized visibility into attendance records, schedules,
                    announcements, and academic activity.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  6
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    Scoped Alerts & Announcements
                  </h3>

                  <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    The announcement system supports targeted communication where
                    updates can be delivered to specific branches, semesters,
                    sections, or affected student groups, ensuring organized and
                    relevant academic communication.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  7
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    BLE Mesh Notification Support
                  </h3>

                  <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    To improve communication reliability during unstable network
                    conditions, the platform supports BLE mesh-based notification
                    delivery. Nearby devices can relay updates through Bluetooth mesh
                    communication, helping important notifications reach affected users
                    even in low-connectivity environments.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
      <LandingFooter />
    </div>
  );
}
