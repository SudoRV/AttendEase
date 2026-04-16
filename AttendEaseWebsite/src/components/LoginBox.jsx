import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- IMPORT useNavigate
import { AppStates } from '../services/states';

function LoginPage() {
  const navigate = useNavigate();
  const { setUserData, buildUrl } = AppStates();

  // 2. Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    // creation of formdata
    const form = new FormData(e.target);
    const formData = Object.fromEntries(form.entries());

    // authenticate user login
    const response = await fetch(buildUrl("/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })

    const data = await response.json();
    window.localStorage.setItem("user_creds", JSON.stringify(data.user_creds));

    alert(data.message);

    const loginSuccessful = data.success;
    if (loginSuccessful) {
      console.log('Login successful! Redirecting to dashboard...');

      // set user data
      setUserData(data.user_creds)

      // 3. Use navigate to redirect to the new route
      navigate('/dashboard');

    } else {
      // Handle login failure (show error message)
      console.log('Login failed.');
    }
  };

  const [isEmailValid, setEmailValid] = useState(null);

  const validate = async (event) => {
    const field = event.target;
    const value = field.value;

    // validate email id
    if (field.name === "email") {
      const response = await fetch(buildUrl("/validate-creds"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "email": value })
      })

      const isValid = await response.json();
      setEmailValid(isValid.success ? true : false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center my-16 gap-24">

      <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8">

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Login to continue to your dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="tom.holland@mcu.com"
              onChange={validate}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition
                ${isEmailValid === true
                  ? "border-green-500 focus:ring-2 focus:ring-green-300"
                  : isEmailValid === false
                    ? "border-red-500 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-indigo-300"
                }`}
            />

            {isEmailValid === true && (
              <p className="text-sm text-green-600 mt-1">User exists</p>
            )}
            {isEmailValid === false && (
              <p className="text-sm text-red-600 mt-1">User doesn’t exist</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={!isEmailValid}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all border-none
              ${isEmailValid
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            Login
          </button>

        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?
          <Link to="/register" className="text-indigo-600 font-medium hover:underline ml-1">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;
