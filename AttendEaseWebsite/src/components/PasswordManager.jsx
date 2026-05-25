import { useState } from "react";
import {
  FiLock,
  FiKey,
  FiCheckCircle,
  FiRefreshCw,
  FiMail,
  FiLoader,
  FiChevronRight,
  FiSettings,
  FiX,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import {AppStates} from "../services/states";
export default function PasswordSettings() {
  const { buildUrl, userData } = AppStates();
  const [modalVisible, setModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState(""); // "change" or "reset"
  const [loading, setLoading] = useState(false);
  const [resetStep, setResetStep] = useState(1);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  // Replace this with your backend API URL
  
  const API_URL = buildUrl("/reset-password");

  const handlePasswordAction = async (e) => {
    e.preventDefault();

    // Validation
    if (
      authMode === "change" ||
      (authMode === "reset" && resetStep === 2)
    ) {
      if (form.newPassword !== form.confirmPassword) {
        return alert("Passwords do not match!");
      }

      if (form.newPassword.length < 6) {
        return alert("Password must be at least 6 characters.");
      }
    }

    setLoading(true);

    try {
      // ---------------- CHANGE PASSWORD ----------------
      if (authMode === "change") {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email,
            old_password: form.oldPassword,
            new_password: form.newPassword,
            type: "change",
          }),
        });

        const result = await response.json();

        if (response.ok) {
          alert("Password changed successfully.");
          closeModal();
        } else {
          alert(result.message || "Failed to change password.");
        }
      }

      // ---------------- RESET PASSWORD ----------------
      else if (authMode === "reset") {
        // STEP 1 → Send OTP
        if (resetStep === 1) {
          const response = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: userData?.email,
              type: "request_otp",
            }),
          });

          if (response.ok) {
            alert("OTP sent to your email.");
            setResetStep(2);
          } else {
            alert("Failed to send OTP.");
          }
        }

        // STEP 2 → Verify OTP + Reset Password
        else {
          const response = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: userData.email,
              otp: form.otp,
              new_password: form.newPassword,
              type: "verify_reset"
            }),
          });

          if (response.ok) {
            alert("Password reset successful.");
            closeModal();
          } else {
            alert("Invalid OTP or reset failed.");
          }
        }
      }
    } catch (error) {
      alert("Server Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setAuthMode("");
    setResetStep(1);
    setLoading(false);

    setForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      otp: "",
    });
  };

  return (
    <div className="flex items-center justify-center mt-2">
      {/* SETTINGS CARD */}
      <div className="w-full bg-slate-100 dark:bg-neutral-900 rounded-3xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Manage Password
          </h2>
          <FiSettings className="text-indigo-600" size={20} />
        </div>

        <div className="space-y-4">
          {/* CHANGE PASSWORD */}
          <button
            onClick={() => {
              setAuthMode("change");
              setModalVisible(true);
            }}
            className="w-full bg-slate-100 dark:bg-neutral-800 flex justify-between items-center p-4 rounded-2xl border border-slate-200 dark:border-neutral-600 hover:border-indigo-500 transition"
          >
            <span className="font-semibold text-slate-800/80 dark:text-slate-200">
              Change Password
            </span>

            <FiChevronRight
              className="text-indigo-500"
              size={20}
            />
          </button>

          {/* RESET PASSWORD */}
          <button
            onClick={() => {
              setAuthMode("reset");
              setModalVisible(true);
            }}
            className="w-full bg-slate-100 dark:bg-neutral-800 flex justify-between items-center p-4 rounded-2xl border border-slate-200 dark:border-neutral-600 hover:border-indigo-500 transition"
          >
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Reset Password
            </span>

            <FiRefreshCw
              className="text-indigo-500"
              size={20}
            />
          </button>
        </div>
      </div>

      {/* MODAL */}
      {modalVisible && (
        <div onClick={closeModal} className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50 w-screen">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-slate-100 dark:bg-neutral-800 rounded-3xl p-6 shadow-2xl">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {authMode === "change"
                  ? "Change Password"
                  : "Reset Password"}
              </h3>

              <button
                onClick={closeModal}
                className="p-2 rounded-full bg-slate-200 dark:bg-neutral-600 hover:bg-slate-200 dark:hover:bg-neutral-500 transition"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handlePasswordAction}
              className="space-y-4"
            >
              {/* CHANGE PASSWORD */}
              {authMode === "change" && (
                <>
                  {/* OLD PASSWORD */}
                  <InputField
                    icon={<FiLock />}
                    type="password"
                    placeholder="Old Password"
                    value={form.oldPassword}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        oldPassword: e.target.value,
                      })
                    }
                  />

                  {/* NEW PASSWORD */}
                  <InputField
                    icon={<FiKey />}
                    type="password"
                    placeholder="New Password"
                    value={form.newPassword}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        newPassword: e.target.value,
                      })
                    }
                  />

                  {/* CONFIRM PASSWORD */}
                  <InputField
                    icon={<FiCheckCircle />}
                    type="password"
                    placeholder="Confirm New Password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        confirmPassword: e.target.value,
                      })
                    }
                  />

                  <SubmitButton loading={loading}>
                    Update Password
                  </SubmitButton>
                </>
              )}

              {/* RESET PASSWORD */}
              {authMode === "reset" && (
                <>
                  {resetStep === 1 ? (
                    <>
                      <p className="text-sm text-slate-500 text-center">
                        We will send an OTP to your email for
                        verification.
                      </p>

                      <SubmitButton loading={loading}>
                        Send OTP
                      </SubmitButton>
                    </>
                  ) : (
                    <>
                      {/* OTP */}
                      <InputField
                        icon={<FiMail />}
                        type="text"
                        placeholder="Enter OTP"
                        value={form.otp}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            otp: e.target.value,
                          })
                        }
                      />

                      {/* NEW PASSWORD */}
                      <InputField
                        icon={<FiKey />}
                        type="password"
                        placeholder="New Password"
                        value={form.newPassword}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            newPassword: e.target.value,
                          })
                        }
                      />

                      {/* CONFIRM PASSWORD */}
                      <InputField
                        icon={<FiCheckCircle />}
                        type="password"
                        placeholder="Confirm New Password"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            confirmPassword: e.target.value,
                          })
                        }
                      />

                      <SubmitButton loading={loading}>
                        Reset Password
                      </SubmitButton>
                    </>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}

// ---------------- INPUT FIELD ----------------

function InputField({
  icon,
  type,
  placeholder,
  value,
  onChange,
}) {  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-0 bg-slate-200 dark:bg-neutral-900 transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/50 dark:focus-within:ring-indigo-200/50">
        <div className="text-indigo-800 dark:text-indigo-400 text-lg">
            {icon}
        </div>
    <input 
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        required
        onChange={onChange}
        className="w-full bg-transparent text-slate-700 dark:text-slate-300 outline-none border-none ring-0 focus:outline-none focus:ring-0 p-0 py-6"
    />
    <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors bg-transparent border-none outline-none p-0 py-6"
    >
        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
    </button>
    </div>
  );
}

// ---------------- SUBMIT BUTTON ----------------

function SubmitButton({ children, loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center transition"
    >
      {loading ? (
        <FiLoader className="animate-spin" size={20} />
      ) : (
        children
      )}
    </button>
  );
}