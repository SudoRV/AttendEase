import {
    FiDownload as Download,
    FiExternalLink as ExternalLink,
    FiStar as Star,
    FiZap as Zap,
    FiLayers as Layers,
    FiMonitor
} from "react-icons/fi";
import { FaAndroid, FaApple } from "react-icons/fa";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { QRCode } from 'react-qrcode-logo';
import { AppStates } from "../services/states";

import LandingHeader from "../components/LandingHeader";
import LandingFooter from "../components/LandingFooter";

export default function DownloadApp() {
    const { buildUrl } = AppStates();

    return (
        <div className="min-h-screen bg-[#f5f7fb] dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-300">

            <LandingHeader />

            <main className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                {/* --- Sophisticated Ambient Atmosphere --- */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden select-none z-0">
                    <div className="absolute top-[-10%] left-[15%] w-[45%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[140px] rounded-full" />
                    <div className="absolute top-[10%] right-[15%] w-[35%] h-[40%] bg-sky-400/10 dark:bg-sky-500/5 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-6xl mx-auto relative z-10 space-y-20">
                    {/* --- Hero Accent Section --- */}
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/5 dark:bg-white/5 border border-zinc-950/10 dark:border-white/10 backdrop-blur-md">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-400">
                                v2.O Live Now
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[1.1]">
                            Master your schedule. <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
                                Anywhere, anytime.
                            </span>
                        </h1>

                        <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-xl mx-auto font-medium leading-relaxed">
                            Get access to real-time sync, secure local data storage, and zero latency micro-actions natively coded for your device ecosystem.
                        </p>

                        {/* Minimal Trust Indicator */}
                        <div className="flex items-center justify-center gap-6 pt-2 text-zinc-500 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                            <div className="flex items-center gap-1.5">
                                <Star size={14} className="text-amber-500 fill-amber-500" />
                                <span>4.9 User Rating</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-800" />
                            <div>Over 15+ Installs</div>
                        </div>
                    </div>

                    {/* --- Advanced UI Platform Cards --- */}
                    {/* App Platform Cards */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

                        {/* Android Card */}
                        <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="bg-slate-900 dark:bg-slate-950 p-8 flex items-center justify-center relative">
                                <div className="bg-white rounded-2xl overflow-hidden shadow-inner relative group-hover:scale-105 transition-transform duration-300">
                                    {/* <QrCode className="w-full h-full text-slate-900" strokeWidth={1.5} /> */}

                                    <QRCode
                                        size={150}
                                        value={buildUrl("/download-apk")}
                                        ecLevel="H"
                                        qrStyle="squares"

                                        // Exact eye formatting configuration supported by this package
                                        eyeRadius={[
                                            { // Top-Left Eye
                                                outer: [10, 10, 10, 10],
                                                inner: [5, 5, 5, 5],
                                            },
                                            { // Top-Right Eye
                                                outer: [10, 10, 10, 10],
                                                inner: [5, 5, 5, 5],
                                            },
                                            { // Bottom-Left Eye
                                                outer: [10, 10, 10, 10],
                                                inner: [5, 5, 5, 5],
                                            }
                                        ]}
                                    />

                                </div>
                            </div>
                            <div className="p-8 space-y-6 flex flex-col relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500/10 dark:bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/20">
                                        <FaAndroid size={26} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">Android</h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Requires Android 8.0+</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Scan the QR code with your device camera or tap the button below to download safely from the Google Play Store.
                                </p>
                                <a
                                    href={buildUrl("/download-app?latest")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download="AttendEase.apk"
                                    className="flex items-center justify-center gap-2.5 w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 dark:shadow-none"
                                >
                                    <Download size={18} />
                                    Download for Android
                                    <ExternalLink size={14} className="opacity-70" />
                                </a>
                            </div>
                        </div>

                        {/* iOS Card */}
                        <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center overflow-hidden">
                                <div className="absolute w-screen z-30 rotate-[30deg] bg-gradient-to-r from-indigo-200 to-indigo-200 via-indigo-800 text-white font-bold text-xl tracking-widest py-2 text-center shadow-xl uppercase">
                                    Coming Soon
                                </div>
                            </div>
                            <div className="bg-slate-900 dark:bg-slate-950 p-8 flex items-center justify-center relative">
                                <div className="w-40 h-40 bg-white rounded-2xl p-3 shadow-inner relative group-hover:scale-105 transition-transform duration-300">
                                    {/* <img src={iOS_QR} alt="iOS App Download QR Code" className='w-full h-full' /> */}
                                    <QrCode className="w-full h-full text-slate-900" strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="p-8 space-y-6 flex flex-col relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                                        <FaApple size={26} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">iOS</h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Requires iOS 12.0+</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Scan the QR code with your device camera or tap the button below to download safely from the Apple App Store.
                                </p>
                                <a
                                    href="https://apps.apple.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2.5 w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 dark:shadow-none"
                                >
                                    <Download size={18} />
                                    Download for iOS
                                    <ExternalLink size={14} className="opacity-70" />
                                </a>
                            </div>
                        </div>

                    </div>

                    {/* --- Bento-Style Architectural Features --- */}
                    <div className="border-t border-zinc-200 dark:border-zinc-900 max-w-5xl mx-auto pt-12">
                        <div className="grid sm:grid-cols-3 gap-6">

                            {/* Card 1: Sync */}
                            <div className="p-6 rounded-2xl bg-white/60 dark:bg-zinc-950/40 shadow-md border border-zinc-200/60 dark:border-zinc-800/40 backdrop-blur-sm transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-4">
                                    <Zap size={18} className="text-amber-500" />
                                </div>
                                <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-1">Instant Sync</h4>
                                <p className="text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                    Proprietary background handling ensures device states match web applications instantaneously.
                                </p>
                            </div>

                            {/* Card 2: Offline */}
                            <div className="p-6 rounded-2xl bg-white/60 dark:bg-zinc-950/40 shadow-md border border-zinc-200/60 dark:border-zinc-800/40 backdrop-blur-sm transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-4">
                                    <Layers size={18} className="text-indigo-500" />
                                </div>
                                <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-1">Zero Grid Offlining</h4>
                                <p className="text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                    Robust local caching and BLE Mesh tech guarantee app operability when standard network towers drop.
                                </p>
                            </div>

                            {/* Card 3: New Cross Platform Property */}
                            <div className="p-6 rounded-2xl bg-white/60 dark:bg-zinc-950/40 shadow-md border border-zinc-200/60 dark:border-zinc-800/40 backdrop-blur-sm transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-4">
                                    <FiMonitor size={18} className="text-blue-500" />
                                </div>
                                <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-1">Universal Access</h4>
                                <p className="text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                    Transition seamlessly between desktop, web, and mobile ecosystems with persistent cloud-saved layouts.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
