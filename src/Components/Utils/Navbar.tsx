import { RxHamburgerMenu } from "react-icons/rx";
import { PiChatsCircleBold } from "react-icons/pi";
import { TiUserAddOutline } from "react-icons/ti";
import { MdOutlineNotifications } from "react-icons/md";
import {Link,useNavigate,useLocation} from "react-router-dom"
import {useState,useEffect} from "react"
import { useDispatch } from "react-redux";
import type { IconType } from "react-icons";
import type { AppDispatch } from "../../reducer/store";
import {logoutAPI} from "../../services/operations/authOps"
import { FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import {setSearchQuery} from "../../slices/searchSlice"

const Navbar=()=>{
      
       const navigate=useNavigate();
       const location=useLocation();
       const notificationCount = useSelector( (state: any) => state.notification.liveNotifications.length);

       const dispatch=useDispatch<AppDispatch>();
       const menuItems=[{text:"Profile",path:"/profile"},{text:"Settings",path:"/settings"},{text:"Logout",path:"/logout"}];
       const navIcons:{id:string,path:string,icon:IconType}[] = [
  {
    id: "chat",
    icon: PiChatsCircleBold,
    path: "/chat",
  },
  {
    id: "add-user",
    icon: TiUserAddOutline,
    path: "/addUsers",
  },
  {
    id:"notification",
    icon:MdOutlineNotifications,
    path:"/notifications"
  },
  
];
       const [visibility,setVisibility]=useState<string>("hidden");

       useEffect(() => {
    setVisibility("hidden");
  }, [location.pathname]);

       return(
        <div className="border-gray-300  w-full sticky top-0 z-50   bg-gray-500 text-white border p-2 md:p-4 border-x-0 border-t-0 flex ">
                    <div className=" w-full md:w-[90%] text-xl flex items-center justify-between">
                         <div className="hidden md:block text-yellow-500 underline mx-2"  >RapidTalk </div>
                         <div  className="w-[98%] md:w-[90%] bg-white text-blue-500 rounded-full p-2 flex justify-between ">
                            <div className="w-[70%] md:w-[50%] border flex items-center hover:border-yellow-500 bg-gray-300 rounded-full px-2 "> 
                              <input type="text" placeholder="Search"  onChange={(e) => dispatch(setSearchQuery(e.target.value))} className=" w-full outline-0 p-1 text-black "/>
                              <FaSearch className="hover:text-yellow-500" size={25}/>
                            </div>
                            <div className="w-[30%] flex justify-end gap-x-1 md:gap-x-3  ">
                                   {navIcons.map(({id,path,icon:Icon}) => (

  <button
    key={id}
    onClick={() => navigate(path)}
    className="relative"
  >

    <Icon className="hover:text-yellow-500 text-[22px] md:text-[25px]"  />

    {id === "notification" && notificationCount > 0 && (
      <span className="absolute top-[15%] left-[55%] bg-red-500 text-white text-xs px-1 rounded-full">
        {notificationCount}
      </span>
    )}

  </button>

))}

                            </div>
                           
                            
                          </div>
                    </div>
                    <div className="w-[10%]  flex items-center  justify-end  ">
                           <RxHamburgerMenu size={30} onClick={()=>setVisibility(prev => (prev === "hidden" ? "block" : "hidden"))}/>
                    </div>
                    
                    <div className={`absolute w-[15%] md:w-[10%] m border border-yellow-500 left-[90%] md:left-[86%] top-[75%] ${visibility}
                    flex flex-col items-center`}>
                                      {menuItems.map((item, index) =>
          item.text === "Logout" ? (
            <button
              key={index}
              onClick={()=>logoutAPI(navigate,dispatch)}
              className="w-full hover:bg-yellow-300 border border-yellow-500 text-center"
            >
              Logout
            </button>
          ) : (
            <Link
              key={index}
              to={item.path}
              className="w-full hover:bg-yellow-300 border border-yellow-500 text-center"
               onClick={() => setVisibility("hidden")}
            >
              {item.text}
            </Link>
          )
        )}

                    </div>
        </div>
       )
}
export default Navbar;
