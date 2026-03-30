import { Outlet } from "react-router-dom";

const FullPageLayout = () => {
  return (
    <div className="w-full h-screen overflow-auto">
      <Outlet />
    </div>
  );
};

export default FullPageLayout;