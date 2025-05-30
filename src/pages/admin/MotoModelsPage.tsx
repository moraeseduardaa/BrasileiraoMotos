import { useState, useEffect } from "react";
import { listarModelosMoto, criarModeloMoto } from "@/lib/supabaseClient";

const MotoModelsPage = () => {
  const [modelos, setModelos] = useState([]);
  const [novoModelo, setNovoModelo] = useState({
    nome: "",
    marca: "",
    ano_inicio: null,
    ano_fim: null,
  });

  useEffect(() => {
    const fetchModelos = async () => {
      const { data } = await listarModelosMoto();
      setModelos(data || []);
    };
    fetchModelos();
  }, []);

  const handleCreate = async () => {
    await criarModeloMoto(novoModelo);
    setNovoModelo({ nome: "", marca: "", ano_inicio: null, ano_fim: null });
    const { data } = await listarModelosMoto();
    setModelos(data || []);
  };

  return (
    <div>
      <h1>Gerenciar Modelos de Moto</h1>
      <div>
        <input
          type="text"
          placeholder="Nome"
          value={novoModelo.nome}
          onChange={(e) =>
            setNovoModelo({ ...novoModelo, nome: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Marca"
          value={novoModelo.marca}
          onChange={(e) =>
            setNovoModelo({ ...novoModelo, marca: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Ano Início"
          value={novoModelo.ano_inicio || ""}
          onChange={(e) =>
            setNovoModelo({ ...novoModelo, ano_inicio: Number(e.target.value) })
          }
        />
        <input
          type="number"
          placeholder="Ano Fim"
          value={novoModelo.ano_fim || ""}
          onChange={(e) =>
            setNovoModelo({ ...novoModelo, ano_fim: Number(e.target.value) })
          }
        />
        <button onClick={handleCreate}>Adicionar Modelo</button>
      </div>
      <ul>
        {modelos.map((modelo) => (
          <li key={modelo.id}>
            {modelo.nome} - {modelo.marca} ({modelo.ano_inicio} -{" "}
            {modelo.ano_fim})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MotoModelsPage;
