import { useState } from "react";
import RegisterBox from "../components/RegisterBox";


function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    teacherId: "",
    branch: "",
    year: "",
    studentId: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration Form Submitted!");
    console.log("Role:", selectedRole);
    console.log("Data:", formData);
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);

    setFormData((prev) => ({
      ...prev,
      teacherId: "",
      branch: "",
      year: "",
      studentId: ""
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <RegisterBox
        selectedRole={selectedRole}
        formData={formData}
        handleSubmit={handleSubmit}
        handleRoleChange={handleRoleChange}
        handleInputChange={handleInputChange}
      />
    </>
  );
}

export default RegisterPage;
