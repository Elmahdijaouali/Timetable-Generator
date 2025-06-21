// import axios from "axios"
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import api from "../api/apiConfig";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [errors, setErrors] = useState("");
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const res = await api.post("/register", formData);

      if (res && res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem(
          "administrator",
          JSON.stringify(res.data.administrator)
        );
        navigate("/administrateur/dashboard");
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  return (
    <div className="w-full h-[100vh] flex justify-center items-center ">
      <div className=" lg:w-[80%] lg:h-[80vh]  w-[90%] h-[90vh]  flex  rounded shadow-2xl shadow-gray-400 border-gray-600">
        <div className="w-[50%] bg-gray-300 p-10 flex justify-center items-center h-full">
          <div className="mb-30 h-fit">
            <img
              className="lg:w-50 w-30 mx-auto my-5"
              src="./logo.png"
              alt=""
            />
            <h1 className="lg:text-5xl text-xl uppercase text-center font-semibold">
              Ista Cité De L'air
            </h1>
            <h1 className="text-blue-500 lg:text-4xl text-xl lg:my-10 my-4 font-bold">
              Générer Les Emplois Du Temps
            </h1>
            <div className="flex  justify-center">
              <NavLink
                to={"/"}
                className={
                  " bg-blue-500 lg:py-3 py-2   px-10 rounded-md text-white"
                }
              >
                Login
              </NavLink>
            </div>
          </div>
        </div>
        <div className="w-[50%] flex justify-between items-center h-full ">
          <div className="lg:w-[65%] lg:mt-10  w-[80%] h-[90%] mx-auto p-5  rounded-xl  ">
            <h2 className="lg:text-5xl text-4xl font-bold text-center ">
              Register
            </h2>
            <form action="" className="mt-5">
              {errors && (
                <p className="text-red-500 text-center bg-red-200 p-2 rounded">
                  {errors}
                </p>
              )}
              <div className="lg:my-5">
                <label htmlFor="">Nom Complet</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter nom complet"
                  id="name"
                  className="w-full"
                />
              </div>
              <div className="lg:my-5">
                <label htmlFor="">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter e-mail"
                  id="email"
                  className="w-full"
                />
              </div>
              <div className="lg:my-5">
                <label htmlFor="">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  id="password"
                  className="w-full"
                />
              </div>
              <div className="lg:my-5">
                <label htmlFor="">Password Confirmation</label>
                <Input
                  type="password"
                  name="passwordConfirmation"
                  value={formData.passwordConfirmation}
                  onChange={handleChange}
                  placeholder="Enter your password confirmation"
                  id="passwordConfirmation"
                  className="w-full"
                />
              </div>
              <button
                onClick={handleRegister}
                className="text-center bg-blue-500 text-white lg:font-bold hover:cursor-pointer  shadow-2xl shadow-blue-200 px-5  text-xl rounded-full w-full my-5 lg:py-3 py-2  "
              >
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
