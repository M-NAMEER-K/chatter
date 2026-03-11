import {useState,useEffect,useRef} from "react"
import { GoLock } from "react-icons/go";
import { FaLongArrowAltRight } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import Cookies from "js-cookie"
import {useSelector} from "react-redux"
import type{RootState} from "../../reducer/store"
import {useSearchParams,Link,useNavigate} from "react-router-dom"
import {resendOtpAPI,verifyAPI} from "../../services/operations/authOps"
import Loading from "../Utils/Loading"


const Verify=()=>{
     const token=useSelector((state:RootState)=>state.auth.token);
  const [searchParams] = useSearchParams();
const email:string = searchParams.get("email")||"";
     
        const navigate=useNavigate();
       const [loading,setLoading]=useState<boolean>(false);
       const [otp,setOtp]=useState<string[]>(["","","","","",""]);
       const [error,setError]=useState<string>("");
       const [resendLoading,setResendLoading]=useState<boolean>(false);
       const inputRefs=useRef<Array<HTMLInputElement|null>>([]);
       const [timer,setTimer]=useState(60);
        
       useEffect(() => {
  if (!email) {
    navigate("/register");
  }
}, [email, navigate]);
        useEffect(()=>{
                      if(token){
                        navigate("/chat");
                      }
                },[token,navigate]);
                
          useEffect(()=>{
                if(timer>0){
                      const interval=setInterval(()=>{
                          setTimer((prev)=>prev-1);
                      },1000);
                      return ()=>clearInterval(interval);
                }
          },[timer]);

          const handleInputChange=(index:number,value:string)=>{
            if(value.length>1) return;

            const newOtp=[...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            setError("");
           
            if(value && index<5){
               inputRefs.current[index+1]?.focus();  
            }
          }
      const handleKeyDown=(index:number , e:React.KeyboardEvent<HTMLElement>):void=>{
                 if(e.key==="Backspace" && !otp[index] && index>0){
                     inputRefs.current[index-1]?.focus();
                 }
      }
      const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
                 e.preventDefault();
                 const otpString=otp.join("");
                 if(otpString.length!==6){
                    setError("Please Enter all 6 digits");
                    return;
                 }
                   setError("");
                   setLoading(true);
                   try{
                const result=await verifyAPI({email,otp:otpString},navigate);
                   
                  /*Cookies.set("token",result.token,{
                    expires:15,
                    secure:false,
                    path:"/"
                  });*/
                  setOtp(["","","","","",""]);
                  inputRefs.current[0]?.focus();
                   }
                   catch(error:any){
                         setError(error.response.data.message);
}finally{
   setLoading(false);
}
            
}
const handleResendOtp=async()=>{
      setResendLoading(true);
      setError("");
      try{
            await resendOtpAPI({email});
                    
      setTimer(60);
      }
     catch(error:any){
                         setError(error.response.data.message);
} 
    finally{
         setResendLoading(false);
    }         
}
      const handlePaste=(e:React.ClipboardEvent<HTMLInputElement>):void=>{
            e.preventDefault();
            const pastedData=e.clipboardData.getData("text");
            const digits=pastedData.replace(/\D/g,"").slice(0,6);
            if(digits.length===6){
                const newOtp=digits.split("");
                setOtp(newOtp);
                inputRefs.current[5]?.focus();
            }
      }
     
       if (loading) {
    return <Loading />;
  }
    return(
          <div className="w-screen h-screen bg-gray-800 flex justify-center items-center ">
                        
                        <div className=" w-[98%] md:w-[60%] bg-gray-600 px-2 py-4  text-white  rounded-lg flex flex-col gap-y-3 items-center">
                                <Link className="w-full flex justify-left " to="/register"><IoIosArrowBack className="bg-blue-700 p-1 rounded-lg" size={30}/></Link>
                                <div className="bg-blue-700  p-2 rounded-lg"> <GoLock size={40}/> </div> 
                             <h1 className="text-[25px] ">Verify Your Email</h1>
                              <div ><div>We have sent a 6-digit code to  </div><div className="text-blue-400">{email}</div></div>
                              
                               <form onSubmit={handleSubmit} className="w-[80%] flex flex-col gap-y-3">
                                     <div className="w-full flex flex-col items-center gap-y-2 text-gray-300 " >
                                     <label>Enter your 6 digit otp here</label>
                                     <div className="flex w-full justify-center gap-x-3 ">
                                      {
                                            otp.map((digit,index)=>(
                                              <input key={index} ref={(el:HTMLInputElement|null )=>{
                                                   inputRefs.current[index]=el;
                                              }}
                                              type="text"
                                              maxLength={1}
                                              value={digit}
                                              onChange={e=> handleInputChange(index,e.target.value)}
                                              onKeyDown={e=>handleKeyDown(index,e)}
                                              onPaste={index===0?handlePaste:undefined}
                                              className="w-[10%] text-white bg-gray-700  rounded-lg p-2  focus:outline-1  focus:outline-gray-300"/>
    ))
                                      }
                                     </div>
                                  
                              </div>
                              <button className="bg-blue-700 hover:bg-blue-500 w-full p-2 rounded-lg flex justify-center items-center gap-x-3 " type="submit"> Verify<FaLongArrowAltRight  size={30}/></button>
                             
                               </form>
                             <div className="flex gap-x-3">
                              <p className="text-gray-300 text-sm ">Did'nt receive the code?</p>
                              {
                                timer>0?(
                                  <p className="text-gray-300 text-sm">Resend code in {timer} seconds</p>
                                ):(
                                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50" onClick={handleResendOtp}  disabled={resendLoading}>{resendLoading?"Sending...":"Resend Code"}</button>
                                )
                              }
                             </div>
                        </div>
                </div>
    )
}

export default Verify;