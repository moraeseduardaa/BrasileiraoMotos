import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface RequireAuthProps {
  children: ReactNode;
  requiredRole?: "cliente" | "admin";
}

const RequireAuth = ({ children, requiredRole }: RequireAuthProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa fazer login para acessar esta página",
        variant: "destructive",
      });
    } else if (
      !isLoading &&
      user &&
      requiredRole &&
      user.user_metadata?.role !== requiredRole
    ) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
    }
  }, [user, isLoading, requiredRole, toast]);

  if (isLoading) {
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
