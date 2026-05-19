import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  WifiOff,
  Network,
  ShieldCheck,
  Smartphone,
  Radio,
  Layers3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import LandingHeader from '../components/LandingHeader';
import LandingFooter from '../components/LandingFooter';

export default function BLETechPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = ['overview', 'network', 'features', 'strategy'];

  const features = [
    {
      icon: Network,
      title: 'Offline Mesh Relay',
      desc: 'Nearby devices relay notifications across campus without depending entirely on internet connectivity.',
    },
    {
      icon: Smartphone,
      title: 'Cross Device Synchronization',
      desc: 'Notifications synchronize seamlessly between supported mobile devices in real time.',
    },
    {
      icon: Radio,
      title: 'BLE Broadcast Network',
      desc: 'Academic updates are propagated using Bluetooth Low Energy mesh broadcasts.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Packet Delivery',
      desc: 'Notification packets are encrypted before transmission across relay devices.',
    },
    {
      icon: Layers3,
      title: 'Multi-Hop Communication',
      desc: 'Messages travel across multiple relay devices to improve notification reach.',
    },
    {
      icon: Sparkles,
      title: 'Smart Connectivity Switching',
      desc: 'Automatically switches between internet and BLE mesh communication dynamically.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-300">
      <LandingHeader />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1350px] mx-auto">

          {/* HERO */}
          <section className="relative overflow-hidden rounded-[40px] bg-transparent mb-20">

            {/* Background Glow */}
            {/* <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/10 blur-3xl rounded-full" /> */}

            <div className="relative z-10">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">

                {/* LEFT */}
                <div>
                  <div
                    className="
                      inline-flex items-center gap-2
                      px-4 py-2 rounded-full mb-6
                      bg-indigo-50 text-indigo-700
                      dark:bg-indigo-500/10 dark:text-indigo-300
                    "
                  >
                    <WifiOff className="w-4 h-4" />
                    Offline-First Communication Layer
                  </div>

                  <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-8">
                    BLE Mesh
                    <br />
                    Notification
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {' '}Network
                    </span>
                  </h1>

                  <p className="text-xl leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-3xl mb-10">
                    A decentralized campus communication network designed to
                    deliver academic notifications even during unstable or
                    unavailable internet connectivity using Bluetooth Low
                    Energy mesh relays between nearby student devices.
                  </p>

                  <div className="flex flex-wrap gap-4 mb-10">
                    {[
                      'Offline Notifications',
                      'BLE Mesh Relay',
                      'Cross Device Sync',
                      'Multi-Hop Delivery',
                      'Low Power Communication',
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="
                          px-5 py-3 rounded-2xl
                          bg-white dark:bg-white/[0.05]
                          border border-neutral-200 dark:border-white/10
                          text-sm font-medium
                          shadow-sm
                        "
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="
                      group inline-flex items-center gap-3
                      px-7 py-4 rounded-2xl
                      bg-neutral-900 text-white
                      dark:bg-white dark:text-black
                      font-semibold
                      hover:scale-[1.02]
                      transition-all duration-300
                    "
                  >
                    Open Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* RIGHT CARD */}
                <div
                  className="
                    rounded-[32px]
                    bg-[#0f172a]
                    text-white
                    p-8
                    shadow-2xl
                    border border-white/10
                  "
                >

                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">
                        Notification Status
                      </p>
                      <h3 className="text-2xl font-bold">
                        Mesh Active
                      </h3>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                      <Network className="w-7 h-7 text-green-400" />
                    </div>
                  </div>

                  <div className="space-y-5">

                    {[
                      {
                        title: 'Teacher Updated Timetable',
                        desc: 'Schedule modification detected',
                      },
                      {
                        title: 'Nearby Device Relay',
                        desc: 'Broadcasting BLE packet',
                      },
                      {
                        title: 'Offline Students Synced',
                        desc: 'Notification propagated successfully',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="
                          p-5 rounded-2xl
                          bg-white/[0.05]
                          border border-white/10
                        "
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                          </div>

                          <div>
                            <h4 className="font-semibold mb-1">
                              {item.title}
                            </h4>

                            <p className="text-sm text-neutral-400">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* CONTENT FLOW */}
          <div className="space-y-10">

            {/* OVERVIEW */}
            <section
              className="
      rounded-[36px]
      bg-white dark:bg-white/[0.04]
      border border-neutral-200 dark:border-white/10
      p-10 lg:p-14
    "
            >
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 mb-6">
                  <WifiOff className="w-4 h-4" />
                  Offline-First Communication Architecture
                </div>

                <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-8">
                  Designed For Reliable Academic Communication
                </h2>

                <div className="space-y-6 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">

                  <p>
                    Educational institutions frequently face communication delays
                    caused by unstable internet connectivity, overloaded campus
                    networks, or delayed notification delivery systems. These
                    issues often prevent students from receiving important academic
                    updates such as timetable modifications, substituted lectures,
                    cancellations, attendance alerts, and emergency announcements
                    in real time.
                  </p>

                  <p>
                    The BLE Mesh Notification Network introduces an offline-first
                    communication layer that enables nearby student devices to
                    relay notifications between one another using Bluetooth Low
                    Energy mesh communication.
                  </p>

                  <p>
                    Instead of depending entirely on centralized internet
                    infrastructure, the system creates a decentralized relay
                    network where connected devices participate in forwarding
                    academic updates throughout the campus environment.
                  </p>

                  <p>
                    This architecture significantly improves delivery reliability
                    during unstable connectivity conditions and ensures that
                    affected students continue receiving important academic
                    notifications even when internet access becomes inconsistent.
                  </p>

                </div>
              </div>
            </section>

            {/* FEATURES */}
            <section
              className="
      rounded-[36px]
      bg-white dark:bg-white/[0.04]
      border border-neutral-200 dark:border-white/10
      p-10 lg:p-14
    "
            >
              <div className="max-w-5xl mb-14">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-white/[0.05] mb-6">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Core Capabilities
                </div>

                <h2 className="text-4xl lg:text-5xl font-black mb-8">
                  System Features
                </h2>

                <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                  The BLE Mesh Notification Network combines decentralized relay
                  communication, low-power synchronization, and offline-first
                  delivery mechanisms to improve reliability of academic
                  notification systems across campus environments.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">

                {features.map((feature, idx) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={idx}
                      className="
              group rounded-[30px]
              bg-neutral-50 dark:bg-white/[0.03]
              border border-neutral-200 dark:border-white/10
              p-8
              hover:-translate-y-1
              hover:shadow-2xl
              transition-all duration-300
            "
                    >
                      <div
                        className="
                w-16 h-16 rounded-2xl
                bg-white dark:bg-white/[0.05]
                border border-neutral-200 dark:border-white/10
                flex items-center justify-center
                mb-7
                group-hover:bg-indigo-600
                transition-all duration-300
              "
                      >
                        <Icon className="w-8 h-8 text-neutral-700 dark:text-white group-hover:text-white" />
                      </div>

                      <h3 className="text-2xl font-bold mb-4">
                        {feature.title}
                      </h3>

                      <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {feature.desc}
                      </p>
                    </div>
                  );
                })}

              </div>
            </section>

            {/* NETWORK FLOW */}
            <section
              className="
      rounded-[36px]
      bg-[#111827]
      text-white
      p-10 lg:p-14
      overflow-hidden
      relative
    "
            >
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-3xl rounded-full" />

              <div className="relative z-10">

                <div className="max-w-5xl mb-16">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] mb-6">
                    <Network className="w-4 h-4 text-indigo-300" />
                    Relay Communication Workflow
                  </div>

                  <h2 className="text-4xl lg:text-5xl font-black mb-8">
                    How The Network Operates
                  </h2>

                  <p className="text-lg leading-relaxed text-neutral-300">
                    Notifications propagate dynamically through multiple nearby
                    relay devices, enabling campus-wide synchronization even
                    during partial or unstable network connectivity conditions.
                  </p>
                </div>

                <div className="space-y-8">

                  {[
                    {
                      title: 'Academic Update Generated',
                      desc: 'A timetable modification, class cancellation, substitution update, or attendance notification is generated through the academic management platform.',
                    },
                    {
                      title: 'Primary Device Receives Notification',
                      desc: 'A student device with active internet connectivity receives the update through the standard cloud notification channel.',
                    },
                    {
                      title: 'BLE Mesh Broadcast Initiated',
                      desc: 'The application encodes the notification into encrypted BLE advertisement packets and begins local broadcasting.',
                    },
                    {
                      title: 'Nearby Devices Synchronize',
                      desc: 'Nearby student devices scan, decode, receive, and rebroadcast the notification packets to extend communication coverage.',
                    },
                    {
                      title: 'Campus-Wide Propagation',
                      desc: 'Through multi-hop relay synchronization, notifications continue propagating dynamically throughout the campus environment.',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="
              flex gap-6 items-start
              rounded-[28px]
              bg-white/[0.04]
              border border-white/10
              p-8
            "
                    >
                      <div
                        className="
                w-14 h-14 rounded-2xl
                bg-indigo-600
                flex items-center justify-center
                font-bold text-lg
                flex-shrink-0
              "
                      >
                        {idx + 1}
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold mb-3">
                          {item.title}
                        </h3>

                        <p className="text-lg leading-relaxed text-neutral-300">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </section>

            {/* STRATEGY */}
            <section
              className="
      rounded-[36px]
      bg-white dark:bg-white/[0.04]
      border border-neutral-200 dark:border-white/10
      p-10 lg:p-14
    "
            >
              <div className="max-w-5xl mb-14">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-white/[0.05] mb-6">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  Reliability & Synchronization
                </div>

                <h2 className="text-4xl lg:text-5xl font-black mb-8">
                  Communication Strategy
                </h2>

                <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                  The platform uses hybrid connectivity logic, relay synchronization,
                  redundant rebroadcasting, and staggered scanning windows to
                  improve notification reliability throughout the campus network.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">

                <div className="rounded-[28px] bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 p-8">
                  <h3 className="text-2xl font-bold mb-5">
                    Hybrid Connectivity
                  </h3>

                  <div className="space-y-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <p>
                      Devices prioritize internet communication whenever stable
                      connectivity is available for faster synchronization.
                    </p>

                    <p>
                      During network instability, BLE mesh relay mode activates
                      automatically and nearby devices begin forwarding
                      notifications locally.
                    </p>

                    <p>
                      Once internet connectivity is restored, queued updates
                      synchronize automatically with the server.
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] bg-[#111827] text-white p-8">
                  <h3 className="text-2xl font-bold mb-5">
                    Reliability Model
                  </h3>

                  <div className="space-y-4 text-neutral-300 leading-relaxed">
                    <p>
                      Multi-hop relay synchronization ensures updates continue
                      propagating even if certain relay devices disconnect.
                    </p>

                    <p>
                      Redundant rebroadcast windows significantly reduce
                      notification loss probability during unstable
                      communication conditions.
                    </p>

                    <p>
                      The decentralized relay architecture improves resilience
                      and communication coverage throughout campus environments.
                    </p>
                  </div>
                </div>

              </div>
            </section>

          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}