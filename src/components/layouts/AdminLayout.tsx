
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/navigation/AdminSidebar";
import AdminHeader from "@/components/navigation/AdminHeader";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AdminHeader />
        <main className="p-6 bg-moto-lightgray flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
