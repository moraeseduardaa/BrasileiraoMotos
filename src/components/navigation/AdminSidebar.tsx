import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Package, ShoppingCart, Home, Menu, X } from "lucide-react";

const AdminSidebar = () => {
  const { currentUser } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <BarChart size={20} />,
    },
    { name: "Estoque", path: "/admin/estoque", icon: <Package size={20} /> },
    {
      name: "Novo Pedido",
      path: "/admin/pedidos/novo",
      icon: <ShoppingCart size={20} />,
    },
    {
      name: "Cadastrar Produto",
      path: "/admin/produtos/novo",
      icon: <Package size={20} />,
    },
    {
      name: "Gerenciar Modelos de Moto",
      path: "/admin/modelos-moto",
      icon: <Package size={20} />,
    }, // Novo item
    {
      name: "Gerenciar Categorias",
      path: "/admin/categorias",
      icon: <Package size={20} />,
    }, // Novo item
    {
      name: "Gerenciar Compatibilidade de Produtos",
      path: "/admin/compatibilidade-produtos",
      icon: <Package size={20} />,
    }, // Novo item
    { name: "Voltar ao Site", path: "/", icon: <Home size={20} /> },
  ];

  const sidebarContent = (
    <>
      <div className={`${isCollapsed ? "px-2" : "px-4"} py-4`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="text-lg font-bold text-moto-red">Admin</div>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-moto-red hover:bg-moto-lightgray"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-moto-red"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-moto-red text-white"
                    : "text-gray-700 hover:bg-moto-lightgray hover:text-gray-900"
                } ${isCollapsed ? "justify-center" : ""}`
              }
            >
              <div className="mr-3 flex-shrink-0">{item.icon}</div>
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div
        className={`border-t border-gray-200 p-4 ${isCollapsed ? "px-2" : ""}`}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-moto-red text-white flex items-center justify-center">
              {currentUser?.name.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Mobile sidebar trigger
  const mobileTrigger = (
    <button
      onClick={toggleMobileSidebar}
      className="md:hidden fixed left-4 bottom-4 z-40 bg-moto-red text-white p-3 rounded-full shadow-lg"
    >
      <Menu className="h-6 w-6" />
    </button>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-white shadow-lg z-10 transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:w-16" : "md:w-64"
        }`}
      >
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      <div
        className={`md:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-30 transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMobileSidebar}
      />

      <div
        className={`md:hidden fixed inset-y-0 left-0 flex flex-col bg-white w-72 z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>

      {/* Mobile trigger button */}
      {!isMobileOpen && mobileTrigger}

      {/* Push main content to the right on desktop */}
      <div
        className={`hidden md:block transition-all duration-300 ${
          isCollapsed ? "md:pl-16" : ""
        }`}
      />
    </>
  );
};

export default AdminSidebar;
