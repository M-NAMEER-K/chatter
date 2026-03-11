import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../../reducer/store";

const ChatLayout = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="w-screen h-screen bg-gray-700">
      <Outlet />
    </div>
  );
};

export default ChatLayout;
