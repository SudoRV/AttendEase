import { useState } from 'react';
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
} from "react-icons/fi";
import {FaAndroid, FaApple } from "react-icons/fa";
import attendease_logo from "../images/attendease_icon.png";
import Android_QR from "../images/Android_QR.png";
import iOS_QR from "../images/iOS_QR.png";

const FEATURES = [
  {
    icon: <Zap size={28} className="text-indigo-500" />,
    title: 'Lightning Fast Response',
    description:
      'Optimized for speed, the app delivers near-instant responses and updates the database for the concerned parties.',
  },
  {
    icon: <Shield size={28} className="text-indigo-500" />,
    title: 'Security First',
    description:
      'End-to-end encryption and role-based access control keep the data protected at all times.',
  },
  {
    icon: <Bell size={28} className="text-indigo-500" />,
    title: 'Smart Notifications',
    description:
      'Context-aware notifications that alert the users with relevant information with no delay, keeping them informed in real time.',
  },
  {
    icon: <BarChart2 size={28} className="text-indigo-500" />,
    title: 'Rich Analytics',
    description:
      'Dynamic student dashboards with detailed attendance reports, leave counts and risk indicators to reduce tardiness and absenteeism.',
  },
  {
    icon: <Calendar size={28} className="text-indigo-500" />,
    title: 'Live Timetable Sync',
    description:
      'Timetable that dynamically changes and updates to reflect real-time changes, ensuring students and teachers are always on the same page.',
  },
  {
    icon: <Offline size={28} className="text-indigo-500" />,
    title: 'Offline Functionality',
    description:
      'Continue working even without an internet connection, with data syncing once connectivity is restored.',
  },
];

const DEVELOPERS = [
  {
    name: 'Arindam',
    role: 'Frontend Developer',
    bio: 'Specialist in building responsive user interfaces and optimizing web performance with modern React patterns.',
    image: 'https://github.com/Arindam-c-Pathak.png',
    github: 'https://github.com/Arindam-c-Pathak',
    linkedin: 'https://www.linkedin.com/in/arindam-chandra-pathak/',
    email: 'pathakarindamchandra@gmail.com',
  },
  {
    name: 'Arjun Singh',
    role: 'Frontend Developer',
    bio: 'Passionate about clean code and accessible design systems. Focused on creating seamless user experiences.',
    image: 'https://github.com/arjunsinghas0077-eng.png',
    github: 'https://github.com/arjunsinghas0077-eng',
    linkedin: '#', // Placeholder as it was empty
    email: '',
  },
  {
    name: 'Rahul Verma',
    role: 'Backend Developer',
    bio: 'Architecting scalable server-side logic and robust APIs. Expert in database integration and system security.',
    image: 'https://github.com/SudoRV.png',
    github: 'https://github.com/SudoRV',
    linkedin: 'https://www.linkedin.com/in/sudorv/',
    email: '',
  },
  {
    name: 'Rituraj Kalkhudiya',
    role: 'Database Developer',
    bio: 'Dedicated to data integrity and query optimization. Ensuring high availability and performance for complex data structures.',
    image: 'https://github.com/Riturajkalkhudiya.png',
    github: 'https://github.com/Riturajkalkhudiya',
    linkedin: 'https://www.linkedin.com/in/rituraj-kalkhudiya-b32174315/',
    email: '',
  },
  {
    name: 'Vansh Verma',
    role: 'Database Developer',
    bio: 'Specializes in schema design and database migrations. Focused on building reliable back-end infrastructures.',
    image: 'https://github.com/vansh2709.png',
    github: 'https://github.com/vansh2709',
    linkedin: 'https://www.linkedin.com/in/vansh-verma-ab318b304/',
    email: '',
  },
];

const NAV_TABS = [
  { id: 'about', label: 'About Us', icon: <Info size={15} /> },
  { id: 'download', label: 'Download App', icon: <Download size={15} /> },
  { id: 'developers', label: 'About Developers', icon: <Users size={15} /> },
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
];


