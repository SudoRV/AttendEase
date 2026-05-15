import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from '../components/LandingHeader';

export default function BLETechPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

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

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-teal-500 bg-clip-text text-transparent">
            BLE Mesh Network Technology
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-12">
            Offline-First Notification Delivery System
          </p>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-4 mb-12 border-b border-slate-200 dark:border-neutral-700">
            {['overview', 'how-it-works', 'features', 'strategy'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold border-b-2 transition ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <section className="space-y-8">
              <div className="p-8 bg-indigo-50 dark:bg-neutral-800 rounded-xl border border-indigo-200 dark:border-indigo-600">
                <h2 className="text-3xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">What is BLE Mesh Network?</h2>
                <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-4">
                  Bluetooth Low Energy (BLE) Mesh is a network topology that allows devices to relay data through each other
                  to create a wide-area network. Unlike traditional point-to-point Bluetooth, BLE Mesh creates a decentralized
                  network where every device can act as a relay, extending coverage and creating redundancy.
                </p>
                <p className="text-lg text-neutral-700 dark:text-neutral-300">
                  In the context of AttendEase, we leverage BLE Mesh to enable offline notification delivery when internet
                  connectivity is unavailable, ensuring students never miss critical attendance notifications.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-teal-50 dark:bg-neutral-800 rounded-xl border border-teal-200 dark:border-teal-600">
                  <h3 className="text-2xl font-bold mb-3 text-teal-600 dark:text-teal-400">The Problem We Solve</h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li className="flex gap-2">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>No internet = No notifications received</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>Students miss critical updates</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>College networks often unreliable</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-slate-100 dark:bg-neutral-800 rounded-xl border border-slate-300 dark:border-neutral-700">
                  <h3 className="text-2xl font-bold mb-3">Our Solution</h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li className="flex gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>BLE Mesh broadcasts locally</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Devices relay data to others</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Guaranteed delivery even offline</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* How It Works Tab */}
          {activeTab === 'how-it-works' && (
            <section className="space-y-8">
              <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-700 rounded-xl border border-slate-200 dark:border-neutral-700">
                <h2 className="text-3xl font-bold mb-6">Network Architecture</h2>

                {/* Device Types */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-600">
                    <div className="text-2xl mb-2">📡 Broadcaster Node</div>
                    <h4 className="font-bold mb-2 text-lg">Students WITH Internet</h4>
                    <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                      <li>• Receives notifications via internet</li>
                      <li>• Broadcasts to nearby BLE Mesh</li>
                      <li>• Acts as relay for others</li>
                      <li>• Can directly sync with server</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-600">
                    <div className="text-2xl mb-2">📶 Receiver Node</div>
                    <h4 className="font-bold mb-2 text-lg">Students WITHOUT Internet</h4>
                    <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                      <li>• Scans for BLE broadcasts</li>
                      <li>• Receives notifications via mesh</li>
                      <li>• Stores data locally</li>
                      <li>• Relays to other nearby devices</li>
                    </ul>
                  </div>
                </div>

                {/* Flow Diagram */}
                <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-600">
                  <h3 className="font-bold mb-4">Data Flow</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-neutral-700 rounded">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                      <div>
                        <p className="font-bold">Server sends notification</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Teacher marks attendance, server processes it</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-teal-50 dark:bg-neutral-700 rounded">
                      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                      <div>
                        <p className="font-bold">Student with internet receives it</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Via Firebase push notification</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-neutral-700 rounded">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                      <div>
                        <p className="font-bold">Device broadcasts on BLE Mesh</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Encodes notification in BLE advertisement packet</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-teal-50 dark:bg-neutral-700 rounded">
                      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                      <div>
                        <p className="font-bold">Nearby offline students receive</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">App scans and decodes BLE mesh packets</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-neutral-700 rounded">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">5</div>
                      <div>
                        <p className="font-bold">Relay extends reach</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Receiver relays to create campus-wide coverage</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <section className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: '📱',
                    title: 'Dual Mode Operation',
                    desc: 'Seamlessly switches between internet and BLE mesh based on network availability'
                  },
                  {
                    icon: '🔄',
                    title: 'Automatic Sync',
                    desc: 'Periodically syncs data when internet becomes available'
                  },
                  {
                    icon: '📡',
                    title: 'Multi-hop Relay',
                    desc: 'Messages can hop through multiple devices extending coverage across campus'
                  },
                  {
                    icon: '🔐',
                    title: 'Encryption',
                    desc: 'All BLE mesh messages are encrypted for security'
                  },
                  {
                    icon: '⚡',
                    title: 'Low Power',
                    desc: 'Optimized BLE protocol minimizes battery drain'
                  },
                  {
                    icon: '📊',
                    title: 'Reliable Delivery',
                    desc: 'Guaranteed message delivery through redundant paths'
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Strategy Tab */}
          {activeTab === 'strategy' && (
            <section className="space-y-8">
              <div className="p-8 bg-gradient-to-r from-indigo-50 to-teal-50 dark:from-neutral-800 dark:to-neutral-800 rounded-xl border border-indigo-200 dark:border-indigo-600">
                <h2 className="text-3xl font-bold mb-6">Smart Network Strategy</h2>

                <div className="space-y-6">
                  <div className="p-6 bg-white dark:bg-neutral-700 rounded-lg border border-slate-200 dark:border-neutral-600">
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <span className="text-indigo-500">⚙️</span> Mode Selection Logic
                    </h3>
                    <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
                      <p>
                        <strong>If Internet Available:</strong> Use internet for faster, more reliable delivery.
                        Device still enables BLE broadcast for students without connectivity.
                      </p>
                      <p>
                        <strong>If No Internet:</strong> Switch to BLE mesh mode exclusively. Device becomes receiver node,
                        scanning for broadcasts from other students' devices.
                      </p>
                      <p>
                        <strong>Hybrid Mode:</strong> When regaining internet, automatically sync queued offline messages
                        while continuing to relay via BLE.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-white dark:bg-neutral-700 rounded-lg border border-slate-200 dark:border-neutral-600">
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <span className="text-teal-500">🕐</span> Time Synchronization Protocol
                    </h3>
                    <div className="text-neutral-700 dark:text-neutral-300">
                      <p className="mb-4">
                        Ensuring notifications reach all devices requires precision timing to avoid message collisions
                        and ensure delivery windows don't miss any receiver.
                      </p>
                      <div className="bg-slate-100 dark:bg-neutral-600 p-4 rounded border-l-4 border-teal-500 font-mono text-sm">
                        <p className="mb-2"><strong>Example Timeline:</strong></p>
                        <p>7:44 AM - Teacher marks attendance (broadcast begins)</p>
                        <p>7:44:00 - Broadcaster sends on BLE (minute X)</p>
                        <p>7:46:00 - First receiver scan window (minute X+2)</p>
                        <p>7:48:00 - Second relay broadcast (minute X+4)</p>
                        <p>7:50:00 - Final receiver scan (minute X+6)</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white dark:bg-neutral-700 rounded-lg border border-slate-200 dark:border-neutral-600">
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <span className="text-indigo-500">📋</span> Synchronization Rules
                    </h3>
                    <ul className="space-y-3 text-neutral-700 dark:text-neutral-300">
                      <li className="flex gap-3">
                        <span className="font-bold text-indigo-500 flex-shrink-0">1.</span>
                        <span><strong>Multi-minute intervals:</strong> Messages broadcast at multiples of 2 minutes
                        (0, 2, 4, 6, 8 minutes after notification generated)</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-teal-500 flex-shrink-0">2.</span>
                        <span><strong>Staggered scanning:</strong> Receivers scan at synchronized intervals (+2 minutes offset)
                        to catch broadcasts from multiple relays</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-indigo-500 flex-shrink-0">3.</span>
                        <span><strong>No missed notifications:</strong> Each receiver completes at least one full scan cycle
                        within 6 minutes of the event</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-teal-500 flex-shrink-0">4.</span>
                        <span><strong>Redundant delivery:</strong> Multiple relay opportunities ensure no message loss
                        due to device position or timing</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 bg-white dark:bg-neutral-700 rounded-lg border border-slate-200 dark:border-neutral-600">
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <span className="text-indigo-500">✓</span> Guarantee Model
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300 mb-3">
                      With this strategy, we guarantee:
                    </p>
                    <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                      <li>✓ Any device within campus proximity receives notification within 6 minutes</li>
                      <li>✓ No collision due to precise 2-minute interval timing</li>
                      <li>✓ Redundant paths ensure delivery even if one relay path is interrupted</li>
                      <li>✓ Synchronized scanning prevents missed broadcasts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Closing CTA */}
          <section className="mt-16 text-center">
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
              Experience the power of reliable offline-first notifications
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-xl transition"
            >
              Try AttendEase Now
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
