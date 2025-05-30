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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

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
      .from<UserExtra>("usuarios")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (usuarioError || !usuario) {
      throw new Error("Erro ao buscar dados do usuário");
    }

    // Monta o objeto user com role no user_metadata para o controle de acesso
    const userWithRole: AuthUser = {
      id: authData.user.id,
      email: authData.user.email!,
      user_metadata: {
        role: usuario.papel,
        nome_completo: usuario.nome_completo,
      },
    };

    setUser(userWithRole);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = user?.user_metadata.role === "admin";

  useEffect(() => {
    // Recupera sessão atual
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        supabase
          .from<UserExtra>("usuarios")
          .select("*")
          .eq("id", sessionUser.id)
          .single()
          .then(({ data: usuario }) => {
            if (usuario) {
              const userWithRole: AuthUser = {
                id: sessionUser.id,
                email: sessionUser.email!,
                user_metadata: {
                  role: usuario.papel,
                  nome_completo: usuario.nome_completo,
                },
              };
              setUser(userWithRole);
            }
          });
      }
    });

    // Escuta mudanças no estado da autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          supabase
            .from<UserExtra>("usuarios")
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
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
