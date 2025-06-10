// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xdagqtknjynksqdzwery.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkYWdxdGtuanlua3NxZHp3ZXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzg4NzEsImV4cCI6MjA2MjkxNDg3MX0.IDPU5ta1ztdSoEWrQCljdzRmquYbSmAr8WBIprO5sp8";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Funções para a tabela de usuários
export async function criarUsuario(usuario) {
  return await supabase.from("usuarios").insert(usuario);
}

export async function listarUsuarios() {
  return await supabase.from("usuarios").select("*");
}

// Funções para a tabela de endereços
export async function criarEndereco(endereco) {
  return await supabase.from("enderecos").insert(endereco);
}

export async function listarEnderecos(usuarioId) {
  return await supabase
    .from("enderecos")
    .select("*")
    .eq("usuario_id", usuarioId);
}

// Funções para a tabela de categorias
export async function listarCategorias() {
  return await supabase.from("categorias").select("*");
}

// Funções para a tabela de produtos
export async function listarProdutos() {
  return await supabase.from("produtos").select("*");
}

// Funções para a tabela de pedidos
export async function criarPedido(pedido) {
  return await supabase.from("pedidos").insert(pedido);
}

export async function listarPedidos(usuarioId) {
  return await supabase
    .from("pedidos")
    .select(`
      *,
      itens_pedido(*),
      usuarios(*)
    `)
    .eq("usuario_id", usuarioId);
}

export async function listarPedidosComItens(usuarioId) {
  const { data: pedidos, error: pedidosError } = await supabase
    .from("pedidos")
    .select("*")
    .eq("usuario_id", usuarioId);

  if (pedidosError) {
    return { data: null, error: pedidosError };
  }

  const pedidosComItens = await Promise.all(
    pedidos.map(async (pedido) => {
      if (!pedido.id) {
        return { ...pedido, itens: [] }; // Ignorar pedidos sem ID válido
      }

      const { data: itens, error: itensError } = await supabase
        .from("itens_pedido")
        .select("*")
        .eq("pedido_id", pedido.id);

      if (itensError) {
        console.error(`Erro ao buscar itens para o pedido ${pedido.id}:`, itensError);
        return { ...pedido, itens: [] }; // Retorna o pedido sem itens em caso de erro
      }

      return { ...pedido, itens };
    })
  );

  return { data: pedidosComItens, error: null };
}

// Funções para a tabela de itens do pedido
export async function listarItensPedido(pedidoId) {
  return await supabase
    .from("itens_pedido")
    .select("*")
    .eq("pedido_id", pedidoId);
}

// Funções para a tabela de avaliações
export async function criarAvaliacao(avaliacao) {
  return await supabase.from("avaliacoes").insert(avaliacao);
}

export async function listarAvaliacoes(produtoId) {
  return await supabase
    .from("avaliacoes")
    .select("*")
    .eq("produto_id", produtoId);
}

// Funções para a tabela de modelos de moto
export async function listarModelosMoto() {
  return await supabase.from("modelos_moto").select("*");
}

export async function criarModeloMoto(modeloMoto) {
  return await supabase.from("modelos_moto").insert(modeloMoto);
}

// Funções para a tabela de compatibilidade entre produto e modelo de moto
export async function listarCompatibilidades(produtoId) {
  return await supabase
    .from("compatibilidade_produto")
    .select("*, modelos_moto(*)")
    .eq("produto_id", produtoId);
}

export async function criarCompatibilidade(compatibilidade) {
  return await supabase.from("compatibilidade_produto").insert(compatibilidade);
}
