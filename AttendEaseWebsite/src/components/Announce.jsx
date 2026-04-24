import { useState } from "react";
import Select from "react-select";
import { AppStates } from "../services/states";

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
  const { userData, buildUrl, formatDate } = AppStates();
  
  // State management
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
      },
      target_year: targetYears.map((o) => o.value),
      target_branch: targetBranches.map((o) => o.value),
      target_section: targetSections.map((o) => o.value),
      status: "Active",
      expires_at: formData.expires_at ? formatDate(formData.expires_at) : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+1)
    };

    try {
      const response = await fetch(buildUrl("/announce"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (resData.success) {
        // Reset form
        setFormData({ title: "", body: "", expires_at: "" });
        setTargetYears([]);
        setTargetBranches([]);
        setTargetSections([]);
      }
    } catch (error) {
      console.error("Announcement failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-2 bg-white shadow-sm rounded-xl border border-gray-100 h-full">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Announcement</h3>
      
      <form onSubmit={handleAnnounce} className="space-y-5">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter announcement title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              placeholder="What is this about?"
            />
          </div>
        </div>

        {/* Targeting Grid */}
        <div className="pt-4 border-t">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Target Audience</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              isMulti
              placeholder="Year(s)"
              options={YEAR_OPTIONS}
              value={targetYears}
              onChange={setTargetYears}
              className="text-sm"
            />
            <Select
              isMulti
              placeholder="Branch(es)"
              options={BRANCH_OPTIONS}
              value={targetBranches}
              onChange={setTargetBranches}
              className="text-sm"
            />
            <Select
              isMulti
              placeholder="Section(s)"
              options={SECTION_OPTIONS}
              value={targetSections}
              onChange={setTargetSections}
              className="text-sm"
            />
          </div>
        </div>

        {/* Expiry */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
          <input
            type="datetime-local"
            name="expires_at"
            className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.expires_at}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-2.5 rounded-lg font-semibold text-white transition-all border-none
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-600 active:scale-95'}
            `}
          >
            {loading ? 'Processing...' : 'Post Announcement'}
          </button>
        </div>
      </form>
    </div>
  );
}