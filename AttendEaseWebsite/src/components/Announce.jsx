import React, { useState } from "react";
import Select from "react-select";
import { AppStates } from "../services/states";
import {
  FiType,
  FiFileText,
  FiCalendar,
  FiUsers,
  FiArrowRight
} from "react-icons/fi";
import { useTheme } from '../context/ThemeContext';

const YEAR_OPTIONS = [
  { value: "all", label: "All Years" },
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
];

const BRANCH_OPTIONS = [
  { value: "all", label: "All Branches" },
  { value: "CSE", label: "CSE" },
  { value: "AI", label: "AI / ML" },
  { value: "RA", label: "Robotics" },
  { value: "ME", label: "ME" },
  { value: "CE", label: "Civil" },
  { value: "BCA", label: "BCA" },
];

const SECTION_OPTIONS = [
  { value: "all", label: "All Sections" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
];

export default function Announce() {
  const { userData, buildUrl, formatDate, loadAnnouncements } = AppStates();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", body: "", expires_at: "" });
  const [targetYears, setTargetYears] = useState([]);
  const [targetBranches, setTargetBranches] = useState([]);
  const [targetSections, setTargetSections] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnnounce = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      created_by: {
        name: userData?.name,
        id: userData?.teacher_id,
        user_id: userData?.user_id
      },
      scope,
      target_year: targetYears.map((o) => o.value),
      target_branch: targetBranches.map((o) => o.value),
      target_section: targetSections.map((o) => o.value),
      status: "Active",
      expires_at: formData.expires_at
        ? formatDate(formData.expires_at)
        : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)
    };

    try {
      const response = await fetch(buildUrl("/announce"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (resData.success) {
        loadAnnouncements();
        // setFormData({ title: "", body: "", expires_at: "" });
        // setTargetYears([]);
        // setTargetBranches([]);
        // setTargetSections([]);
        alert("Announcement posted successfully!");
      }
    } catch (error) {
      console.error("Announcement failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Shared custom tailwind-compatible styling mapping rules for react-select components
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'transparent',
      borderColor: state.isFocused ? '#6366f1' : isDark ? 'rgba(226, 232, 240, 0.2)' : 'rgba(226, 232, 240, 0.8)',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none',
      borderRadius: '12px',
      paddingTop: '2px',
      paddingBottom: '2px',
      '&:hover': {
        borderColor: state.isFocused ? '#6366f1' : 'rgba(203, 213, 225, 1)',
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      overflow: 'hidden',
      padding: '4px'
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      backgroundColor: state.isSelected
        ? '#6366f1'
        : state.isFocused
          ? 'rgba(99, 102, 241, 0.05)'
          : 'transparent',
      color: state.isSelected ? '#ffffff' : '#334155',
      '&:active': {
        backgroundColor: '#4f46e5'
      }
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      borderRadius: '6px',
      fontWeight: '600',
      color: '#4f46e5'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#4f46e5',
      fontSize: '12px',
      paddingLeft: '6px'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#6366f1',
      '&:hover': {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        color: '#4f46e5',
        borderRadius: '0 6px 6px 0'
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: '#94a3b8',
      fontSize: '13px',
      fontWeight: '500'
    })
  };

  const [scope, setScope] = useState("students")

  return (
    <div className="max-w-xl sm:max-w-full mx-auto bg-white dark:bg-neutral-950/40 border border-neutral-200/50 dark:border-neutral-900 mr-2 p-2 px-6 sm:p-8 sm:py-4 rounded-3xl transition-colors duration-300 antialiased">

      {/* Header Block */}
      <div className="text-center space-y-1 mb-6 border-b border-neutral-100 dark:border-neutral-900 pb-4">
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent sm:text-3xl">
          Broadcast Notice
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium">
          Post an announcement to specific target groups inside the institution
        </p>
      </div>

      <form onSubmit={handleAnnounce} className="space-y-5">

        {/* Core Informational Blocks */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Notice Title
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200 pointer-events-none">
                <FiType size={16} />
              </span>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter announcement title..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 border border-neutral-500 dark:border-neutral-800 outline-none text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Content Body
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-4 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200 pointer-events-none">
                <FiFileText size={16} />
              </span>
              <textarea
                required
                rows={4}
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                placeholder="Type the message body details here..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 outline-none text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Audience Selective Filters Layout Column */}

        <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500">
            <FiUsers size={14} />
            <p className="text-[11px] font-bold uppercase tracking-wider">Target Audience Scope</p>
          </div>

          <div className="flex gap-4">
            <label className="text-sm dark:text-neutral-300 flex items-center gap-2">Students <input type="radio" name="scope" value="students" checked={scope === "students"}
              onChange={(e) => setScope(e.target.value)} /></label>

            <label className="text-sm dark:text-neutral-300 flex items-center gap-2">Teachers <input type="radio" name="scope" value="teachers" checked={scope === "teachers"}
              onChange={(e) => setScope(e.target.value)} /></label>
          </div>

          {
            scope === "students" && (
              <div className="grid gap-3">
                <Select
                  isMulti
                  placeholder="Filter Target Year(s)"
                  options={YEAR_OPTIONS}
                  value={targetYears}
                  onChange={setTargetYears}
                  styles={selectStyles}
                />
                <Select
                  isMulti
                  placeholder="Filter Target Branch(es)"
                  options={BRANCH_OPTIONS}
                  value={targetBranches}
                  onChange={setTargetBranches}
                  styles={selectStyles}
                />
                <Select
                  isMulti
                  placeholder="Filter Target Section(s)"
                  options={SECTION_OPTIONS}
                  value={targetSections}
                  onChange={setTargetSections}
                  styles={selectStyles}
                />
              </div>
            )
          }

        </div>

        {/* Expiry Calendar Selection Block */}
        <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-900">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Broadcast Deadline
          </label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 pointer-events-none z-20">
              <FiCalendar size={16} />
            </span>
            <input
              type="datetime-local"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleInputChange}
              className="w-full bg-neutral-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 pl-11 pr-4 py-2.5 rounded-xl outline-none text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200 text-neutral-800 dark:text-neutral-100 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>

        {/* Action Button Trigger Row */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 border-none select-none
              ${loading
                ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/10 active:scale-[0.99]'
              }`}
          >
            {loading ? 'Processing Broadcast...' : 'Post Announcement'}
            {!loading && <FiArrowRight size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}