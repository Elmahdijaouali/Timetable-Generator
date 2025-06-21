import {  useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import Input from "../components/Input"
import api from "../api/apiConfig"



export default function Login() {
  const [formData , setFormData] = useState({
    email : "" , 
    password : ''
  })
  
  const [errors , setErrors ]= useState('')

  const navigate = useNavigate()

  const handleChange = (e :  React.ChangeEvent<HTMLInputElement> ) => {
      setFormData({...formData , [e.target.name] : e.target.value })
      setErrors('')
  }
  
  const handleLogin = async (e : React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
     try{
       
       
        const res = await api.post('/login' , formData)

        if(res && res.data && res.data.token){
          localStorage.setItem('token' , res.data.token )
          localStorage.setItem('administrator' , JSON.stringify(res.data.administrator))
          navigate('/administrateur/dashboard')
        }

     }catch(err: any){
        console.log('Error', err)
        if(err.response && err.response.data && err.response.data.errors){
          setErrors(err.response.data.errors)
      }
     }
  }

  // useEffect(() => {
  //     const token = localStorage.getItem('token')
  //    if(token){
  //     navigate('/administrateur/dashboard')
  //    }
  // } , [])
  
  return (
    <div className="w-full h-[100vh] flex justify-center items-center ">
        <div className=" lg:w-[80%] lg:h-[80vh] flex  w-[90%] h-[90vh] rounded shadow-2xl shadow-gray-400 border-gray-600">
           <div className="w-[50%] bg-gray-300 p-10 flex justify-center items-center h-full">
             <div className="mb-30 h-fit">
               <img className="lg:w-50 w-30 mx-auto my-5" src="./logo.png" alt="" />
               <h1 className="lg:text-5xl text-xl uppercase text-center font-semibold">Ista Cité De L'air</h1>
               <h1 className="text-blue-500 lg:text-4xl text-xl lg:mt-8 mt-4 font-bold">Générer Les Emplois Du Temps</h1>
              <p className="text-center mt-5 mb-10 font-semibold">Bienvenue ! Veuillez vous connecter pour continuer.</p>
               <div className="flex justify-center">
                 <NavLink to={'/register'} className={" bg-blue-500 lg:py-3  py-2  px-10 rounded-md text-white"} >
                    Register
                 </NavLink>
               </div>
             </div>
           </div>
           <div  className="w-[50%] flex justify-between items-center h-full ">
                <div className="lg:w-[65%] w-[90%] mx-auto p-5  rounded-xl lg:h-[60%] ">
                    <h2 className="lg:text-5xl text-4xl font-bold text-center ">Login</h2>
                    <form action="" className="mt-5">
                        {
                          errors &&
                          <p className="text-red-500 text-center bg-red-200 p-2 rounded">{errors}</p>
                        }
                        <div className="lg:my-5">
                            <label htmlFor="">Email</label>
                            <Input type="email" name="email" value={formData.email} onChange={handleChange}  placeholder="Enter your Email" id="email" className="w-full" />
                        </div>
                        <div  className="lg:my-5">
                            <label htmlFor="">Password</label>
                            <Input type="password"  name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" id="password" className="w-full" />
                        </div>
                        <button onClick={handleLogin} className="text-center bg-blue-500 text-white lg:font-bold hover:cursor-pointer  shadow-2xl shadow-blue-200 px-5  text-xl rounded-full w-full my-5 lg:py-3 py-2  ">Login</button>
                    </form>
                   
                </div>
           </div>
        </div>
    </div>
  )
}
