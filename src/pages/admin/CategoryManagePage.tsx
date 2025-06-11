import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid"; // Adicione esta importação para gerar UUIDs

// Schema de validação para categorias
const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoryManagePage = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // Estado para edição de categoria

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  // Carregar categorias do banco de dados
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("categorias")
        .select("id, nome");

      if (error) {
        console.error("Erro ao carregar categorias:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias.",
          variant: "destructive",
        });
      } else {
        setCategories(data);
      }
      setIsLoading(false);
    };

    fetchCategories();
  }, [toast]);

  const addCategory = async (data: CategoryFormValues) => {
    const newCategoryData = {
      id: uuidv4(), // Gere um UUID para o novo registro
      nome: data.name,
    };

    const {
      data: newCategory,
      error,
      status,
    } = await supabase.from("categorias").insert([newCategoryData]);

    if (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast({
        title: "Erro",
        description:
          status === 400
            ? error.message ||
              "Dados inválidos enviados ao servidor. Verifique as informações e tente novamente."
            : "Não foi possível adicionar a categoria.",
        variant: "destructive",
      });
    } else if (newCategory) {
      toast({
        title: "Categoria adicionada",
        description: "A categoria foi adicionada com sucesso!",
      });
      setCategories((prev) => [...prev, newCategory[0]]); // Use o primeiro item retornado
      form.reset();
    }
  };

  const deleteCategory = async (id: string) => {
    const { error, status } = await supabase
      .from("categorias")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir categoria:", error);
      const errorMessage =
        error.code === "23503"
          ? "Não é possível excluir a categoria porque ela está sendo usada em outros registros."
          : status === 400
          ? error.message ||
            "Não foi possível processar a solicitação. Verifique os dados e tente novamente."
          : "Não foi possível excluir a categoria.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso!",
      });
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
  };

  const updateCategory = async (id: string, newName: string) => {
    const { error, status } = await supabase
      .from("categorias")
      .update({ nome: newName })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast({
        title: "Erro",
        description:
          status === 400
            ? error.message || "Não foi possível atualizar a categoria."
            : "Erro ao atualizar a categoria.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso!",
      });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, nome: newName } : cat))
      );
      setEditingCategory(null); // Finalizar edição
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-white shadow-md rounded-md">
      <h1 className="text-3xl font-bold text-center mb-6">
        Gerenciar Categorias
      </h1>

      <form
        onSubmit={form.handleSubmit(addCategory)}
        className="space-y-6 border p-4 rounded-md bg-gray-50 shadow-sm"
      >
        <div>
          <Label htmlFor="name" className="font-medium text-gray-700">
            Nome da Categoria*
          </Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Ex: Eletrônicos"
            className="mt-1"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <DialogFooter className="pt-6">
          <Button type="submit" className="bg-moto-red hover:bg-red-700 w-full">
            <Save className="mr-2 h-4 w-4" />
            Adicionar Categoria
          </Button>
        </DialogFooter>
      </form>

      {isLoading ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mt-6 bg-white shadow-sm rounded-md">
            <thead className="bg-moto-red text-white">
              <tr>
                <th className="p-4 text-left font-semibold">Nome</th>
                <th className="p-4 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr
                  key={category.id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="p-4 text-gray-700">
                    {editingCategory?.id === category.id ? (
                      <Input
                        defaultValue={category.nome}
                        onBlur={(e) =>
                          updateCategory(category.id, e.target.value)
                        }
                        autoFocus
                        className="w-full"
                      />
                    ) : (
                      category.nome
                    )}
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-moto-red border-moto-red hover:bg-moto-red hover:text-white"
                      onClick={() =>
                        setEditingCategory(
                          editingCategory?.id === category.id ? null : category
                        )
                      }
                    >
                      {editingCategory?.id === category.id
                        ? "Cancelar"
                        : "Editar"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => deleteCategory(category.id)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryManagePage;
