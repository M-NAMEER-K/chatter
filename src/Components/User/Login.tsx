import React,{useState,useEffect} from "react"

import {useSelector,useDispatch} from "react-redux"
import type{RootState,AppDispatch} from "../../reducer/store"
import {useNavigate,Link} from "react-router-dom"
import {loginAPI} from "../../services/operations/authOps"
import Loading from "../Utils/Loading"
import {isValidEmail,isValidPassword} from "../Utils/Validator"
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";



const Login=()=>{
          const token=useSelector((state:RootState)=>state.auth.token);
         const [email,setEmail]=useState<string>("");
         const [password,setPassword]=useState<string>("");
          const [isVisible,setIsVisible]=useState<boolean>(false);
          const[errors,setErrors]=useState<{email?:string,password?:string}>({});
         const [loading,setLoading]=useState<boolean>(false);
         const navigate=useNavigate();
         const dispatch = useDispatch<AppDispatch>();
        
         useEffect(()=>{
                      if(token){
                         navigate("/chat", { replace: true });
                      }
                },[token,navigate]); 

                  const visibilityToggle = () => {
       setIsVisible((prev) => !prev);
          };
           const handleSubmit=async(e:React.FormEvent<HTMLElement>)=>{
            

                 e.preventDefault();
                                  
                   const newErrors: typeof errors = {};
                 
                 
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
                         
                        await loginAPI({email,password},navigate,dispatch);
                        
                          
                        
                         
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
                
                <div className=" w-[98%] md:w-[40%] bg-gray-600 px-2 py-4 text-white  rounded-lg flex flex-col gap-y-3 items-center">
                      
                      <h1 className="text-[25px] ">Welcome to <span className="text-yellow-500 underline">RapidTalk</span></h1>
                     
                      <form onSubmit={handleSubmit} className="w-[80%] flex flex-col gap-y-3">
                       
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
                      <button className="w-full bg-blue-700 hover:bg-blue-500 p-2 rounded-lg justify-center flex items-center gap-x-3 " type="submit">Login </button>
                     
                      </form>
                      <div>
                             <Link  className="text-blue-500 underline" to="/forgotPassword">forgot Password?</Link>
                     <div>Don't have an account? <Link className="text-blue-500 underline" to="/register">Register</Link></div>
                      </div>
                   
                </div>
        </div>
       )
}
export default Login;