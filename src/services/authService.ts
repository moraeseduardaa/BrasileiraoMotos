// src/services/authService.ts
import { supabase } from "@/lib/supabaseClient";

export const register = async (
  nome_completo: string,
  email: string,
  senha: string
) => {
  // 1. Cadastra no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: senha,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Erro ao criar usuário");
  }

  const userId = authData.user.id;

  // 2. Insere na tabela `usuarios`
  const { error: dbError } = await supabase.from("usuarios").insert([
    {
      id: userId,
      email,
      nome_completo,
      senha_hash: senha, // ⚠️ Idealmente, você deve usar hash da senha (veja nota abaixo)
      papel: "cliente",
      ativo: true,
    },
  ]);

  if (dbError) {
    // em caso de erro, remover o usuário criado no auth para evitar inconsistência
    await supabase.auth.admin.deleteUser(userId);
    throw new Error("Erro ao salvar dados adicionais: " + dbError.message);
  }

  return { success: true, user: authData.user };
};
