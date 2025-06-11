import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MotorcycleManagePage = () => {
  const { toast } = useToast();
  const [motorcycles, setMotorcycles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar motos do banco de dados
  useEffect(() => {
    const fetchMotorcycles = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("modelos_moto")
        .select("id, nome, marca, ano_inicio, ano_fim, categoria_id");

      if (error) {
        console.error("Erro ao carregar motos:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os modelos de moto.",
          variant: "destructive",
        });
      } else {
        setMotorcycles(data);
      }
      setIsLoading(false);
    };

    fetchMotorcycles();
  }, [toast]);

  const deleteMotorcycle = async (id: string) => {
    const { error } = await supabase.from("modelos_moto").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir moto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o modelo de moto.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Modelo excluído",
        description: "O modelo de moto foi excluído com sucesso!",
      });
      setMotorcycles((prev) => prev.filter((moto) => moto.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-white shadow-md rounded-md">
      <h1 className="text-3xl font-bold text-center">
        Gerenciar Modelos de Moto
      </h1>

      {isLoading ? (
        <p className="text-center">Carregando...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Nome</th>
              <th className="border border-gray-300 p-2">Marca</th>
              <th className="border border-gray-300 p-2">Ano Início</th>
              <th className="border border-gray-300 p-2">Ano Fim</th>
              <th className="border border-gray-300 p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {motorcycles.map((moto) => (
              <tr key={moto.id}>
                <td className="border border-gray-300 p-2">{moto.nome}</td>
                <td className="border border-gray-300 p-2">{moto.marca}</td>
                <td className="border border-gray-300 p-2">
                  {moto.ano_inicio || "-"}
                </td>
                <td className="border border-gray-300 p-2">
                  {moto.ano_fim || "-"}
                </td>
                <td className="border border-gray-300 p-2">
                  <Button
                    variant="destructive"
                    onClick={() => deleteMotorcycle(moto.id)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MotorcycleManagePage;
