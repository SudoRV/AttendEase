import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppStates } from '../services/states';
import {
  FiMail,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiXCircle,
  FiKey
} from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

function LoginPage() {
  const navigate = useNavigate();
  const { setUserData, buildUrl } = AppStates();
  const [loading, setLoading] = useState(false);

  const [emailValue, setEmailValue] = useState("");
  const [isEmailValid, setEmailValid] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- PASSWORD RECOVERY STATES ---
  const [resetPassModalVisible, setResetPassModalVisible] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [loadingReset, setLoadingReset] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resetForm, setResetForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const openResetModal = () => {
    setResetForm(prev => ({ ...prev, email: emailValue }));
    setResetPassModalVisible(true);
  };

  const closeResetModal = () => {
    setResetPassModalVisible(false);
    setResetStep(1);
    setResetForm({ email: "", otp: "", newPassword: "", confirmPassword: "" });
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordAction = async (e) => {
    e.preventDefault();
    if (resetStep === 2) {
      if (resetForm.newPassword !== resetForm.confirmPassword) {
        return alert("Passwords do not match!");
      }
      if (resetForm.newPassword.length < 6) {
        return alert("Password must be at least 6 characters.");
      }
    }

    setLoadingReset(true);

    try {
      if (resetStep === 1) {
        // REQUEST RESET (SEND OTP)
        const response = await fetch(buildUrl("/reset-password"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetForm?.email, type: "request_otp" }),
        });

        if (response.ok) {
          alert("Check your email for the recovery code.");
          setResetStep(2);
        } else {
          alert("Failed to send OTP.");
        }
      } else {
        // SUBMIT RESET WITH OTP
        const response = await fetch(buildUrl("/reset-password"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: resetForm?.email,
            otp: resetForm.otp,
            new_password: resetForm.newPassword,
            type: "verify_reset"
          }),
        });

        if (response.ok) {
          alert("Account recovered! Please login with your new password.");
          setUserData(null);
          closeResetModal();
        } else {
          alert("Invalid OTP or request failed.");
        }
      }
    } catch (error) {
      alert("Network Error: Check your connection and try again. " + error);
    } finally {
      setLoadingReset(false);
    }
  };

  /* =====================
       LOGIN SUBMIT
  ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    //setIsSubmitting(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const form = new FormData(e.target);
      const formData = Object.fromEntries(form.entries());

      const response = await fetch(buildUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      window.localStorage.setItem("user_creds", JSON.stringify(data.user_creds));
      setLoading(false);
      //alert(data.message);

      if (data.success) {
        setUserData(data.user_creds);
        navigate('/dashboard');
      }
      else {
        alert(data.message || "Login failed. Please check your credentials and try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =====================
       EMAIL VALIDATION
  ===================== */
  const validate = async (event) => {
    const value = event.target.value;
    setEmailValue(value);

    if (!value) {
      setEmailValid(null);
      return;
    }

    try {
      const response = await fetch(buildUrl("/validate-creds"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "email": value })
      });

      const isValid = await response.json();
      setEmailValid(isValid.success ? true : false);
    } catch (err) {
      console.error(err);
      setEmailValid(null);
    }
  };

  return (
    <div className='w-full !h-screen flex flex-col relative'>
      <LandingHeader />

      <div className="my-4 w-full flex-1 bg-[#f5f7fb] dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 flex flex-col justify-center items-center px-4 py-8 transition-colors duration-300 antialiased">
        <div className="w-full max-w-md bg-white dark:bg-neutral-950/40 border border-neutral-200/50 dark:border-neutral-900 p-8 rounded-3xl shadow-xl dark:shadow-none space-y-6">

          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent sm:text-4xl">
              AttendEase
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              Login to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
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
                  value={emailValue}
                  onChange={validate}
                  className={`w-full pl-11 pr-11 py-3 rounded-xl bg-white dark:bg-neutral-950 border outline-none text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 transition-all duration-200
                  ${isEmailValid === true
                      ? "border-green-500/70 focus:ring-4 focus:ring-green-500/10"
                      : isEmailValid === false
                        ? "border-red-500/70 focus:ring-4 focus:ring-red-500/10"
                        : "border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isEmailValid === true && <FiCheckCircle className="text-green-500" size={18} />}
                  {isEmailValid === false && <FiAlertCircle className="text-red-500" size={18} />}
                </span>
              </div>

              {isEmailValid === true && (
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 pl-1">User account verified</p>
              )}
              {isEmailValid === false && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 pl-1">User account doesn't exist</p>
              )}
            </div>

            {/* Password Field */}
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

            <div className="text-right">
              <button
                type="button"
                onClick={openResetModal}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline border-none bg-transparent cursor-pointer"
              >
                Reset password
              </button>
            </div>

            <button
              type="submit"
              disabled={!isEmailValid || loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 border-none select-none mt-2
              ${isEmailValid && !isSubmitting
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/10 active:scale-[0.99] cursor-pointer"
                  : "bg-neutral-300 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? "Authenticating..." : "Login to Account"}
              {!isSubmitting && <FiArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 font-medium pt-2 border-t border-neutral-100 dark:border-neutral-900">
            Don’t have an account?
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1">
              Register here
            </Link>
          </p>
        </div>
      </div>
      <LandingFooter />

      {/* =====================
           RECOVERY MODAL
      ===================== */}
      {resetPassModalVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Reset Password
              </h3>
              <button 
                onClick={closeResetModal} 
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 bg-transparent border-none p-0.5 cursor-pointer"
              >
                <FiXCircle size={22} />
              </button>
            </div>

            <form onSubmit={handlePasswordAction} className="space-y-4">
              {resetStep === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                        <FiMail size={16} />
                      </span>
                      <input
                        type="email"
                        required
                        value={resetForm.email}
                        onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                        placeholder="tom.holland@mcu.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-900 dark:text-neutral-100 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs text-center leading-relaxed">
                    We will send a one-time password to your registered email to verify your identity.
                  </p>

                  <button
                    type="submit"
                    disabled={loadingReset || !resetForm.email}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
                  >
                    {loadingReset ? "Sending OTP..." : "Send OTP"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* OTP Token input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Verification OTP</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                        <FiKey size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        value={resetForm.otp}
                        onChange={(e) => setResetForm({ ...resetForm, otp: e.target.value })}
                        placeholder="Enter One-Time Code"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-900 dark:text-neutral-100 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* New Password input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">New Password</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                        <FiLock size={16} />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={resetForm.newPassword}
                        onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-900 dark:text-neutral-100 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors p-0.5 border-none bg-transparent cursor-pointer"
                      >
                        {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                        <FiLock size={16} />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={resetForm.confirmPassword}
                        onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-900 dark:text-neutral-100 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors p-0.5 border-none bg-transparent cursor-pointer"
                      >
                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingReset}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md cursor-pointer border-none"
                  >
                    {loadingReset ? "Updating Password..." : "Reset Password"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 z-[999] bg-gradient-to-b from-neutral-900/60 to-neutral-900/60 via-neutral-900/30 backdrop-blur-md flex items-center justify-center">
          <div className="bg-transparent px-6 py-4 rounded-2xl  items-center text-center">
            <p className="text-4xl font-bold text-neutral-800 dark:text-neutral-200">Logging in...</p>
            <AiOutlineLoading3Quarters className="text-indigo-500 text-6xl animate-spin mt-5 font-semibold"/>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default LoginPage;