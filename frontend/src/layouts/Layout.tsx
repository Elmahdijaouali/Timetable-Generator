import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faGears,
  faGauge,
  faWandMagicSparkles ,
  faHouseUser,
  faClockRotateLeft,
  faCalendarDays ,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function Layout() {
  
  const [displayDropdown , setDisplayDropdown ] = useState(false)

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('administrator')
    navigate("/");
  };

  const handleStyleLink = ({ isActive }: { isActive: boolean }) => {
    if (isActive) {
      return ' block lg:text-xl lg:my-2 my-1 bg-gray-100  text-blue-500 hover:cursor-pointer p-2.5 rounded-xl'
    }
    return (`text-white block lg:text-xl lg:my-2 my-1  hover:bg-gray-100 hover:text-blue-500 hover:cursor-pointer p-2.5 rounded-xl ` );
  };

  return (
    <div className={"w-full  h-[100vh] flex "}>
      <section className="lg:w-[18%] flex-col  lg:p-5 p-2 lg:rounded-r-[3em] rounded-r-[1em] w-[25%] shadow-2xl shadow-blue-900 h-full bg-blue-500">
        <div className="h-[88%]">
            <h1 className="lg:text-3xl my-5 font-bold uppercase text-center text-white">
              Ista cité de l'air
            </h1>
            <hr className="text-white" />
            <ul className="my-5">
              <NavLink to={"/administrateur/dashboard"} className={handleStyleLink}>
                <FontAwesomeIcon className="mr-2" icon={faGauge} />
                Tableau de bord
              </NavLink>
    
              <NavLink to={"/administrateur/salles"} className={handleStyleLink}>
                <FontAwesomeIcon className="mr-2" icon={faHouseUser} />
                 Salles
              </NavLink>
    
             
              <div>
               
                 <div className=" flex justify-between items-center text-white  lg:text-xl lg:my-2 my-1  hover:bg-gray-100 hover:text-blue-500 hover:cursor-pointer p-2.5 rounded-xl" onClick={() => setDisplayDropdown(!displayDropdown)}>
                    <div>
                       <FontAwesomeIcon className="mr-2" icon={faClockRotateLeft} />
                       Historique des emlpois
                    </div>
                    
                    <FontAwesomeIcon icon={faChevronDown} />
                 </div>
                
                 {
                  displayDropdown &&
                  <div className="pl-5">
                    <NavLink to={"/administrateur/historique-emplois-du-temps-des-groups"} className={({isActive}) =>isActive ? " block lg:my-2 my-1  bg-gray-100 text-blue-500 hover:cursor-pointer p-2 rounded-xl" : "text-white block lg:my-2 my-1  hover:bg-gray-100 hover:text-blue-500 hover:cursor-pointer p-2 rounded-xl"} >
                      <FontAwesomeIcon className="mr-2" icon={faCalendarDays} />
                       Emlpois du temps des groups
                    </NavLink>
                    {/* <NavLink to={"/administrateur/historique-emplois-du-temps-des-formateurs"}  className={({isActive}) =>isActive ? " block lg:my-2 my-1  bg-gray-100 text-blue-500 hover:cursor-pointer p-2 rounded-xl" : "text-white block lg:my-2 my-1  hover:bg-gray-100 hover:text-blue-500 hover:cursor-pointer p-2 rounded-xl"}  >
                      <FontAwesomeIcon className="mr-2" icon={faCalendarDays} />
                      Emlpois du temps des formateurs
                    </NavLink>
                    <NavLink to={"/administrateur/historique-emplois-du-temps-des-salles"}  className={({isActive}) =>isActive ? " block lg:my-2 my-1  bg-gray-100 text-blue-500 hover:cursor-pointer p-2 rounded-xl" : "text-white block lg:my-2 my-1  hover:bg-gray-100 hover:text-blue-500 hover:cursor-pointer p-2 rounded-xl"}  >
                      <FontAwesomeIcon className="mr-2" icon={faCalendarDays} />
                      Emlpois du temps des salles
                    </NavLink> */}
                    
                 </div>
                 }
              </div>
             
              <NavLink to={"/administrateur/generer-emplois-du-temps"} className={handleStyleLink}>
                 <FontAwesomeIcon className="mr-2"  icon={faWandMagicSparkles} />
                 Générer des emlpois
              </NavLink>
    
              <NavLink
                to={"/administrateur/parameters"}
                className={handleStyleLink}
              >
                <FontAwesomeIcon className="mr-2" icon={faGears} />
                Prameters
              </NavLink>
            </ul>
        </div>

        <ul className=" h-[12%] ">
          <li
            className="text-white px-8 lg:text-2xl w-fit bg-red-400 hover:bg-red-600 hover:text-gray-100 hover:cursor-pointer p-2.5 rounded-xl"
            onClick={handleLogout}
          >
           <FontAwesomeIcon icon={faRightFromBracket} />
           <span className="ml-3">Déconnecter</span> 
          </li>
        </ul>
      </section>
      <div className="lg:w-[82%] w-full">
        <header className="w-[96%] shadow-xl mx-auto my-3 p-1 flex items-center justify-between rounded-full bg-blue-500">
          <img src="/logo.png" className="lg:w-[65px] w-[55px]" alt="logo" />

          <Link to={"/administrateur/profile"}>
            <div className=" lg:w-[60px] lg:h-[60px] p-1 w-[50px] h-[50px] mr-2 bg-sky-900 rounded-full ">
               <img src="/./images/avatar.jpg" className="w-full h-full mr-2 bg-amber-50 rounded-full" alt="avatar" />
            </div>
          </Link>
        </header>
        
        <main className=" overflow-y-scroll lg:h-[87vh] h-[80vh]">
          <Outlet />
        </main>
      </div>

  
    </div>
  );
}
