
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useLocation } from "react-router-dom";

const AdminHeader = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [showDropdown, setShowDropdown] = useState(false);

  // Atualiza o título da página com base na rota
  useEffect(() => {
    const path = location.pathname;
    if (path === "/admin/dashboard") {
      setPageTitle("Dashboard");
    } else if (path === "/admin/estoque") {
      setPageTitle("Gerenciamento de Estoque");
    } else if (path === "/admin/pedidos/novo") {
      setPageTitle("Novo Pedido Manual");
    }
  }, [location.pathname]);

  return (
    <header className="bg-white shadow-sm py-4 px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="h-8 w-8 rounded-full bg-moto-red text-white flex items-center justify-center">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline">{currentUser?.name}</span>
          </Button>
          
          {showDropdown && (
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-4 py-2 text-sm text-gray-900 border-b">
                <p className="font-medium">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
