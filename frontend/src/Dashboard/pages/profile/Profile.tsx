import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import api from "../../../api/apiConfig";
import { handleNotification } from "../../../utils/notification";
import { useNavigate } from "react-router-dom";
import SectionCard from '../../../components/SectionCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faLock, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Administrator {
  name: string;
  email: string;
  id?: number;
  profileImage?: string;
  dashboardBackground?: string;
}

export default function Profile() {
  const [administrateur, setAdministrateur] = useState<Administrator>({
    name: "",
    email: "",
    id: undefined,
    profileImage: undefined,
    dashboardBackground: undefined,
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
        handleNotification("Profil mis à jour", "Vos informations ont été mises à jour avec succès !");
      }
    } catch (err) {
      handleNotification("Erreur", "Impossible de mettre à jour le profil.");
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
        setMessageSuccess("Mot de passe modifié avec succès !");
        handleNotification("Mot de passe modifié", "Votre mot de passe a été modifié avec succès !");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: string } } };
      if (error.response && error.response.data && error.response.data.errors) {
        setMessageSuccess("");
        setErrorsInFormModifierPassword(error.response.data.errors);
      }
      handleNotification("Erreur", "Impossible de modifier le mot de passe.");
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
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;
    try {
      const res = await api.delete(`/delete-account/${administrateur.email}`);
      if (res && res.data && res.data.message) {
        localStorage.removeItem("token");
        localStorage.removeItem("administrator");
        handleNotification("Compte supprimé", "Votre compte a été supprimé avec succès.");
        navigate("/login");
      }
    } catch (err) {
      handleNotification("Erreur", "Impossible de supprimer le compte.");
      console.log(err);
    }
  };

  useEffect(() => {
    const administrateurInfo = localStorage.getItem("administrator");
    if (administrateurInfo) {
      const admin = JSON.parse(administrateurInfo);
      setAdministrateur(admin);
    }
  }, [localStorage.getItem("administrator")]);

  return (
    <div className="lg:w-[70%] w-[90%] mx-auto lg:my-10 my-5 lg:p-10 p-3 bg-gray-50 min-h-screen">
      <h1 className="lg:text-3xl text-xl font-bold my-2 text-blue-500">Mon Profil</h1>
      <SectionCard
        icon={faUser}
        title="Informations personnelles"
        description="Voici vos informations personnelles enregistrées."
      >
        <div className="flex items-center gap-6">
          <img
            src="/./images/avatar.jpg"
            className="lg:w-[100px] w-[70px] h-[70px] lg:h-[100px] bg-gray-500 rounded-full border-4 border-blue-200 shadow"
            alt="Avatar administrateur"
          />
          <div className="lg:mt-3">
            <h1 className="text-gray-700 text-xl font-bold">{administrateur?.name}</h1>
            <h3 className="text-gray-500 text-lg font-semibold">{administrateur?.email}</h3>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={faEdit}
        title="Modifier mes informations"
        description="Mettez à jour votre nom ou votre adresse e-mail."
      >
        <div className="lg:my-5">
          <label htmlFor="profile-name" className="text-gray-700 font-medium">Nom et prénom</label>
          <Input
            type="text"
            id="profile-name"
            className=""
            placeholder="Entrez votre nom et prénom"
            value={administrateur.name}
            onChange={handleChange}
            name="name"
          />
        </div>
        <div className="lg:my-5">
          <label htmlFor="profile-email" className="text-gray-700 font-medium">Email</label>
          <Input
            type="email"
            id="profile-email"
            className=""
            placeholder="Entrez votre e-mail"
            value={administrateur.email}
            onChange={handleChange}
            name="email"
          />
        </div>
        <Button
          onClick={handleUpdateInfoAdministrateur}
          label="Enregistrer les modifications"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow mt-4"
        />
      </SectionCard>

      <SectionCard
        icon={faLock}
        title="Modifier le mot de passe"
        description="Changez votre mot de passe pour plus de sécurité."
      >
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
          <label htmlFor="profile-password">Mot de passe actuel</label>
          <Input
            type="password"
            id="profile-password"
            className=""
            name="password"
            placeholder="Entrez votre mot de passe actuel"
            value={formModifierPassword.password}
            onChange={handleChangeInFormModifierPassword}
          />
        </div>
        <div className="lg:my-5">
          <label htmlFor="profile-new-password">Nouveau mot de passe</label>
          <Input
            type="password"
            id="profile-new-password"
            className=""
            name="newPassword"
            placeholder="Entrez le nouveau mot de passe"
            value={formModifierPassword.newPassword}
            onChange={handleChangeInFormModifierPassword}
          />
        </div>
        <div className="lg:my-5">
          <label htmlFor="profile-confirm-password">Confirmation du nouveau mot de passe</label>
          <Input
            type="password"
            id="profile-confirm-password"
            className=""
            name="confiremationPassword"
            placeholder="Confirmez le nouveau mot de passe"
            value={formModifierPassword.confiremationPassword}
            onChange={handleChangeInFormModifierPassword}
          />
        </div>
        <Button
          label="Enregistrer le nouveau mot de passe"
          onClick={handleUpdatePasswordAdministrateur}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow mt-4"
        />
      </SectionCard>

      <SectionCard
        icon={faTrash}
        title="Supprimer mon compte"
        description="Attention : Cette action est irréversible. Toutes vos données seront supprimées définitivement."
      >
        <Button
          onClick={handleDeleteAccount}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow mt-4"
          label="Supprimer mon compte"
        />
      </SectionCard>
    </div>
  );
}
