import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

import MainLayout from "@/components/layouts/MainLayout";
import AdminLayout from "@/components/layouts/AdminLayout";
import AuthLayout from "@/components/layouts/AuthLayout";
import RequireAuth from "@/components/auth/RequireAuth";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import CatalogPage from "@/pages/CatalogPage";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

import CartPage from "@/pages/client/CartPage";
import ProfilePage from "@/pages/client/ProfilePage";
import OrderHistoryPage from "@/pages/client/OrderHistoryPage";
import CheckoutPage from "@/pages/client/CheckoutPage";
import OrderSuccessPage from "@/pages/client/OrderSuccessPage";
import SupportTicketsPage from "@/pages/client/SupportTicketsPage";

import DashboardPage from "@/pages/admin/DashboardPage";
import InventoryPage from "@/pages/admin/InventoryPage";
import ManualOrderPage from "@/pages/admin/ManualOrderPage";
import MotoModelsPage from "@/pages/admin/MotoModelsPage";
import ProductCreatePage from "@/pages/admin/ProductCreatePage";
import ProductDetailsPage from "@/pages/ProductDetailsPage";
import MotorcycleManagePage from "@/pages/admin/MotorcycleManagePage";
import CategoryManagePage from "@/pages/admin/CategoryManagePage";
import ProductCompatibilityPage from "@/pages/admin/ProductCompatibilityPage";

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirecionamento para corrigir rota de login */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />

      {/* Rotas públicas */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Index />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="produto/:id" element={<ProductDetailsPage />} />{" "}
        {/* Nova rota */}
      </Route>

      {/* Rotas de autenticação */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
      </Route>

      {/* Rotas de cliente */}
      <Route
        path="/cliente"
        element={
          <RequireAuth requiredRole="cliente">
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path="carrinho" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="pedido-finalizado" element={<OrderSuccessPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="pedidos" element={<OrderHistoryPage />} />
        <Route path="suporte" element={<SupportTicketsPage />} />
      </Route>

      {/* Rotas de administrador */}
      <Route
        path="/admin"
        element={
          <RequireAuth requiredRole="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="estoque" element={<InventoryPage />} />
        <Route path="pedidos/novo" element={<ManualOrderPage />} />
        <Route path="modelos-moto" element={<MotoModelsPage />} />
        <Route path="produtos/novo" element={<ProductCreatePage />} />{" "}
        {/* Nova rota */}
        <Route path="modelos-moto" element={<MotorcycleManagePage />} />{" "}
        {/* Nova rota */}
        <Route path="categorias" element={<CategoryManagePage />} />{" "}
        {/* Nova rota */}
        <Route
          path="compatibilidade-produtos"
          element={<ProductCompatibilityPage />}
        />{" "}
        {/* Nova rota */}
      </Route>

      {/* Página 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
