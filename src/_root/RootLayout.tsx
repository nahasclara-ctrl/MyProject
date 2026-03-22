import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Topbar from "@/components/shared/Topbar";
import { Outlet, Navigate } from "react-router-dom";//i add navigate
import {useUserContext} from "@/context/AuthContext"; // in add this one also 

const RootLayout = () => {
  const {isAuthenticated, isLoading} = useUserContext(); //i add also this
  //i add these 2 checks 
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }
  return (
    <div className="w-full md:flex h-screen">
      <Topbar/>
      <LeftSidebar/>

      <section className="flex flex-1 h-full overflow-y-auto custom-scrollbar">
        <Outlet/>


      </section>
      <Bottombar/>
    </div>
  );
};

export default RootLayout;
