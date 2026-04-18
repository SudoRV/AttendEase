import { useNavigate } from "react-router-dom";
import LoginBox from "../components/LoginBox";
import Header from "../components/Header";
function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const loginSuccessful = true;

    if (loginSuccessful) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="bg-neutral-100 flex items-center justify-center width-full min-h-screen">
      <LoginBox handleSubmit={handleSubmit} />
      </div>
  );
}

export default LoginPage;
