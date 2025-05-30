import { useState, useEffect } from "react";
import {
  listarCompatibilidades,
  criarCompatibilidade,
  listarProdutos,
  listarModelosMoto,
} from "@/lib/supabaseClient";

const ProductCompatibilityPage = () => {
  const [compatibilidades, setCompatibilidades] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [novaCompatibilidade, setNovaCompatibilidade] = useState({
    produto_id: "",
    modelo_moto_id: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: produtosData } = await listarProdutos();
      const { data: modelosData } = await listarModelosMoto();
      setProdutos(produtosData || []);
      setModelos(modelosData || []);
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    await criarCompatibilidade(novaCompatibilidade);
    setNovaCompatibilidade({ produto_id: "", modelo_moto_id: "" });
    const { data } = await listarCompatibilidades(
      novaCompatibilidade.produto_id
    );
    setCompatibilidades(data || []);
  };

  return (
    <div>
      <h1>Gerenciar Compatibilidade de Produtos</h1>
      <div>
        <select
          value={novaCompatibilidade.produto_id}
          onChange={(e) =>
            setNovaCompatibilidade({
              ...novaCompatibilidade,
              produto_id: e.target.value,
            })
          }
        >
          <option value="">Selecione um Produto</option>
          {produtos.map((produto) => (
            <option key={produto.id} value={produto.id}>
              {produto.nome}
            </option>
          ))}
        </select>
        <select
          value={novaCompatibilidade.modelo_moto_id}
          onChange={(e) =>
            setNovaCompatibilidade({
              ...novaCompatibilidade,
              modelo_moto_id: e.target.value,
            })
          }
        >
          <option value="">Selecione um Modelo de Moto</option>
          {modelos.map((modelo) => (
            <option key={modelo.id} value={modelo.id}>
              {modelo.nome} - {modelo.marca}
            </option>
          ))}
        </select>
        <button onClick={handleCreate}>Adicionar Compatibilidade</button>
      </div>
      <ul>
        {compatibilidades.map((compatibilidade) => (
          <li key={compatibilidade.id}>
            Produto: {compatibilidade.produto_id}, Modelo:{" "}
            {compatibilidade.modelo_moto_id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductCompatibilityPage;
