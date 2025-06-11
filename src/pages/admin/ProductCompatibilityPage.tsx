import { useState, useEffect } from "react";
import {
  listarCompatibilidades,
  criarCompatibilidade,
  listarProdutos,
  listarModelosMoto,
} from "@/lib/supabaseClient";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid"; // Importa biblioteca para gerar UUIDs

const ProductCompatibilityPage = () => {
  const [compatibilidades, setCompatibilidades] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [novaCompatibilidade, setNovaCompatibilidade] = useState({
    produto_id: "",
    modelo_moto_id: "",
  });
  const [error, setError] = useState(""); // Novo estado para erros

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: produtosData, error: produtosError } =
          await listarProdutos();
        if (produtosError) throw new Error("Erro ao listar produtos.");
        const { data: modelosData, error: modelosError } =
          await listarModelosMoto();
        if (modelosError) throw new Error("Erro ao listar modelos de moto.");
        setProdutos(produtosData || []);
        setModelos(modelosData || []);
      } catch (err) {
        console.error(err); // Log para depuração
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  const isValidUUID = (uuid) => {
    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  };

  const handleCreate = async () => {
    try {
      setError(""); // Limpa erros anteriores

      // Validação dos campos obrigatórios
      if (
        !novaCompatibilidade.produto_id ||
        !novaCompatibilidade.modelo_moto_id
      ) {
        throw new Error("Todos os campos obrigatórios devem ser preenchidos.");
      }

      // Validação de UUIDs
      if (
        !isValidUUID(novaCompatibilidade.produto_id) ||
        !isValidUUID(novaCompatibilidade.modelo_moto_id)
      ) {
        throw new Error(
          "IDs inválidos. Certifique-se de que são UUIDs válidos."
        );
      }

      // Gera um UUID para o novo registro
      const compatibilidadeComId = {
        id: uuidv4(),
        ...novaCompatibilidade,
      };

      console.log("Enviando dados:", compatibilidadeComId); // Log para depuração
      await criarCompatibilidade(compatibilidadeComId);
      setNovaCompatibilidade({ produto_id: "", modelo_moto_id: "" });

      const { data, error: compatibilidadesError } =
        await listarCompatibilidades(novaCompatibilidade.produto_id);
      if (compatibilidadesError)
        throw new Error("Erro ao listar compatibilidades.");
      setCompatibilidades(data || []);
    } catch (err) {
      console.error(err); // Log para depuração
      setError(err.message);
    }
  };

  const getProdutoNome = (produtoId) => {
    const produto = produtos.find((p) => p.id === produtoId);
    return produto ? produto.nome : "Produto não encontrado";
  };

  const getModeloNome = (modeloId) => {
    const modelo = modelos.find((m) => m.id === modeloId);
    return modelo
      ? `${modelo.nome} - ${modelo.marca}`
      : "Modelo não encontrado";
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-white shadow-md rounded-md">
      <h1 className="text-3xl font-bold text-center">
        Gerenciar Compatibilidade de Produtos
      </h1>

      {error && ( // Exibe mensagem de erro, se houver
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
        className="space-y-6 border p-4 rounded-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="produto">Produto*</Label>
            <select
              id="produto"
              value={novaCompatibilidade.produto_id}
              onChange={(e) =>
                setNovaCompatibilidade({
                  ...novaCompatibilidade,
                  produto_id: e.target.value,
                })
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="">Selecione um Produto</option>
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="modelo">Modelo de Moto*</Label>
            <select
              id="modelo"
              value={novaCompatibilidade.modelo_moto_id}
              onChange={(e) =>
                setNovaCompatibilidade({
                  ...novaCompatibilidade,
                  modelo_moto_id: e.target.value,
                })
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="">Selecione um Modelo de Moto</option>
              {modelos.map((modelo) => (
                <option key={modelo.id} value={modelo.id}>
                  {modelo.nome} - {modelo.marca}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="pt-6">
          <Button type="submit" className="bg-moto-red hover:bg-red-700 w-full">
            <Save className="mr-2 h-4 w-4" />
            Adicionar Compatibilidade
          </Button>
        </DialogFooter>
      </form>

      <ul className="space-y-2">
        {compatibilidades.map((compatibilidade) => (
          <li
            key={compatibilidade.id}
            className="p-2 border rounded-md flex justify-between items-center"
          >
            <span>
              Produto: {getProdutoNome(compatibilidade.produto_id)}, Modelo:{" "}
              {getModeloNome(compatibilidade.modelo_moto_id)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductCompatibilityPage;
