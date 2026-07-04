import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { AppStates } from "../services/states";
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiChevronDown, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight,
  FiBriefcase,
  FiBookOpen
} from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import LandingHeader from "./LandingHeader";
import LandingFooter from "./LandingFooter";

function RegisterPage() {
  const { buildUrl } = AppStates();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const [selectedRole, setSelectedRole] = useState('');
  const [isEmailValid, setEmailValid] = useState(null);
  const [isIDValid, setIDValid] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: '',
    password: '',
    student_id: '',
    teacher_id: '',
    branch_id: '',
    year: '',
    semester: '',
    section: 'A'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 10));


    try {
      const response = await fetch(buildUrl("/api/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const responseJSON = await response.json();
      alert(responseJSON.message);

      if (responseJSON.success === true) {
        window.localStorage.setItem("user_creds", JSON.stringify(formData));
        setFormData({
          role: "",
          name: "",
          email: "",
          password: "",
          student_id: "",
          teacher_id: "",
          branch_id: "",
          year: "",
          semester: "",
          section: "A"
        });
        setSelectedRole('');
        setEmailValid(null);
        setIDValid(null);
        navigate('/dashboard');
      } else {
        setFormData(prevData => ({
          ...prevData,
          email: "",
          password: "",
          student_id: ""
        }));
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    setIDValid(null);

    setFormData(prevData => ({
      ...prevData,
      role: role,
      teacher_id: '',
      branch_id: '',
      year: '',
      semester: '',
      student_id: '',
    }));
  };

  useEffect(() => {
    // Retained for logic extensions if required by the app layer.
  }, [selectedRole]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "email" || name === "student_id" || name === "teacher_id") {
      if (!value) {
        if (name === "email") setEmailValid(null);
        else setIDValid(null);
        return;
      }

      const response = await fetch(buildUrl("/validate-creds"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ [name]: value })
      });

      const responseJSON = await response.json();
      responseJSON.success = !responseJSON.success;

      if (name === "email") {
        setEmailValid(responseJSON.success ? true : false);
      } else {
        setIDValid(responseJSON.success ? true : false);
      }
    }
  };

  // Modern UI unified input component styles
  const inputBaseStyle = "w-full pl-11 pr-11 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border outline-none text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 transition-all duration-200";
  const focusRingStyle = "border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  return (
    <div className="w-full !h-screen flex flex-col">
      <LandingHeader />
      
      <div className="flex-1 bg-[#f5f7fb] dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300 antialiased">
      
      <div className="w-full max-w-xl bg-white dark:bg-neutral-950/40 border border-neutral-200/50 dark:border-neutral-900 p-8 rounded-3xl shadow-xl dark:shadow-none space-y-6">
        
        {/* Header Block */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent sm:text-4xl">
            Create Account
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            Register below to build your institution profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Row 1: Role selection + Name Field */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Account Role
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                  <FiBriefcase size={16} />
                </span>
                <select
                  className={`${inputBaseStyle} ${focusRingStyle} appearance-none pr-10 cursor-pointer`}
                  value={selectedRole}
                  onChange={handleRoleChange}
                  required
                >
                  <option value="" className="dark:bg-neutral-900">Select Role</option>
                  <option value="Teacher" className="dark:bg-neutral-900">Teacher</option>
                  <option value="Student" className="dark:bg-neutral-900">Student</option>
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <FiChevronDown size={14} />
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Full Name
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                  <FiUser size={16} />
                </span>
                <input
                  className={`${inputBaseStyle} ${focusRingStyle}`}
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 2: Email Configuration */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Email Address
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                <FiMail size={16} />
              </span>
              <input
                className={`${inputBaseStyle} 
                  ${isEmailValid === true
                    ? "border-green-500/70 focus:ring-4 focus:ring-green-500/10"
                    : isEmailValid === false
                      ? "border-red-500/70 focus:ring-4 focus:ring-red-500/10"
                      : focusRingStyle
                  }`}
                name="email"
                type="email"
                placeholder="john.doe@institution.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                {isEmailValid === true && <FiCheckCircle className="text-green-500" size={16} />}
                {isEmailValid === false && <FiAlertCircle className="text-red-500" size={16} />}
              </span>
            </div>
            {isEmailValid === true && (
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 pl-1">Email available</p>
            )}
            {isEmailValid === false && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 pl-1">Email already registered</p>
            )}
          </div>

          {/* Conditional Layout Section: Teacher Specifics */}
          {selectedRole === "Teacher" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Teacher ID
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                  <FiBookOpen size={16} />
                </span>
                <input
                  className={`${inputBaseStyle} 
                    ${isIDValid === true
                      ? "border-green-500/70 focus:ring-4 focus:ring-green-500/10"
                      : isIDValid === false
                        ? "border-red-500/70 focus:ring-4 focus:ring-red-500/10"
                        : focusRingStyle
                    }`}
                  name="teacher_id"
                  placeholder="T-101"
                  value={formData.teacher_id}
                  onChange={handleInputChange}
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isIDValid === true && <FiCheckCircle className="text-green-500" size={16} />}
                  {isIDValid === false && <FiAlertCircle className="text-red-500" size={16} />}
                </span>
              </div>
              {isIDValid === true && <p className="text-xs font-semibold text-green-600 dark:text-green-400 pl-1">ID verified</p>}
              {isIDValid === false && <p className="text-xs font-semibold text-red-600 dark:text-red-400 pl-1">ID already registered</p>}
            </div>
          )}

          {/* Conditional Layout Section: Student Specifics */}
          {selectedRole === "Student" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Branch + Year Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <select
                    className={`${inputBaseStyle} ${focusRingStyle} appearance-none px-4 cursor-pointer`}
                    name="branch_id"
                    value={formData.branch_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" className="dark:bg-neutral-900">Branch</option>
                    <option value="CSE" className="dark:bg-neutral-900">CSE</option>
                    <option value="AI" className="dark:bg-neutral-900">AI</option>
                    <option value="ME" className="dark:bg-neutral-900">ME</option>
                    <option value="CE" className="dark:bg-neutral-900">CE</option>
                    <option value="RA" className="dark:bg-neutral-900">RA</option>
                    <option value="BCA" className="dark:bg-neutral-900">BCA</option>
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <FiChevronDown size={14} />
                  </span>
                </div>

                <div className="relative group">
                  <select
                    className={`${inputBaseStyle} ${focusRingStyle} appearance-none px-4 cursor-pointer`}
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" className="dark:bg-neutral-900">Year</option>
                    <option value="1" className="dark:bg-neutral-900">1st Year</option>
                    <option value="2" className="dark:bg-neutral-900">2nd Year</option>
                    <option value="3" className="dark:bg-neutral-900">3rd Year</option>
                    <option value="4" className="dark:bg-neutral-900">4th Year</option>
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <FiChevronDown size={14} />
                  </span>
                </div>
              </div>

              {/* Semester + Section Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <select
                    className={`${inputBaseStyle} ${focusRingStyle} appearance-none px-4 cursor-pointer`}
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" className="dark:bg-neutral-900">Semester</option>
                    {Array.from({ length: 10 }, (_, idx) => (
                      <option key={idx + 1} value={idx + 1} className="dark:bg-neutral-900">
                        Semester {idx + 1}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <FiChevronDown size={14} />
                  </span>
                </div>

                <div className="relative group">
                  <select
                    className={`${inputBaseStyle} ${focusRingStyle} appearance-none px-4 cursor-pointer`}
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" className="dark:bg-neutral-900">Section</option>
                    <option value="A" className="dark:bg-neutral-900">Section A</option>
                    <option value="B" className="dark:bg-neutral-900">Section B</option>
                    <option value="C" className="dark:bg-neutral-900">Section C</option>
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <FiChevronDown size={14} />
                  </span>
                </div>
              </div>

              {/* Student ID Target Input Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Student ID
                </label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                    <FiBookOpen size={16} />
                  </span>
                  <input
                    className={`${inputBaseStyle} 
                      ${isIDValid === true
                        ? "border-green-500/70 focus:ring-4 focus:ring-green-500/10"
                        : isIDValid === false
                          ? "border-red-500/70 focus:ring-4 focus:ring-red-500/10"
                          : focusRingStyle
                      }`}
                    name="student_id"
                    placeholder="S-10243"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isIDValid === true && <FiCheckCircle className="text-green-500" size={16} />}
                    {isIDValid === false && <FiAlertCircle className="text-red-500" size={16} />}
                  </span>
                </div>
                {isIDValid === true && <p className="text-xs font-semibold text-green-600 dark:text-green-400 pl-1">ID verified</p>}
                {isIDValid === false && <p className="text-xs font-semibold text-red-600 dark:text-red-400 pl-1">ID already registered</p>}
              </div>
            </div>
          )}

          {/* Row 3: Secure Password Masking Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Password
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                <FiLock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className={`${inputBaseStyle} ${focusRingStyle}`}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors p-0.5 border-none bg-transparent"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Core Action Submit Handling Button */}
          <button
            type="submit"
            disabled={!(isEmailValid && isIDValid) || isSubmitting || loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 border-none select-none mt-4
              ${isEmailValid && isIDValid && !isSubmitting
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/10 active:scale-[0.99]"
                : "bg-neutral-300 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
              }`}
          >
            {isSubmitting ? "Processing Registry..." : "Register Account"}
            {!isSubmitting && <FiArrowRight size={16} />}
          </button>

        </form>

        {/* System Toggle Alternative View Trigger */}
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 font-medium pt-2 border-t border-neutral-100 dark:border-neutral-900">
          Already have an account?
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1">
            Login here
          </Link>
        </p>

      </div>
    </div>

    <LandingFooter />
    {loading && (
      <div className="fixed inset-0 z-[999] bg-gradient-to-b from-neutral-900/60 to-neutral-900/60 via-neutral-900/30 backdrop-blur-md flex items-center justify-center">
        <div className="bg-transparent px-6 py-4 rounded-2xl  items-center text-center">
          <p className="text-4xl font-bold text-neutral-800 dark:text-neutral-200">Redirecting to Login</p>
          <AiOutlineLoading3Quarters className="text-indigo-500 text-6xl animate-spin mt-5 font-semibold"/>
        </div>
      </div>
    )}
    </div>
  );
}

export default RegisterPage;