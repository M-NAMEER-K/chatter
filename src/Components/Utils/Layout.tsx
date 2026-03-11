import Navbar from "./Navbar"
import {Outlet,useNavigate} from "react-router-dom"
import {useSelector} from "react-redux"
import type{RootState} from "../../reducer/store"
import {useEffect} from "react"
const Layout=()=>{
                const token=useSelector((state:RootState)=>state.auth.token);
            
                const navigate=useNavigate();
                useEffect(()=>{
                      if(!token){
                       navigate("/login", { replace: true });
                      }
                },[token,navigate]);
 return(
        
    <div className="  w-screen bg-gray-700  ">
        <Navbar/>
        <Outlet/>
    </div>
 )
}

export default Layout;