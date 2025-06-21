import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import api from "../../../api/apiConfig";
import { handleNotification } from "../../../utils/notification";
import { useNavigate } from "react-router-dom";

interface Administrator {
  name: string;
  email: string;
}

export default function Profile() {
  const [administrateur, setAdministrateur] = useState<Administrator>({
    name: "",
    email: "",
  });

  const navigate = useNavigate();
  const [formModifierPassword, setFormModifierPassword] = useState({
    password: "",
    newPassword: "",
    confiremationPassword: "",
  });

  const [errorsInFormModifierPassword, setErrorsInFormModifierPassword] =
    useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAdministrateur({
      ...administrateur,
      [e.target.name]: value,
    });
  };
  const [messageSucess, setMessageSuccess] = useState("");

  const handleChangeInFormModifierPassword = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormModifierPassword({
      ...formModifierPassword,
      [e.target.name]: value,
    });
  };

  const handleUpdateInfoAdministrateur = async () => {
    try {
      const res = await api.patch("/update-info-administrator", administrateur);
      if (res && res.data && res.data.administrator) {
        localStorage.setItem(
          "administrator",
          JSON.stringify(res.data.administrator)
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdatePasswordAdministrateur = async () => {
    try {
      const res = await api.patch("/update-password", {
        ...formModifierPassword,
        email: administrateur.email,
      });
      if (res && res.data && res.data.message) {
        setErrorsInFormModifierPassword("");
        setMessageSuccess(res.data.message);

        handleNotification("Update password", "updated password successfuly !");
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        setMessageSuccess("");
        setErrorsInFormModifierPassword(err.response.data.errors);
      }
      console.log(err);
    } finally {
      setFormModifierPassword({
        password: "",
        newPassword: "",
        confiremationPassword: "",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await api.delete(`/delete-account/${administrateur.email}`);
      if (res && res.data && res.data.message) {
        console.log("log", res.data.message);
        localStorage.removeItem("token");
        localStorage.removeItem("administrator");
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const administrateurInfo = localStorage.getItem("administrator");
    if (administrateurInfo) {
      setAdministrateur(JSON.parse(administrateurInfo));
    }
  }, [localStorage.getItem("administrator")]);

  return (
    <div className="lg:w-[70%]  w-[90%] mx-auto lg:my-10 my-5 lg:p-10 p-3 ">
      <h1 className="lg:text-3xl text-xl font-bold my-2 text-blue-500">
        Profile
      </h1>
      <div className="w-full lg:h-[25vh] bg-gray-100 rounded-lg lg:py-5 p-5 lg:px-10">
        <h2 className=" text-xl lg:mb-5 font-bold text-gray-700">
          Les Information{" "}
        </h2>
        <img
          src="/./images/avatar.jpg"
          className="lg:w-[100px] w-[70px] h-[70px] lg:h-[100px] bg-gray-500 rounded-full"
          alt=""
        />
        <div className="lg:mt-3">
          <h1 className="text-gray-600 lg:font-bold">{administrateur?.name}</h1>
          <h3 className="text-gray-600 lg:font-bold">
            {administrateur?.email}
          </h3>
        </div>
      </div>
      <div className="w-full lg:h-[35vh] my-5 bg-gray-100 rounded-lg lg:py-10 p-5 lg:px-10">
        <h2 className=" text-xl lg:mb-5 font-bold text-gray-700">
          Modify les Information{" "}
        </h2>

        <div className="lg:my-5">
          <label htmlFor="">Nom et prénom </label>
          <Input
            placeholder="Enter le nom et prénom"
            value={administrateur.name}
            onChange={handleChange}
            name="name"
          />
        </div>
        <div className="lg:my-5">
          <label htmlFor="">Email </label>
          <Input
            placeholder="Enter e-mail"
            value={administrateur.email}
            onChange={handleChange}
            name="email"
          />
        </div>

        <Button
          onClick={handleUpdateInfoAdministrateur}
          label="Modilfy"
          className="bg-blue-500 text-white px-4"
        />
      </div>
      <div className="w-full lg:h-fit my-5 bg-gray-100 rounded-lg lg:py-10 p-5 lg:px-10">
        <h2 className=" text-xl lg:mb-5 font-bold text-gray-700">
          Modify password{" "}
        </h2>
        <div>
          {errorsInFormModifierPassword && (
            <p className="text-red-500 bg-red-200 p-2 rounded text-center ">
              {errorsInFormModifierPassword}
            </p>
          )}
          {messageSucess && (
            <p className="text-green-500 bg-green-200 p-2 rounded text-center ">
              {messageSucess}
            </p>
          )}
        </div>
        <div className="lg:my-5">
          <label htmlFor="">Password </label>
          <Input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formModifierPassword.password}
            onChange={handleChangeInFormModifierPassword}
          />
        </div>
        <div className="lg:my-5">
          <label htmlFor="">New Password </label>
          <Input
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={formModifierPassword.newPassword}
            onChange={handleChangeInFormModifierPassword}
          />
        </div>
        <div className="lg:my-5">
          <label htmlFor="">Password Confirmation </label>
          <Input
            type="password"
            name="confiremationPassword"
            placeholder="Enter password confirmation"
            value={formModifierPassword.confiremationPassword}
            onChange={handleChangeInFormModifierPassword}
          />
        </div>

        <Button
          label="Modilfy"
          onClick={handleUpdatePasswordAdministrateur}
          className="bg-blue-500 text-white px-4"
        />
      </div>
      <div className="w-full  my-5 bg-gray-100 rounded-lg lg:py-10 p-5 lg:px-10">
        <h1 className=" text-xl lg:mb-5 font-bold text-gray-700">
          Destroy account
        </h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore magni
          est obcaecati possimus eligendi, ducimus laborum iure minima
          reprehenderit totam?
        </p>
        <Button
          onClick={handleDeleteAccount}
          className="bg-red-500 mt-5"
          label="Delete account"
        />
      </div>
    </div>
  );
}
