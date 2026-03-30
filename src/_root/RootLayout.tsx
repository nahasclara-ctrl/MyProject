import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Topbar from "@/components/shared/Topbar";
import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/sign-in" />;

  return (
    <div className="w-full md:flex h-screen">
      <Topbar />
      <LeftSidebar />

      <section className="flex-1 h-full overflow-y-auto custom-scrollbar">
        <Outlet />
      </section>

      <Bottombar />
    </div>
  );
};

export default RootLayout;