import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppStates } from '../services/states';
import Header from './Header';
import {
  FiMail,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiArrowRight
} from 'react-icons/fi';

import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

function LoginPage() {
  const navigate = useNavigate();
  const { setUserData, buildUrl } = AppStates();

  const [isEmailValid, setEmailValid] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = new FormData(e.target);
      const formData = Object.fromEntries(form.entries());

      const response = await fetch(buildUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      window.localStorage.setItem("user_creds", JSON.stringify(data.user_creds));

      alert(data.message);

      if (data.success) {
        console.log('Login successful! Redirecting to dashboard...');
        setUserData(data.user_creds);
        navigate('/dashboard');
      } else {
        console.log('Login failed.');
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validate = async (event) => {
    const field = event.target;
    const value = field.value;

    if (field.name === "email") {
      if (!value) {
        setEmailValid(null);
        return;
      }

      const response = await fetch(buildUrl("/validate-creds"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "email": value })
      });

      const isValid = await response.json();
      setEmailValid(isValid.success ? true : false);
    }
  };

  return (
    <div className='w-full !h-full flex flex-col'>
      <LandingHeader />

      <div className="w-full flex-1 bg-[#f5f7fb] dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 flex flex-col justify-center items-center px-4 transition-colors duration-300 antialiased">

        <div className="w-full max-w-md bg-white dark:bg-neutral-950/40 border border-neutral-200/50 dark:border-neutral-900 p-8 rounded-3xl shadow-xl  dark:shadow-none space-y-6">

          {/* Branding Headings */}
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent sm:text-4xl">
              AttendEase
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              Login to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Input Field Wrapper */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Email Address
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                  <FiMail size={18} />
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="tom.holland@mcu.com"
                  onChange={validate}
                  className={`w-full pl-11 pr-11 py-3 rounded-xl bg-white dark:bg-neutral-950 border outline-none text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 transition-all duration-200
                  ${isEmailValid === true
                      ? "border-green-500/70 focus:ring-4 focus:ring-green-500/10"
                      : isEmailValid === false
                        ? "border-red-500/70 focus:ring-4 focus:ring-red-500/10"
                        : "border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    }`}
                />

                {/* Contextual Status Micro-Icons */}
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isEmailValid === true && <FiCheckCircle className="text-green-500" size={18} />}
                  {isEmailValid === false && <FiAlertCircle className="text-red-500" size={18} />}
                </span>
              </div>

              {/* Validation Feedback Messaging */}
              {isEmailValid === true && (
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 pl-1">User account verified</p>
              )}
              {isEmailValid === false && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 pl-1">User account doesn't exist</p>
              )}
            </div>

            {/* Password Input Field Wrapper */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Password
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                  <FiLock size={18} />
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 outline-none text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
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

            {/* Interactive Submit Controller Button */}
            <button
              type="submit"
              disabled={!isEmailValid || isSubmitting}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 border-none select-none mt-2
              ${isEmailValid && !isSubmitting
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/10 active:scale-[0.99]"
                  : "bg-neutral-300 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? "Authenticating..." : "Login to Account"}
              {!isSubmitting && <FiArrowRight size={16} />}
            </button>

          </form>

          {/* Redirect Alternative Navigation Trigger */}
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 font-medium pt-2 border-t border-neutral-100 dark:border-neutral-900">
            Don’t have an account?
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1">
              Register here
            </Link>
          </p>

        </div>
      </div>

      {/* <LandingFooter /> */}
    </div>
  );
}

export default LoginPage;