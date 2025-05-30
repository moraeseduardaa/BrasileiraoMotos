
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-moto-lightgray flex flex-col">
      <div className="py-4 px-6 bg-white shadow-sm">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-moto-red">Brasileirão Motos 044</span>
        </Link>
      </div>
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
