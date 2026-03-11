import React,{useState,useEffect} from "react"
import { FiMail } from "react-icons/fi";
import {useSelector} from "react-redux"
import type{RootState} from "../../reducer/store"
import { FaLongArrowAltRight } from "react-icons/fa";
import {useNavigate,Link} from "react-router-dom"
import {registerAPI} from "../../services/operations/authOps"
import Loading from "../Utils/Loading"
import {isValidEmail,isValidUsername,isValidPassword} from "../Utils/Validator"
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

const Register=()=>{
            const token=useSelector((state:RootState)=>state.auth.token);
         const [email,setEmail]=useState<string>("");
         const [password,setPassword]=useState<string>("");
         const [name,setName]=useState<string>("");
         const [isVisible,setIsVisible]=useState<boolean>(false);
         const [loading,setLoading]=useState<boolean>(false);
         const [errors,setErrors]=useState<{name?:string,email?:string,password?:string}>({});
         const navigate=useNavigate();


          const visibilityToggle = () => {
       setIsVisible((prev) => !prev);
          };


          useEffect(()=>{
                      if(token){
                        navigate("/chat");
                      }
                },[token,navigate]);
           const handleSubmit=async(e:React.FormEvent<HTMLElement>)=>{
              
                 e.preventDefault();
                 
  const newErrors: typeof errors = {};

  if (!name.trim()) {
    newErrors.name = "Username is required";
  } else if (!isValidUsername(name)) {
    newErrors.name = "Username must be 5-20 characters";
  }

  if (!email.trim()) {
    newErrors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    newErrors.email = "Enter a valid email address";
  }

  if (!password.trim()) {
    newErrors.password = "Password is required";
  } else if (!isValidPassword(password)) {
    newErrors.password = "Password must be atleast 8 characters";
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return; 
  }

  setErrors({});
 

                setLoading(true);
                try{      
                         
                     const result=await registerAPI({email,password,name},navigate);
                        
                           
                        
                         
                }
                catch(err){
                        console.log(err);
                }
                finally{
                        setLoading(false);
                }
           }
            if (loading) {
    return <Loading />;
  }
       return(
        <div className="w-screen h-screen bg-gray-800 flex justify-center items-center ">
                
                <div className="w-[98%] md:w-[60%] bg-gray-600 px-2 py-4 text-white  rounded-lg flex flex-col gap-y-3 items-center">
                        <div className="bg-blue-700  p-2 rounded-lg"> <FiMail size={40}  /> </div> 
                     <h1 className="text-[25px] ">Welcome to <span className="text-yellow-500 underline">RapidTalk</span></h1>
                      
                      <form onSubmit={handleSubmit} className="w-[80%] flex flex-col gap-y-3">
                         <div className="w-full flex flex-col  " >
                            <label className="text-[12px]">Username</label>
                          <input  type="text" className=" w-full text-center bg-gray-700 outline-none rounded-lg p-2" placeholder="Enter Username" onChange={(e)=>setName(e.target.value)}/>
                            {errors.name && (<span className="text-red-400 text-xs">{errors.name}</span>)}
                      </div>
                      <div className="w-full flex flex-col  " >
                            <label className="text-[12px]">Email Address</label>
                          <input  type="email" className=" w-full text-center bg-gray-700 outline-none rounded-lg p-2" placeholder="Enter your email address" onChange={(e)=>setEmail(e.target.value)}/>
                             {errors.email && (<span className="text-red-400 text-xs">{errors.email}</span>)}
                      </div>
                      <div className="w-full flex flex-col  " >
                            <label className="text-[12px]">Password</label>
                            <div className=" flex items-center pr-2 w-full bg-gray-700 rounded-lg">
                            <input  type={isVisible ? "text" : "password"} className=" w-full text-center bg-gray-700 outline-none rounded-lg p-2" placeholder="Enter your Password" onChange={(e)=>setPassword(e.target.value)}/>
                                                     <span className="text-gray-400" onClick={visibilityToggle}> {isVisible ? <FaEyeSlash size={30} /> : <FaRegEye size={30} />}</span>
                            </div>  
                      
                       {errors.password && (<span className="text-red-400 text-xs">{errors.password}</span>)}
                       </div>
                      <button className="w-full bg-blue-700 hover:bg-blue-500 p-2 rounded-lg justify-center flex items-center gap-x-3 " type="submit">Send Verification Code <FaLongArrowAltRight  size={30}/></button>
                     
                      </form>
                     <div>Already have an account? <Link className="text-blue-500 underline" to="/login">Login</Link></div>
                </div>
        </div>
       )
}
export default Register;