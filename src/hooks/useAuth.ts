import { useContext } from "react";
// Ajuste o caminho de importação para relativo, se necessário
import { AuthContext } from "../contexts/AuthContext";

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