function AboutSection() {
  return (
    <div className="space-y-16">
      <div className="max-w-4xl mx-auto text-center space-y-5 rounded-3xl p-8">
        <h3 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-500 to-gray-800 bg-clip-text text-transparent">
          Academics Made Easy
        </h3>
        <p className="text-neutral-500 text-lg leading-relaxed">
          AttendEase revoloutionizes college attendance trackin with real-time synchronization, offline-capable notifications, and a seamless teacher-student intersaction.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-2">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border-2 border-solid border-indigo-600 text-slate-100 hover:bg-slate-100 hover:text-indigo-800 no-underline bg-indigo-600 font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
          >
            Try Dashboard <ChevronRight size={16} />
          </a>
          {/*<a
            href="/about"
            className="inline-flex items-center justify-center gap-2 border-2 border-solid border-slate-600 text-indigo-600 hover:bg-indigo-600 hover:text-slate-100 no-underline font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
          >
            Learn More <ExternalLink size={16} />
          </a>*/}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-full mx-auto p-8">
        {[
          { value: '50k+', label: 'Active Users' },
          { value: '99.9%', label: 'Uptime SLA' },
          { value: '4.9★', label: 'App Store Rating' },
          { value: '4.9★', label: 'App Store Rating' },
          { value: '4.9★', label: 'App Store Rating' },
          
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-indigo-100 via-indigo-50 to-indigo-100 rounded-2xl p-5 text-center border border-slate-500 shadow-md"
          >
            <p className="text-2xl font-bold text-indigo-500">{stat.value}</p>
            <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">All the features, in one place.</h3>
        <p className="text-neutral-500 mb-8 max-w-xl text-center mx-auto">
          Packed with powerful features built for real-world workflows.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 p-4 rounded-2xl">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-gradient-to-br from-indigo-100 via-indigo-50 to-indigo-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group items-center text-center flex flex-col bg-slate-100"
            >
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors duration-200">
                {feature.icon}
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">{feature.title}</h4>
              <p className="text-neutral-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      <section className="w-full py-16 px-4 bg-gray-100">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-700 via-violet-600 to-cyan-400 max-w-6xl mx-auto">
          
          {/* Decorative Glow Shapes */}
          <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-white/10 blur-0" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-300/10 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 py-20">
            
            <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight max-w-4xl">
              Ready to Transform Your Attendance?
            </h2>

            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
              Join Hundreds of institutions using{" "}
              <span className="font-semibold text-white">
                AttendEase
              </span>{" "}
              for seamless, automated academics management.
            </p>

            {/* Button */}
            <a href="/register" className='no-underline'>
            <button className="mt-10 text-indigo-600 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 flex items-center gap-2">
              Get Started <ChevronRight size={16} />
            </button>
            </a>

            <p className="mt-6 text-sm text-white/90">
              No ads, no distractions, just pure productivity. Try it free today and see the difference!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function DownloadSection() {
  return (
    <div className="space-y-6">
      
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <Smartphone size={28} className="text-indigo-500" />
        </div>
        <h2 className="text-4xl font-bold text-slate-800">Get the mobile app</h2>
        <p className="text-neutral-400 text-lg leading-relaxed">
          Download our application built for both Android and iOS, designed to keep you connected and in control of your schedule wherever you go. With real-time updates, offline access, and a sleek interface, our app ensures you never miss a beat, whether you're on campus or on the move.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Android */}
        <div className="bg-indigo-50 rounded-2xl border border-slate-500/80 shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-200 hover:-translate-y-0.5">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-8 flex items-center justify-center">
            <div className="w-36 h-36 bg-white rounded-xl p-2">
              <img src={Android_QR} alt="Android App Download QR Code" className='w-32 h-32'/>
            </div>
          </div>
          <div className="p-6 space-y-4 flex flex-col">
            <div className="flex mx-auto flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                <FaAndroid size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Android</p>
                <p className="text-xs text-neutral-600">Requires Android 8.0+</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed text-center">
              Scan the QR code or tap the button below to download from the Google Play Store.
            </p>
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white no-underline hover:underline font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
            >
              <Download size={16} />
              Download for Android
              <ExternalLink size={14} className="opacity-70" />
            </a>
          </div>
        </div>

        {/* iOS */}
        <div className="bg-indigo-50 rounded-2xl border border-slate-500/80 shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-200 hover:-translate-y-0.5">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-8 flex items-center justify-center">
            <div className="w-36 h-36 bg-white rounded-xl p-2">
              <img src={iOS_QR} alt="iOS App Download QR Code" className='w-32 h-32'/>
            </div>
          </div>
          <div className="p-6 space-y-4 flex flex-col">
            <div className="flex mx-auto flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                <FaApple size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">iOS</p>
                <p className="text-xs text-neutral-600">Requires iOS 12.0+</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed text-center">
              Scan the QR code or tap the button below to download from the App Store.
            </p>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full no-underline hover:underline bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
            >
              <Download size={16} />
              Download for iOS
              <ExternalLink size={14} className="opacity-70" />
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
        {['Free to download', 'No ads', 'Offline mode', 'Push notifications'].map((tag) => (
          <span key={tag} className="bg-white border border-slate-200 text-neutral-400 text-sm px-4 py-1.5 rounded-full shadow-sm">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function DevelopersSection() {
  return (
    <div className="space-y-12">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h2 className="text-4xl font-bold text-slate-800">Meet the team behind AttendEase</h2>
        <p className="text-neutral-400 text-lg leading-relaxed">
          A small, focused team of builders who care deeply about craft, performance, and the
          people who use what they create.
        </p>
      </div>

      <div className="grid sm:grid-cols-1 lg:grid-cols-5 gap-5">
        {DEVELOPERS.map((dev) => (
          <div
            key={dev.name}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
          >
            <div className="relative overflow-hidden h-60">
              <img
                src={dev.image}
                alt={dev.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h4 className="font-semibold text-slate-800 text-lg leading-tight">{dev.name}</h4>
              <p className="text-indigo-500 text-sm font-medium mt-0.5 mb-3">{dev.role}</p>
              <p className="text-neutral-400 text-sm leading-relaxed flex-1">{dev.bio}</p>
              <div className="flex mx-auto items-center gap-6 mt-5 pt-4 border-t border-slate-100">
                {/* GitHub Link */}
                <a
                  href={dev.github || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${dev.name} GitHub`}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    dev.github && dev.github !== '#'
                      ? 'bg-slate-100 hover:bg-indigo-500 text-indigo-400 hover:text-white'
                      : 'bg-slate-50 text-slate-300 pointer-events-none opacity-50'
                  }`}
                >
                  <Github size={20} />
                </a>

                {/* LinkedIn Link */}
                <a
                  href={dev.linkedin || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${dev.name} LinkedIn`}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    dev.linkedin && dev.linkedin !== '#'
                      ? 'bg-slate-100 hover:bg-indigo-500 text-indigo-400 hover:text-white'
                      : 'bg-slate-50 text-slate-300 pointer-events-none opacity-50'
                  }`}
                >
                  <Linkedin size={20} />
                </a>

                {/* Email Link */}
                <a
                  href={dev.email ? `mailto:${dev.email}` : '#'}
                  aria-label={`Email ${dev.name}`}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    dev.email
                      ? 'bg-slate-100 hover:bg-indigo-500 text-indigo-400 hover:text-white'
                      : 'bg-slate-50 text-slate-300 pointer-events-none opacity-50'
                  }`}
                >
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-neutral-900 font-sans">
      {/* Sticky header */}
      <header className="bg-white dark:bg-neutral-900 backdrop-blur-md sticky top-0 z-50 border-t-0 border-r-0 border-l-0 border-b-3 border-indigo-500 border-solid">
        <div className="flex items-center justify-between h-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <img src={attendease_logo} alt="Logo" className="w-4 h-4" />
              </div>
              <span className="text-2xl font-semibold flex"><p className='text-black'>Attend</p><p className='text-indigo-800'>Ease</p></span>
            </div>
            <a
                href="/login"
                className="no-underline flex items-center gap-1 ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <LayoutDashboard size={15} />
                Login/Register
              </a>
          
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-2 lg:px-8 -mb-1 overflow-x-auto overflow-y-hidden">
          <div className="max-w-4xl items-left justify-left flex gap-2 mx-2 md:gap-5">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-t-2xl flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-gray-800 border-indigo-500 border-solid border-3 border-b-transparent bg-slate-100 '
                    : 'border-t-1 border-r-1 border-l-1 mb-1 border-b-0 border-slate-500/20 border-solid bg-slate-50 text-neutral-600 hover:text-slate-100 hover:bg-indigo-500'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-8xl mx-auto px-8 py-12 bg-slate-100">
        {activeTab === 'about' && <AboutSection />}
        {activeTab === 'download' && <DownloadSection />}
        {activeTab === 'developers' && <DevelopersSection />}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-800 to-gray-900 border-t border-slate-200 mt-16">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
                <img src={attendease_logo} alt="Logo" className="w-3 h-3" />
              </div>
              <span className="text-lg font-semibold flex"><p className='text-white'>Attend</p><p className='text-indigo-500'>Ease</p></span>
            </div>
            <p className="text-xs text-neutral-400">
              &copy; {new Date().getFullYear()} AttendEase. All rights reserved.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-slate-200 hover:text-indigo-600 font-medium transition-colors duration-200"
            >
              <Mail size={14} />
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
