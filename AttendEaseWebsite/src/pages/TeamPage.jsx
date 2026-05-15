import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from '../components/LandingHeader';

export default function TeamPage() {
  const navigate = useNavigate();

  const team = [
    {
      name: 'Team Lead',
      role: 'Project Director',
      bio: 'Visionary leader driving AttendEase\'s strategic direction and innovation'
    },
    {
      name: 'Backend Lead',
      role: 'System Architect',
      bio: 'Designing scalable infrastructure and database systems'
    },
    {
      name: 'Frontend Lead',
      role: 'UI/UX Designer',
      bio: 'Creating intuitive interfaces across web and mobile platforms'
    },
    {
      name: 'Mobile Developer',
      role: 'React Native Specialist',
      bio: 'Building seamless mobile experiences for iOS and Android'
    },
    {
      name: 'BLE Specialist',
      role: 'IoT Engineer',
      bio: 'Implementing cutting-edge Bluetooth mesh networking technology'
    },
    {
      name: 'DevOps Engineer',
      role: 'Infrastructure Expert',
      bio: 'Managing deployment, scaling, and system reliability'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white">
      <LandingHeader />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="mb-8 text-indigo-500 hover:text-indigo-600 font-semibold flex items-center gap-2"
          >
            ← Back to Home
          </button>

          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-teal-500 bg-clip-text text-transparent">
              Meet the Team
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Passionate developers and designers building the future of attendance management
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="group p-6 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500 transition"
              >
                {/* Avatar Placeholder */}
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-bold group-hover:scale-110 transition">
                  {member.name.charAt(0)}
                </div>

                <h3 className="text-lg font-bold text-center mb-1">{member.name}</h3>
                <p className="text-center text-indigo-600 dark:text-indigo-400 font-semibold mb-3">{member.role}</p>
                <p className="text-center text-neutral-600 dark:text-neutral-400 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>

          {/* Mission Statement */}
          <section className="p-8 bg-gradient-to-r from-indigo-50 to-teal-50 dark:from-neutral-800 dark:to-neutral-800 rounded-xl border border-indigo-200 dark:border-indigo-600 mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
              We're a dedicated team committed to solving real problems in educational institutions. Our mission is to create
              technology that is simple, reliable, and accessible to everyone. We believe that attendance management should be
              effortless, transparent, and empowering for both students and teachers.
            </p>
          </section>

          {/* Core Values */}
          <section className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-indigo-500">💡</span> Innovation
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                We constantly push boundaries to find creative solutions to complex problems.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-teal-500">🤝</span> Collaboration
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                We work together across disciplines to create better outcomes for our users.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-indigo-500">✓</span> Reliability
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                We build systems you can depend on, even when the unexpected happens.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-teal-500">🎯</span> User-Centric
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Everything we build is designed with the user's needs and experience at the forefront.
              </p>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="p-8 bg-slate-100 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 mb-12">
            <h2 className="text-3xl font-bold mb-6">Technology Stack</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-lg mb-3 text-indigo-600 dark:text-indigo-400">Frontend</h4>
                <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 text-sm">
                  <li>• React 19</li>
                  <li>• React Native</li>
                  <li>• Tailwind CSS</li>
                  <li>• React Router</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3 text-teal-600 dark:text-teal-400">Backend & Services</h4>
                <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 text-sm">
                  <li>• Firebase</li>
                  <li>• Supabase</li>
                  <li>• Node.js</li>
                  <li>• Real-time Database</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3 text-indigo-600 dark:text-indigo-400">Emerging Tech</h4>
                <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 text-sm">
                  <li>• BLE Mesh</li>
                  <li>• WebSockets</li>
                  <li>• Push Notifications</li>
                  <li>• Offline-First Sync</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-6">Join Us in Making a Difference</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
              We're always looking for passionate individuals who want to contribute to education technology.
              If you're interested in joining our mission, get in touch!
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-xl transition"
            >
              Explore AttendEase
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
