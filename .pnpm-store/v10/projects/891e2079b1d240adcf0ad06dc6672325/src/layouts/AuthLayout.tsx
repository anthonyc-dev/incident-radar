import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen">

      <div className="w-full bg-white">
        {/* Render Login or Register form via nested routes */}
        <Outlet />
      </div>

    </div>
  );
};

export default AuthLayout;
