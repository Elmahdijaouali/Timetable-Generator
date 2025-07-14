import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
// import Dashboard from './components/Dashboard/dashboard'
import Login from "./Auth/Login";
import Layout from "./layouts/Layout";
import Salles from "./Dashboard/pages/Salle/Salles";
import Dashboard from "./Dashboard/dashboard";
import Register from "./Auth/Register";
import Profile from "./Dashboard/pages/profile/Profile";
import AjouterSalle from "./Dashboard/pages/Salle/AjouterSalle";
import HistoriqueEmploisDuTempsDesGroups from "./Dashboard/pages/HistoriqueEmploisDuTemps/HistoriqueEmploisDuTempsDesGroups";
import HistoriqueEmploisDuTempsDesFormateurs from "./Dashboard/pages/HistoriqueEmploisDuTemps/HistoriqueEmploisDuTempsDesFormateurs";
import HistoriqueEmploisDuTempsDesSalles from "./Dashboard/pages/HistoriqueEmploisDuTemps/HistoriqueEmploisDuTempsDesSalles";
import Parameter from "./Dashboard/pages/Parameter/Parameter";
import GroupesEnStage from "./Dashboard/pages/Parameter/GroupesEnStage";
import FormateursNoDisponbile from "./Dashboard/pages/Parameter/FormateursNoDisponbile";
import SallesNoDisponbile from "./Dashboard/pages/Parameter/SallesNoDisponbile";
import PersenaliserLesNombresHeuresParSemaineDeGroupe from "./Dashboard/pages/Parameter/PersenaliserLesNombresHeuresParSemaineDeGroupe";
import ListeDesEmploisDuTempsActifDesGroupes from "./Dashboard/pages/EmploisDesTempsActif/ListeDesEmploisDuTempsActifDesGroupes";
import ListeDesEmploisDuTempsActifDesFormateur from "./Dashboard/pages/EmploisDesTempsActif/ListeDesEmploisDuTempsActifDesFormateur";
import ListeDesEmploisDuTempsActifDesSalles from "./Dashboard/pages/EmploisDesTempsActif/ListeDesEmploisDuTempsActifDesSalles";
import AfficherEmploiDuTempsDeGroupe from "./Dashboard/pages/AfficherEmploiDuTemps/AfficherEmploiDuTempsDeGroupe";
import AfficherEmploiDuTempsDeFormateur from "./Dashboard/pages/AfficherEmploiDuTemps/AfficherEmploiDuTempsDeFormateur";
import AfficherEmploiDuTempsDeSalle from "./Dashboard/pages/AfficherEmploiDuTemps/AfficherEmploiDuTempsDeSalle";
import GenererEmploisDuTemps from "./Dashboard/pages/GenererEmploisDuTemps/GenererEmploisDuTemps";
import PresonaliserEmploiDuTemps from "./Dashboard/pages/GenererEmploisDuTemps/PresonaliserEmlpoiDuTemps";
import ListeDesEmploisDuTemps from "./Dashboard/pages/GenererEmploisDuTemps/ListeDesEmploisDuTemps";
import ListeEmploisDuTempsEnAnnee from "./Dashboard/pages/Parameter/ListeEmploisDuTempsEnAnnee";
import AfficherEmploiDuTempsDeFormateurEnAnnee from "./Dashboard/pages/Parameter/AfficherEmploiDuTempsDeFormateurEnAnnee";
import ListeDesGroupesPourPersenaliserLesNombresHeuresParSemaine from "./Dashboard/pages/Parameter/ListeDesGroupesPourPersenaliserLesNombresHeuresParSemaine";
import ListeDesFuision from "./Dashboard/pages/Parameter/ListeDesFuision";
import PersenaliserLesNombresHeuresParSemaineDeFuision from "./Dashboard/pages/Parameter/PersenaliserLesNombresHeuresParSemaineDeFuision";
import { useEffect, useState } from "react";
import AfficherEmploiDuTempsHistoriqueDeGroupe from "./Dashboard/pages/HistoriqueEmploisDuTemps/AfficherEmploiDuTempsHistoriqueDeGroupe";

