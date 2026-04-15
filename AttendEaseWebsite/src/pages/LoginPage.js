import { useNavigate } from "react-router-dom";
import LoginBox from "../components/LoginBox";

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
      <LoginBox handleSubmit={handleSubmit} />
  );
}

export default LoginPage;
