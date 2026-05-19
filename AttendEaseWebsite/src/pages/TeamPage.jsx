import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from '../components/LandingHeader';
import LandingFooter from '../components/LandingFooter';

import {
  FiZap,
  FiUsers,
  FiShield,
  FiTarget,
} from "react-icons/fi";

import {
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

import {
  FiCode,
  FiServer,
  FiCpu,
  FiArrowUpRight,
} from "react-icons/fi";

import {
  SiReact,
  SiReactrouter,
  SiTailwindcss,
  SiNodedotjs,
  SiFirebase,
  SiMysql,
  SiWebsocket,
} from "react-icons/si";

import { TbPlugConnected, TbBrandReactNative } from "react-icons/tb";
import { BsBluetooth } from "react-icons/bs";
import { MdNotificationsActive } from "react-icons/md";

export default function TeamPage() {
  const navigate = useNavigate();

  const team = [
    {
      name: "Arindam",
      github: "Arindam-c-Pathak",
      linkedin: "https://www.linkedin.com/in/arindam-chandra-pathak/",
      role: "Web Developer",
      bio: "Focused on building responsive and scalable web experiences.",
      extendedBio: "Specializes in modern JavaScript frameworks, semantic DOM architecture, and advanced Tailwind implementations. Dedicated to optimization, structural layouts, and ensuring sub-second rendering across all viewports.",
    },
    {
      name: "Arjun Singh",
      github: "arjunsinghas0077-eng",
      linkedin: "",
      role: "Frontend Developer",
      bio: "Passionate about crafting modern interfaces and smooth user interactions.",
      extendedBio: "Expert in micro-interactions, state management, and component modularity. Transforms static design assets into highly kinetic, state-driven browser environments that capture user engagement flawlessly.",
    },
    {
      name: "Rahul Verma",
      github: "SudoRV",
      linkedin: "https://www.linkedin.com/in/sudorv/",
      role: "App & Backend Developer",
      bio: "Develops robust mobile applications and real-time backend infrastructure.",
      extendedBio: "Bridges the gap between device hardware and cloud compute. Manages scalable API services, state tracking pipelines, and offline-first mobile sync routines designed to process workloads seamlessly.",
    },
    {
      name: "Rituraj Kalkhudiya",
      github: "Riturajkalkhudiya",
      linkedin: "https://www.linkedin.com/in/rituraj-kalkhudiya-b32174315/",
      role: "Database Developer",
      bio: "Specializes in database design, performance optimization, and storage setups.",
      extendedBio: "Architects complex relational schemas and fine-tunes deep indexing structures. Focuses heavily on reducing query execution costs, safe data migrations, and managing secure user identity stores.",
    },
    {
      name: "Vansh Verma",
      github: "vansh2709",
      linkedin: "https://www.linkedin.com/in/vansh-verma-ab318b304/",
      role: "Database Developer",
      bio: "Works on structured database solutions and secure backend data pipelines.",
      extendedBio: "Creates secure, encrypted database routines and custom procedures. Maintains rigorous validation models to protect user records while ensuring high throughput and continuous data sync.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 transition-colors duration-300">
      <LandingHeader />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1350px] mx-auto space-y-12">

          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-black mb-3 tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Meet the Team
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 font-normal">
              Passionate developers and designers building the future of attendance management.
            </p>
          </div>

          {/* Team Grid with Hover Details */}
          <section>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((member, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-950/30 border border-neutral-200/60 dark:border-neutral-900 flex flex-col justify-between p-5 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-500/20"
                >
                  {/* Default View Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={`https://github.com/${member.github}.png`}
                          alt={member.name}
                          className="w-20 h-20 rounded-xl object-cover border border-white dark:border-neutral-800 shadow-xl shadow-indigo-500/10 dark:shadow-black/40 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl tracking-tight text-neutral-900 dark:text-white">{member.name}</h3>
                        <p className="text-bg-slate-800 font-semibold text-indigo-600 dark:text-indigo-400">{member.role}</p>
                      </div>
                    </div>
                    <p className="text-bg-transparent text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  {/* Clean Neutral Links Area */}
                  <div className="flex items-center gap-3 pt-3 border-t border-neutral-200/50 dark:border-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                    <a
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-black dark:hover:text-white transition-colors duration-150"
                    >
                      <FaGithub size={22} />
                    </a>
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-black dark:hover:text-white transition-colors duration-150"
                      >
                        <FaLinkedin size={22} />
                      </a>
                    )}
                  </div>

                  {/* Hidden Detailed Overlay (Slides up on Hover) */}
                  <div className="absolute inset-0 bg-white dark:bg-neutral-900 p-5 border border-indigo-500/30 dark:border-indigo-500/40 rounded-2xl flex flex-col justify-between translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-lg font-bold text-neutral-900 dark:text-white">{member.name}</h4>
                        <span className="font-mono tracking-wider text-indigo-500 dark:text-indigo-400 uppercase font-bold">{member.role}</span>
                      </div>
                      <p className="text-[14px] text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
                        {member.extendedBio}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2 text-neutral-700 dark:text-neutral-300">
                      <a href={`https://github.com/${member.github}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-black dark:hover:text-white transition-colors duration-150">
                        <FaGithub size={22} />
                      </a>
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-black dark:hover:text-white transition-colors duration-150">
                          <FaLinkedin size={22} />
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </section>

          {/* Mission Statement */}
          <section className="pt-10 border-t border-neutral-100 dark:border-neutral-900">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-xl font-bold uppercase tracking-wider mb-4">
                Our Mission
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-4 text-neutral-950 dark:text-white leading-tight">
                Building smarter academic experiences for everyone.
              </h2>
              <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                We’re focused on solving real challenges inside educational institutions
                through modern, reliable, and user-friendly technology. Our goal is to
                make attendance, timetable management, and academic coordination seamless,
                transparent, and accessible for both students and faculty.
              </p>
            </div>
          </section>

          {/* Core Values - Structured via Subtle Card Layouts */}
          <section className="pt-10 border-t border-neutral-100 dark:border-neutral-900">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <div>
                <p className="text-xl font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2">
                  Core Values
                </p>
                <h2 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white mb-3">
                  What drives our team
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  The foundational ideas guiding how we design, test, and release critical academic infrastructure.
                </p>
              </div>

              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: FiZap,
                    title: "Innovation",
                    desc: "We constantly explore smarter and more efficient ways to improve academic workflows and digital experiences.",
                  },
                  {
                    icon: FiUsers,
                    title: "Collaboration",
                    desc: "Strong teamwork and shared ideas help us build products that truly solve real-world problems.",
                  },
                  {
                    icon: FiShield,
                    title: "Reliability",
                    desc: "Our systems are designed to remain stable, responsive, and dependable in everyday institutional use.",
                  },
                  {
                    icon: FiTarget,
                    title: "User Focus",
                    desc: "Every feature is crafted around usability, simplicity, and delivering value to students and teachers.",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-100 dark:border-neutral-900 hover:border-neutral-200  shadow-md hover:shadow-lg hover:-translate-y-1 dark:hover:border-neutral-800 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Icon className="text-base" />
                        </div>
                        <h3 className="font-bold text-neutral-900 dark:text-white">{item.title}</h3>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Tech Stack - Clean Inline Column Layout */}
          <section className="pt-14 border-t border-neutral-200/70 dark:border-neutral-800">
            {/* Heading */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
              <div>
                <p className="text-xl font-bold uppercase tracking-[0.3em] text-indigo-500 mb-3">
                  Technology Stack
                </p>

                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-950 dark:text-white mb-4">
                  Built with scalable modern technologies
                </h2>

                <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
                  Carefully selected technologies powering real-time communication,
                  seamless synchronization, scalable infrastructure, and modern user
                  experiences across web and mobile platforms.
                </p>
              </div>

              <div className="hidden lg:flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                Continuously evolving stack
              </div>
            </div>

            {/* Stack Cards */}
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                {
                  icon: FiCode,
                  title: "Frontend",
                  desc: "Responsive and interactive interfaces designed for modern user experiences.",
                  items: [
                    { name: "React JS", icon: SiReact },
                    { name: "React Native", icon: TbBrandReactNative },
                    { name: "Tailwind CSS", icon: SiTailwindcss },
                    { name: "React Router", icon: SiReactrouter },
                  ],
                },
                {
                  icon: FiServer,
                  title: "Backend & Services",
                  desc: "Reliable backend infrastructure with scalable real-time capabilities.",
                  items: [
                    { name: "Node.js", icon: SiNodedotjs },
                    { name: "Firebase", icon: SiFirebase },
                    { name: "MySQL", icon: SiMysql },
                  ],
                },
                {
                  icon: FiCpu,
                  title: "Emerging Tech",
                  desc: "Advanced technologies focused on connectivity and smart synchronization.",
                  items: [
                    { name: "BLE Mesh", icon: BsBluetooth },
                    { name: "WebSockets", icon: TbPlugConnected },
                    { name: "Push Alerts", icon: MdNotificationsActive },
                  ],
                },
              ].map((stack, idx) => {
                const Icon = stack.icon;

                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/30 backdrop-blur-xl p-7 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-[0_15px_60px_rgba(99,102,241,0.12)] shadow-md"
                  >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_45%)]" />

                    <div className="relative">
                      {/* Top */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <Icon className="text-white text-2xl" />
                        </div>

                        <FiArrowUpRight className="text-neutral-300 dark:text-neutral-700 text-xl group-hover:text-indigo-500 transition-colors duration-300" />
                      </div>

                      {/* Content */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
                          {stack.title}
                        </h3>

                        <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                          {stack.desc}
                        </p>
                      </div>

                      {/* Technology Tags */}
                      <div className="flex flex-wrap gap-2">
                        {stack.items.map((item, itemIdx) => {
                          const TechIcon = item.icon;

                          return (
                            <div
                              key={itemIdx}
                              className="group/tag flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-300"
                            >
                              <TechIcon className="text-base opacity-80 group-hover/tag:opacity-100" />
                              <span>{item.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>

      <LandingFooter />
    </div>
  );
}