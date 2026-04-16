import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Topbar from "@/components/shared/Topbar";
import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const P = {
  50: "#f6fbf8",
  100: "#eaf5ef",
  200: "#d6ebe0",
  300: "#b7dcc8",
  400: "#7bbf9a",
  500: "#4f9f75",
  600: "#3f8a63",
  700: "#2f6e4f",
};

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(180deg, ${P[50]}, ${P[100]})`,
        }}
      >
        <div style={{ color: P[500] }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/sign-in" />;

  return (
    <div
      className="w-full md:flex h-screen"
      style={{ backgroundColor: P[50] }}
    >
      {/* TOP BAR */}
      <div style={{ borderBottom: `1px solid ${P[200]}` }}>
        <Topbar />
      </div>

      {/* SIDEBAR */}
      <div
        style={{
          borderRight: `1px solid ${P[200]}`,
          backgroundColor: "#fff",
        }}
      >
        <LeftSidebar />
      </div>

      {/* MAIN CONTENT */}
      <section
        className="flex-1 h-full overflow-y-auto custom-scrollbar"
        style={{
          background: `linear-gradient(180deg, #ffffff, ${P[50]})`,
        }}
      >
        <Outlet />
      </section>

      {/* MOBILE BOTTOM BAR */}
      <div
        style={{
          borderTop: `1px solid ${P[200]}`,
          backgroundColor: "#fff",
        }}
      >
        <Bottombar />
      </div>
    </div>
  );
};

export default RootLayout;