function App() {
  const [ isAuth , setIsAuth ] = useState(false)


 

  useEffect(() => {
    const token = localStorage.getItem('token')
    if(token){
      setIsAuth(true)
    }else{
      setIsAuth(false)
      
    }
  } )
  // console.log('token ,', localStorage.getItem('token') )
  
  return (

    <BrowserRouter>
      <Routes>
        {
          isAuth ?
          <Route path="/" element={<Layout/>} >
            <Route index element={<Dashboard/>} />
          </Route>:
          <Route path="/" element={<Login />} />

        }
        
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="administrateur" element={<Layout />}>
          <Route  path="dashboard"  >
             <Route index element={<Dashboard/>} />
             <Route path="emplois-du-temps-actif" >
                <Route path="groupes" element={<ListeDesEmploisDuTempsActifDesGroupes/>}/>
                <Route path="formateurs" element={<ListeDesEmploisDuTempsActifDesFormateur/>}/>
                <Route path="salles" element={<ListeDesEmploisDuTempsActifDesSalles />} />
             </Route>
          </Route>
          <Route path="afficher">
             <Route path="afficher-emploi-du-temps-de-groupe/:timetableId" element={<AfficherEmploiDuTempsDeGroupe />}/>
             <Route path="afficher-emploi-du-temps-de-formateur/:mleFormateur"  element={<AfficherEmploiDuTempsDeFormateur/>}/>
             <Route path="afficher-emploi-du-temps-de-salle/:salleId" element={<AfficherEmploiDuTempsDeSalle/>} />
          </Route>

          <Route path="salles" element={<Salles />} />
          <Route path="ajouter-salle" element={<AjouterSalle />} />
          <Route path="generer-emplois-du-temps"  >
               <Route index element={<GenererEmploisDuTemps />} />
               <Route path="presonaliser-emploi-du-temps/:timetableId" element={<PresonaliserEmploiDuTemps/>} />
               <Route path="liste-des-emplois-du-temps" element={<ListeDesEmploisDuTemps/>}/>
          </Route>
          <Route path="historique-emplois-du-temps-des-groups" element={<HistoriqueEmploisDuTempsDesGroups/>} />
           <Route path="historique-emplois-du-temps-des-groups/:timetableId" element={<AfficherEmploiDuTempsHistoriqueDeGroupe/>} />
          <Route path="historique-emplois-du-temps-des-formateurs" element={<HistoriqueEmploisDuTempsDesFormateurs/>} />
          <Route path="historique-emplois-du-temps-des-salles" element={<HistoriqueEmploisDuTempsDesSalles/>} />
          <Route  path="parameters">
              <Route index element={<Parameter />}/>
              <Route path="groupes-en-stage" element={<GroupesEnStage />} />
              <Route path="formateurs-no-disponible" element={<FormateursNoDisponbile />} />
              <Route path="salles-no-disponible" element={<SallesNoDisponbile/> } />
              <Route path="persenaliser-les-nomber-d-heures/:groupeId" element={<PersenaliserLesNombresHeuresParSemaineDeGroupe />} />
              <Route path="liste-des-groupes-pour-persenaliser-nombers-heures-par-semaine" element={<ListeDesGroupesPourPersenaliserLesNombresHeuresParSemaine />}/>
              <Route path="liste-emplois-du-temps-en-annee" element={<ListeEmploisDuTempsEnAnnee />} />
              <Route path="afficher-emploi-du-temps-de-formateur-en-annee/:mle_formateur" element={<AfficherEmploiDuTempsDeFormateurEnAnnee/>} />
              <Route path="liste-des-groupes-pour-persenaliser-nombers-heures-par-semaine-par-fuision" element={<ListeDesFuision />}/>
              <Route path="persenaliser-les-nomber-d-heures-de-fuision/:fuisionId" element={<PersenaliserLesNombresHeuresParSemaineDeFuision />} />
              {/* <Route path="modules-actif-par-fuision/:fuisionId" element={<ModulesActifParFuision />} /> */}
          </Route>
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
