import { useState, useEffect } from "react";
import { uploadProfilePicAPI, profileDataAPI } from "../../services/operations/authOps";
import { useSelector } from "react-redux";
import { type RootState } from "../../reducer/store";
import { socket } from "../../services/socket/socket";
import { CgProfile } from "react-icons/cg";

interface IProfile {
  _id: string;
  name: string;
  friends:object[];
  profileImage?: {
    url: string;
    publicId: string;
  };
}

const Profile = () => {

  const userId = useSelector(
    (state: RootState) => state.auth.user?._id
  );

  const [profile, setProfile] = useState<IProfile | null>(null);
  
  const [preview, setPreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ SOCKET LISTENER (MAIN FIX)
  useEffect(() => {

    if (!userId) return;

    const handleProfileUpdate = (data: any) => {

      if (data.senderId !== userId) return;

      if (!data.profileImage?.url) return;

      const newUrl =
        data.profileImage.url + "?t=" + Date.now();

      setPreview(newUrl);

      setProfile(prev =>
        prev
          ? {
              ...prev,
              profileImage: {
                url: newUrl,
                publicId: data.profileImage.publicId
              }
            }
          : prev
      );
    };
     

    socket.on("profilePicUpdated", handleProfileUpdate);

    return () => {
      socket.off("profilePicUpdated", handleProfileUpdate);
    };

  }, [userId]);



  // fetch profile initially
  useEffect(() => {

    if (!userId) return;

    const fetchProfile = async () => {

      const res = await profileDataAPI(userId);
      console.log("res",res);
      const profileData = res.data.data;

      const newUrl =
        profileData.profileImage?.url +
        "?t=" +
        Date.now();

      setProfile(profileData);
          
      if (newUrl)
        setPreview(newUrl);
    };

    fetchProfile();

  }, [userId]);



  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file));
  };



  const handleUpload = async () => {

    if (!image) return;

    setLoading(true);

    try {

      await uploadProfilePicAPI(image);

      // socket will update UI automatically

      setImage(null);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };

  const removeFriend=()=>{
      alert("this friend is removed ");
  }

  return (
    <div className="w-screen h-screen flex flex-col  items-center bg-gray-700 text-white overflow-hidden">

      <div className="w-[95%] p-6  my-2 rounded-full bg-gray-500  flex gap-5 items-center ">

        <label className="w-15 h-15 md:w-30 md:h-30 rounded-full overflow-hidden border cursor-pointer">

          {preview ? (

            <img
              src={preview}
              className="w-full h-full object-cover"
            />

          ) : (

            <CgProfile className="w-full h-full" />

          )}

          <input
            type="file"
            hidden
            onChange={handleFileChange}
          />

        </label>

        {image && (

          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-green-600 px-4 py-2 rounded"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>

        )} 
           
           <div className=" w-[90%] text-xl text-white">
                      <div >Username : <span className="text-yellow-500">{profile?.name}</span></div>
                      <div >Friends : <span className="text-yellow-500">{profile?.friends.length}</span></div>
           </div>

      </div>

      


    </div>
  );
};

export default Profile;
