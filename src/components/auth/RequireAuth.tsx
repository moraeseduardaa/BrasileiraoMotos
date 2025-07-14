import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface RequireAuthProps {
  children: ReactNode;
  requiredRole?: "cliente" | "admin";
}

const RequireAuth = ({ children, requiredRole }: RequireAuthProps) => {
  const { user, isInitialized } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Debug: Log para entender o que está acontecendo
    console.log("RequireAuth Debug:", {
      isInitialized,
      user,
      userRole: user?.user_metadata?.role,
      requiredRole,
      hasUser: !!user
    });

    if (isInitialized && !user) {
      console.log("Usuário não encontrado - mostrando toast");
      toast({
        title: "Acesso negado",
        description: "Você precisa fazer login para acessar esta página",
        variant: "destructive",
      });
    } else if (
      isInitialized &&
      user &&
      requiredRole &&
      user.user_metadata?.role !== requiredRole
    ) {
      console.log("Role incorreto - mostrando toast", {
        userRole: user.user_metadata?.role,
        requiredRole
      });
      toast({
        title: "Acesso negado",
        description: "Você precisa de uma conta de cliente para fazer compras",
        variant: "destructive",
      });
    }
  }, [user, isInitialized, requiredRole, toast]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.user_metadata?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
