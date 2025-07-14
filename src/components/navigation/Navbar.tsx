import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleDropdownToggle = () => setIsDropdownOpen((prev) => !prev);
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + NavLinks desktop */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="src\pages\client\img\LogoBrasileirao.png"
                alt="Logo"
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-moto-red">
                Brasileirão Motos 044
              </span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "border-b-2 border-moto-red text-moto-red px-1 pt-1 font-medium"
                    : "text-gray-700 hover:text-moto-red px-1 pt-1 font-medium"
                }
              >
                Início
              </NavLink>
              <NavLink
                to="/catalogo"
                className={({ isActive }) =>
                  isActive
                    ? "border-b-2 border-moto-red text-moto-red px-1 pt-1 font-medium"
                    : "text-gray-700 hover:text-moto-red px-1 pt-1 font-medium"
                }
              >
                Catálogo
              </NavLink>
            </nav>
          </div>

          {/* Ações desktop */}
          <div className="hidden md:flex items-center">
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="outline" asChild className="mr-4">
                    <Link to="/admin/dashboard">Painel Admin</Link>
                  </Button>
                )}
                <Link to="/carrinho" className="relative mr-4 p-2">
                  <ShoppingCart className="h-6 w-6 text-gray-600" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-moto-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {/* Dropdown usuário */}
                <div className="relative mr-2">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                    onClick={handleDropdownToggle}
                  >
                    <User className="h-5 w-5" />
                    <span>
                      {user.user_metadata.nome_completo || user.email}
                    </span>
                  </Button>

                  {isDropdownOpen && (
                    <div
                      onMouseLeave={closeMenus}
                      className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <Link
                        to="/cliente/perfil"
                        onClick={closeMenus}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Meu Perfil
                      </Link>
                      <Link
                        to="/cliente/pedidos"
                        onClick={closeMenus}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Meus Pedidos
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          closeMenus();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">Entrar</Link>
                </Button>
                <Button className="btn-moto" asChild>
                  <Link to="/auth/registro">Registrar</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button + carrinho */}
          <div className="flex md:hidden items-center">
            <Link to="/carrinho" className="relative mr-4 p-2">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-moto-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <Button variant="ghost" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="pt-2 pb-3 space-y-1">
            <NavLink
              to="/"
              onClick={closeMenus}
              className={({ isActive }) =>
                isActive
                  ? "bg-moto-red text-white block px-3 py-2 rounded-md text-base font-medium"
                  : "text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
              }
            >
              Início
            </NavLink>
            <NavLink
              to="/catalogo"
              onClick={closeMenus}
              className={({ isActive }) =>
                isActive
                  ? "bg-moto-red text-white block px-3 py-2 rounded-md text-base font-medium"
                  : "text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
              }
            >
              Catálogo
            </NavLink>
            <NavLink
              to="/carrinho"
              onClick={closeMenus}
              className={({ isActive }) =>
                isActive
                  ? "bg-moto-red text-white block px-3 py-2 rounded-md text-base font-medium"
                  : "text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
              }
            >
              Carrinho {totalItems > 0 && `(${totalItems})`}
            </NavLink>
          </nav>

          {user ? (
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user.user_metadata.nome_completo || user.email}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user.email}
                  </div>
                </div>
              </div>
              <nav className="mt-3 space-y-1 px-2">
                <Link
                  to="/cliente/perfil"
                  onClick={closeMenus}
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Meu Perfil
                </Link>
                <Link
                  to="/cliente/pedidos"
                  onClick={closeMenus}
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Meus Pedidos
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={closeMenus}
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Painel Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    closeMenus();
                  }}
                  className="w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Sair
                </button>
              </nav>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-4 pb-3 px-4 flex flex-col space-y-2">
              <Button variant="outline" asChild className="w-full">
                <Link to="/auth/login" onClick={closeMenus}>
                  Entrar
                </Link>
              </Button>
              <Button className="btn-moto w-full" asChild>
                <Link to="/auth/registro" onClick={closeMenus}>
                  Registrar
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
