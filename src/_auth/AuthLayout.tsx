import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const AuthLayout = () => {
  const { isAuthenticated } = useUserContext();

  return !isAuthenticated ? (
    <div className="relative flex min-h-screen w-full overflow-hidden">

      {/* 🌿 LEFT SIDE (FORM AREA) */}
      <section
        className="flex flex-1 justify-center items-center flex-col px-6 py-10 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #f6fbf8 0%, #eaf5ef 40%, #d6ebe0 100%)",
        }}
      >
        {/* glow orbs */}
        <div className="absolute w-[400px] h-[400px] bg-[#7bbf64]/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
        <div className="absolute w-[300px] h-[300px] bg-[#4f9f75]/20 blur-[100px] rounded-full bottom-[-80px] right-[-80px]" />

        {/* content */}
        <div className="w-full max-w-[420px] z-10">
          <Outlet />
        </div>
      </section>

      {/* 🌿 RIGHT SIDE (ADVANCED VISUAL PANEL) */}
      <section className="hidden xl:flex w-1/2 relative items-center justify-center overflow-hidden bg-[#eef2e6]">

        {/* soft radial glow background */}
        <div className="absolute inset-0">
          <div className="absolute w-[600px] h-[600px] bg-[#7bbf64]/20 rounded-full blur-[140px] top-[-150px] left-[-150px]" />
          <div className="absolute w-[500px] h-[500px] bg-[#4f9f75]/20 rounded-full blur-[120px] bottom-[-150px] right-[-150px]" />
        </div>

        {/* network lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <line x1="10%" y1="20%" x2="40%" y2="30%" stroke="#4f9f75" strokeWidth="1"/>
          <line x1="40%" y1="30%" x2="70%" y2="10%" stroke="#4f9f75" strokeWidth="1"/>
          <line x1="20%" y1="80%" x2="50%" y2="70%" stroke="#4f9f75" strokeWidth="1"/>
          <line x1="50%" y1="70%" x2="80%" y2="90%" stroke="#4f9f75" strokeWidth="1"/>
        </svg>

        {/* floating nodes */}
        <div className="absolute w-3 h-3 bg-[#7bbf64] rounded-full top-[20%] left-[25%] animate-pulse" />
        <div className="absolute w-2 h-2 bg-[#4f9f75] rounded-full top-[40%] left-[60%] animate-pulse" />
        <div className="absolute w-3 h-3 bg-[#7bbf64] rounded-full bottom-[25%] right-[30%] animate-pulse" />
        <div className="absolute w-2 h-2 bg-[#4f9f75] rounded-full bottom-[40%] left-[20%] animate-pulse" />

        {/* blended image (lighter) */}
         
 <img
  src="/assets/images/signin.jpeg"
  alt="visual"
  className="absolute inset-0 w-full h-full object-cover opacity-80"
/>
<div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />

        {/* text content */}
        <div className="relative z-10 text-center px-10">
  <h1 className="text-3xl font-bold text-[#163a2b] drop-shadow-md mb-4">
    Welcome to Bondley 🌿
  </h1>

  <p className="text-sm text-[#1f5a3f] leading-relaxed max-w-sm mx-auto bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
    Connect, share, and express yourself in a calm and meaningful way.
  </p>
</div>
      </section>
    </div>
  ) : (
    <Navigate to="/" />
  );
};

export default AuthLayout;