import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserExtra {
  id: string;
  email: string;
  nome_completo?: string;
  telefone?: string;
  papel: "cliente" | "admin";
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    role: "cliente" | "admin";
    nome_completo?: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const login = async (email: string, password: string) => {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Erro no login");
    }

    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (usuarioError || !usuario) {
      console.error("Erro ao buscar dados do usuário:", usuarioError);
      throw new Error("Erro ao buscar dados do usuário");
    }

    console.log("Dados do usuário carregados:", usuario);

    // Monta o objeto user com role no user_metadata para o controle de acesso
    const userWithRole: AuthUser = {
      id: authData.user.id,
      email: authData.user.email!,
      user_metadata: {
        role: usuario.papel,
        nome_completo: usuario.nome_completo,
      },
    };

    console.log("User com role montado:", userWithRole);

    setUser(userWithRole);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = user?.user_metadata.role === "admin";

  useEffect(() => {
    console.log("AuthContext: Inicializando...");
    // Recupera sessão atual
    supabase.auth.getSession().then(({ data }) => {
      console.log("Sessão atual:", data.session);
      const sessionUser = data.session?.user;
      if (sessionUser) {
        console.log("Usuário da sessão encontrado:", sessionUser.id);
        supabase
          .from("usuarios")
          .select("*")
          .eq("id", sessionUser.id)
          .single()
          .then(({ data: usuario, error }) => {
            console.log("Resultado da busca do usuário:", { usuario, error });
            if (usuario) {
              const userWithRole: AuthUser = {
                id: sessionUser.id,
                email: sessionUser.email!,
                user_metadata: {
                  role: usuario.papel,
                  nome_completo: usuario.nome_completo,
                },
              };
              console.log("Setando usuário:", userWithRole);
              setUser(userWithRole);
            }
            setIsInitialized(true);
          });
      } else {
        console.log("Nenhuma sessão ativa encontrada");
        setIsInitialized(true);
      }
    });

    // Escuta mudanças no estado da autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          supabase
            .from("usuarios")
            .select("*")
            .eq("id", session.user.id)
            .single()
            .then(({ data: usuario }) => {
              if (usuario) {
                const userWithRole: AuthUser = {
                  id: session.user.id,
                  email: session.user.email!,
                  user_metadata: {
                    role: usuario.papel,
                    nome_completo: usuario.nome_completo,
                  },
                };
                setUser(userWithRole);
              }
            });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
