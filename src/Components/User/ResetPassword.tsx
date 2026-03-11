import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {ResetPasswordAPI} from "../../services/operations/authOps"
import {isValidPassword} from "../Utils/Validator"
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
 

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const[errors,setErrors]=useState<{password?:string}>({});
  const [isVisible,setIsVisible]=useState<boolean>(false);
  const visibilityToggle = () => {
       setIsVisible((prev) => !prev);
          };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     const newErrors: typeof errors = {};
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
         const result=await ResetPasswordAPI(token,password,navigate);
    
  };

  return (
      <div className="w-screen h-screen bg-gray-700 text-white flex justify-center">
        <div className="w-[70%] mt-5">
               <div className="text-xl my-5">Reset Your Password</div>
              <form onSubmit={handleSubmit} className=" bg-gray-500 flex flex-col gap-y-3 p-2 rounded-lg">
                <div className="w-[70%]  flex items-center rounded-lg bg-gray-700 pr-2"> 
                     <input className="outline-none bg-gray-700 rounded-lg w-full p-2"
        type={isVisible ? "text" : "password"}
        placeholder="New Password"
        onChange={(e) => setPassword(e.target.value)}
      />
     <span className="text-gray-400" onClick={visibilityToggle}> {isVisible ? <FaEyeSlash size={30} /> : <FaRegEye size={30} />}</span>
                </div>
     
      {errors.password && (<span className="text-red-400 text-xs">{errors.password}</span>)}
      <button className="w-[20%] rounded-full bg-yellow-500 hover:bg-yellow-300 p-2" type="submit">Reset Password</button>
    </form>
        </div>
          
      </div>
   
  );
};

export default ResetPassword;
