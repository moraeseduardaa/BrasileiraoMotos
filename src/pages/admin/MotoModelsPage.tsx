import { useState, useEffect } from "react";
import { listarModelosMoto, criarModeloMoto } from "@/lib/supabaseClient";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Save } from "lucide-react"; // Ajuste o caminho para o pacote correto
import { v4 as uuidv4 } from "uuid"; // Adicione esta importação para gerar UUIDs

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
    if (!novoModelo.nome || !novoModelo.marca || !novoModelo.ano_inicio) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const modeloComId = {
      ...novoModelo,
      id: uuidv4(), // Gere um ID único para o modelo
    };

    try {
      await criarModeloMoto(modeloComId);
      setNovoModelo({ nome: "", marca: "", ano_inicio: null, ano_fim: null });
      const { data } = await listarModelosMoto();
      setModelos(data || []);
    } catch (error) {
      console.error("Erro ao criar modelo:", error);
      alert(
        "Ocorreu um erro ao criar o modelo. Verifique os dados e tente novamente."
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-white shadow-md rounded-md">
      <h1 className="text-3xl font-bold text-center">
        Gerenciar Modelos de Moto
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
        className="space-y-6 border p-4 rounded-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="nome">Nome*</Label>
            <Input
              id="nome"
              value={novoModelo.nome}
              onChange={(e) =>
                setNovoModelo({ ...novoModelo, nome: e.target.value })
              }
              placeholder="Ex: CG 160"
            />
          </div>
          <div>
            <Label htmlFor="marca">Marca*</Label>
            <Input
              id="marca"
              value={novoModelo.marca}
              onChange={(e) =>
                setNovoModelo({ ...novoModelo, marca: e.target.value })
              }
              placeholder="Ex: Honda"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="ano_inicio">Ano Início*</Label>
            <Input
              id="ano_inicio"
              type="number"
              value={novoModelo.ano_inicio || ""}
              onChange={(e) =>
                setNovoModelo({
                  ...novoModelo,
                  ano_inicio: Number(e.target.value),
                })
              }
              placeholder="Ex: 2015"
            />
          </div>
          <div>
            <Label htmlFor="ano_fim">Ano Fim</Label>
            <Input
              id="ano_fim"
              type="number"
              value={novoModelo.ano_fim || ""}
              onChange={(e) =>
                setNovoModelo({
                  ...novoModelo,
                  ano_fim: Number(e.target.value),
                })
              }
              placeholder="Ex: 2023"
            />
          </div>
        </div>

        <DialogFooter className="pt-6">
          <Button type="submit" className="bg-moto-red hover:bg-red-700 w-full">
            <Save className="mr-2 h-4 w-4" />
            Adicionar Modelo
          </Button>
        </DialogFooter>
      </form>

      <table className="w-full border-collapse mt-4 shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-moto-red text-white">
          <tr>
            <th className="p-4 text-left">Nome</th>
            <th className="p-4 text-left">Marca</th>
            <th className="p-4 text-left">Ano Início</th>
            <th className="p-4 text-left">Ano Fim</th>
          </tr>
        </thead>
        <tbody>
          {modelos.map((modelo, index) => (
            <tr
              key={modelo.id}
              className={`${
                index % 2 === 0 ? "bg-gray-100" : "bg-white"
              } hover:bg-gray-200`}
            >
              <td className="p-4 border-t">{modelo.nome}</td>
              <td className="p-4 border-t">{modelo.marca}</td>
              <td className="p-4 border-t">{modelo.ano_inicio || "-"}</td>
              <td className="p-4 border-t">{modelo.ano_fim || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MotoModelsPage;
