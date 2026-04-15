import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom'; // (Recommended for real React apps)

function RegisterPage() {
  const navigate = useNavigate();
  // 1. State to manage the selected role
  const [selectedRole, setSelectedRole] = useState('');
  const [isEmailValid, setEmailValid] = useState(null);
  const [isIDValid, setIDValid] = useState(null);

  // 2. State to manage form inputs (Recommended, though basic form is shown here)
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: '',
    password: '',
    student_id: '',
    teacher_id: '',
    branch: '',
    year: '',
  });

  // 3. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })

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
        branch: "",
        year: ""
      });

      alert(responseJSON.message);
      navigate('/dashboard');
    } else {
      setFormData(prevData => ({
        ...prevData,
        email: "",
        password: "",
        student_id: ""
      }));
    }
  };

  // 4. Handle role change (Updates state)
  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);

    // Optional: Reset role-specific fields when the role changes
    setFormData(prevData => ({
      ...prevData,
      role: role,
      teacher_id: '',
      branch: '',
      year: '',
      student_id: '',
    }));
  };

  // 5. useEffect hook replaces the DOMContentLoaded listener and roleSelect.addEventListener('change', ...)
  // This runs whenever selectedRole changes
  useEffect(() => {
    // Note: In React, we use the `required` attribute directly on the JSX element,
    // which is controlled by the state logic, not by manipulating the DOM via JS.
    // The conditional rendering below handles the display.

    // The `required` attribute for the role-specific fields must be set directly
    // based on the `selectedRole` state in the JSX below.

  }, [selectedRole]);

  // Function to handle changes in text inputs/selects
  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    // validate email and techer/student id
    if (name === "email" || name === "student_id" || name === "teacher_id") {
      const response = await fetch("/validate-creds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ [name]: value })
      })

      const responseJSON = await response.json();
      responseJSON.success = !responseJSON.success;

      if (name === "email") {
        setEmailValid(responseJSON.success ? true : false);
      } else {
        setIDValid(responseJSON.success ? true : false);
      }
    }
  };

  const input =
    "w-full px-4 py-3 rounded-xl border focus:outline-none transition";

  return (
    <div className="flex flex-1 flex-col gap-24 items-center justify-center px-4 my-16">

      <div className="w-full max-w-xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8">

        <h1 className="text-3xl font-bold text-center text-gray-800">
          Create Account
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Register to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Row 1: Role + Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Role
              </label>
              <select
                className={`${input} border-gray-300 focus:ring-indigo-300`}
                value={selectedRole}
                onChange={handleRoleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Name
              </label>
              <input
                className={`${input} border-gray-300 focus:ring-indigo-300`}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>
            <input
              className={`${input}
                ${isEmailValid === true
                  ? "border-green-500 focus:ring-green-300"
                  : isEmailValid === false
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-indigo-300"
                }`}
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {isEmailValid === true && (
              <p className="text-sm text-green-600 mt-1">Email available</p>
            )}
            {isEmailValid === false && (
              <p className="text-sm text-red-600 mt-1">Email already registered</p>
            )}
          </div>

          {/* Teacher Field */}
          {selectedRole === "Teacher" && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Teacher ID
              </label>
              <input
                className={`${input}
                  ${isIDValid === true
                    ? "border-green-500 focus:ring-green-300"
                    : isIDValid === false
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-indigo-300"
                  }`}
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {/* Student Fields */}
          {selectedRole === "Student" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  className={`${input} border-gray-300 focus:ring-indigo-300`}
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Branch</option>
                  <option value="CSE">CSE</option>
                  <option value="AI">AI</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                  <option value="RA">RA</option>
                  <option value="BCA">BCA</option>
                </select>

                <select
                  className={`${input} border-gray-300 focus:ring-indigo-300`}
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Year</option>
                  <option value="1">1st</option>
                  <option value="2">2nd</option>
                  <option value="3">3rd</option>
                  <option value="4">4th</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Student ID
                </label>
                <input
                  className={`${input}
                    ${isIDValid === true
                      ? "border-green-500 focus:ring-green-300"
                      : isIDValid === false
                        ? "border-red-500 focus:ring-red-300"
                        : "border-gray-300 focus:ring-indigo-300"
                    }`}
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          {/* Row 3: Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <input
              type="password"
              className={`${input} border-gray-300 focus:ring-indigo-300`}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!(isEmailValid && isIDValid)}
            className={`w-full py-3 rounded-xl font-semibold text-white transition
              border-none ${isEmailValid && isIDValid
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            Register
          </button>

        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?
          <Link to="/login" className="text-indigo-600 font-medium hover:underline ml-1">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;
