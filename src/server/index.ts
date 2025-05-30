import express from "express";
import { supabase } from "@/lib/supabaseClient";

const app = express();
const PORT = 3000;

app.use(express.json());

// Interfaces
interface Pedido {
  id: string;
  criado_em: string;
  status: "pendente" | "pago" | "enviado" | "entregue" | "cancelado";
  valor_total: number;
  codigo_rastreamento: string | null;
  metodo_pagamento:
    | "cartao_credito"
    | "cartao_debito"
    | "boleto"
    | "pix"
    | "dinheiro"
    | "credito_loja"
    | null;
  enderecos: { endereco: string }[] | null;
  itens_pedido: ItemPedido[];
}

interface ItemPedido {
  produto_id: string;
  produtos: { nome: string } | null;
  preco_unitario: number;
  quantidade: number;
}

// Rota para buscar pedidos
app.get("/api/pedidos", async (req, res) => {
  try {
    const { data: pedidos, error: pedidosError } = await supabase
      .from("pedidos")
      .select(
        `
        id,
        criado_em,
        status,
        valor_total,
        codigo_rastreamento,
        metodo_pagamento,
        enderecos(endereco),
        itens_pedido(
          produto_id,
          preco_unitario,
          quantidade,
          produtos(nome)
        )
      `
      )
      .order("criado_em", { ascending: false });

    if (pedidosError) throw pedidosError;
    if (!pedidos) throw new Error("Nenhum pedido encontrado.");

    const formattedPedidos = pedidos.map((pedido: any) => {
      return {
        id: pedido.id,
        date: pedido.criado_em,
        status: pedido.status,
        total: pedido.valor_total,
        tracking: pedido.codigo_rastreamento || "Sem rastreamento",
        paymentMethod: pedido.metodo_pagamento || "Método não informado",
        address: pedido.enderecos?.[0]?.endereco || "Endereço não informado",
        items: pedido.itens_pedido.map((item: any) => ({
          id: item.produto_id,
          name: item.produtos?.nome || "Produto não informado",
          price: item.preco_unitario,
          quantity: item.quantidade,
        })),
      };
    });

    res.json(formattedPedidos);
  } catch (error: any) {
    console.error("Erro ao buscar pedidos:", error.message || error);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
