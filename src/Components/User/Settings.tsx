import {useState} from "react"
import {useSelector,useDispatch} from "react-redux"
import {changeUsernameAPI,changePasswordAPI} from "../../services/operations/authOps"
import {useNavigate} from "react-router-dom"
import { type RootState } from "../../reducer/store";
import { isValidUsername, isValidPassword } from "../Utils/Validator";
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
const Settings=()=>{
    const userId:string|undefined = useSelector((state: RootState) => state.auth.user?._id);
    if(!userId){
         return null;
    }
       const navigate=useNavigate();
       const dispatch=useDispatch();
       const [userName,setUsername]=useState<string>("");
       const [password,setPassword]=useState<string>("");
       const [isVisible,setIsVisible]=useState<boolean>(false);
       const [errors, setErrors] = useState<{username?: string;password?: string; }>({});

       


       const visibilityToggle = () => {
       setIsVisible((prev) => !prev);
          };
       const handleUsernameSubmit = (e: React.FormEvent) => {
       e.preventDefault();

    const newErrors: typeof errors = {};

    if (!userName.trim()) {
      newErrors.username = "Username is required";
    } else if (!isValidUsername(userName)) {
      newErrors.username = "Username must be 5–20 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    changeUsernameAPI(userId,userName);
    setUsername("");

  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     const newErrors: typeof errors = {};

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (!isValidPassword(password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    changePasswordAPI( userId,password,navigate,dispatch);
    setPassword("");
  };

    return(
        <div className="h-screen w-screen bg-gray-700 text-white p-5">
                 
                 <div className="w-full text-xl ">Edit your Details</div>
                 <div className="w-full flex flex-col my-5 gap-y-5">
                    <form onSubmit={handleUsernameSubmit} className="md:w-[70%] bg-gray-500 rounded-lg flex  flex-col gap-y-2 p-2">
                        <label className="text-yellow-500 font-medium">Change Username</label>
                        
                           <input type="text" placeholder="Enter new Username" value={userName} onChange={(e) => setUsername(e.target.value)} className="bg-gray-700 md:w-[70%] p-2 rounded-lg outline-none"/>
                             {errors.username && ( <span className="text-red-400 text-xs">{errors.username}</span>)}
                         <button className="p-2 md:w-[20%] rounded-full mx-5 bg-yellow-500 hover:bg-yellow-300 " type="submit">Change</button>
                        
                        
                    </form>
                    <form onSubmit={handlePasswordSubmit} className="md:w-[70%] bg-gray-500 rounded-lg flex flex-col gap-y-2 p-2">
                        <label className="text-yellow-500 font-medium">Change Password</label>
                        <div className=" flex items-center md:w-[70%] bg-gray-700 rounded-lg px-2">
                            <input type={isVisible ? "text" : "password"}  placeholder="Enter new Password"   value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-700 w-full p-2 rounded-lg outline-none"/>
                           <span className="text-gray-400" onClick={visibilityToggle}> {isVisible ? <FaEyeSlash size={30} /> : <FaRegEye size={30} />}</span>

                        </div>
                                                  {errors.password && ( <span className="text-red-400 text-xs">{errors.password}</span>)}
                       
                         
                         <button className="p-2 md:w-[20%] rounded-full mx-5 bg-yellow-500 hover:bg-yellow-300 " type="submit">Change</button>
                        
                    </form>
                 </div>
        </div>
    )
}

export default Settings;