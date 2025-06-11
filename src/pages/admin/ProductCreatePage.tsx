import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

// Schema de validação para cores
const colorSchema = z.object({
  name: z.string().min(1, "Nome da cor é obrigatório"),
  hexCode: z.string().regex(/^#[0-9A-F]{6}$/i, "Código hex inválido"),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo"),
  imageUrl: z.any().optional(), // File input
});

// Schema de validação para o formulário de produto
const productSchema = z.object({
  name: z.string().min(3, "Nome precisa ter pelo menos 3 caracteres"),
  description: z
    .string()
    .min(10, "Descrição precisa ter pelo menos 10 caracteres"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que 0"),
  weight: z.coerce.number().min(0, "Peso não pode ser negativo"),
  height: z.coerce.number().min(0, "Altura não pode ser negativa"),
  width: z.coerce.number().min(0, "Largura não pode ser negativa"),
  length: z.coerce.number().min(0, "Comprimento não pode ser negativo"),
  category: z.string().min(1, "Selecione uma categoria"),
  featured: z.boolean().optional(),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo").optional(),
  colors: z.array(colorSchema).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Componente para gerenciar cores
const ProductColorsManager = ({
  colors,
  setColors,
}: {
  colors: any[];
  setColors: (colors: any[]) => void;
}) => {
  const [newColor, setNewColor] = useState({
    name: "",
    hexCode: "#000000",
    stock: 0,
    imageUrl: null,
  });

  const addColor = () => {
    if (newColor.name && newColor.hexCode) {
      setColors([...colors, { ...newColor, id: crypto.randomUUID() }]);
      setNewColor({ name: "", hexCode: "#000000", stock: 0, imageUrl: null });
    }
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Cores adicionadas:</h4>
          {colors.map((color, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 border rounded"
            >
              <div
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: color.hexCode }}
              ></div>
              <span className="flex-1">{color.name}</span>
              <span className="text-sm text-gray-600">
                Estoque: {color.stock}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeColor(index)}
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 p-4 border rounded">
        <h4 className="font-medium">Adicionar nova cor:</h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Nome da cor</Label>
            <Input
              value={newColor.name}
              onChange={(e) =>
                setNewColor({ ...newColor, name: e.target.value })
              }
              placeholder="Ex: Azul"
            />
          </div>

          <div>
            <Label>Código da cor</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={newColor.hexCode}
                onChange={(e) =>
                  setNewColor({ ...newColor, hexCode: e.target.value })
                }
                className="w-16"
              />
              <Input
                value={newColor.hexCode}
                onChange={(e) =>
                  setNewColor({ ...newColor, hexCode: e.target.value })
                }
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Estoque desta cor</Label>
            <Input
              type="number"
              min="0"
              value={newColor.stock}
              onChange={(e) =>
                setNewColor({
                  ...newColor,
                  stock: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </div>

          <div>
            <Label>Imagem desta cor</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewColor({
                  ...newColor,
                  imageUrl: e.target.files?.[0] || null,
                })
              }
            />
          </div>
        </div>

        <Button type="button" onClick={addColor} variant="outline" size="sm">
          Adicionar Cor
        </Button>
      </div>
    </div>
  );
};

const ProductCreatePage = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [hasColors, setHasColors] = useState(false);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null); // Estado separado para a imagem

  // Carregar categorias do banco de dados
  useEffect(() => {
    const fetchCategories = async () => {
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
        return;
      }

      // Atualiza o mapeamento de categorias
      const map: Record<string, string> = {};
      data.forEach((category) => {
        map[category.nome] = category.id;
      });
      setCategoryMap(map);
    };

    fetchCategories();
  }, [toast]);

  // Categorias de exemplo - substitua pelas suas categorias reais
  const productCategories = Object.keys(categoryMap);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      weight: 0,
      height: 0,
      width: 0,
      length: 0,
      category: "",
      featured: false,
      stock: 0,
      colors: [],
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    if (!file) {
      throw new Error("Nenhum arquivo foi fornecido para upload.");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`; // Caminho dentro do bucket

    try {
      const { error } = await supabase.storage
        .from("images") // Nome do bucket
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from("images") // Nome do bucket
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error("Não foi possível obter a URL pública da imagem.");
      }

      return data.publicUrl; // Retorna a URL pública completa
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      throw error;
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSaving(true);
    try {
      const productId = crypto.randomUUID();
      let mainImageUrl = "";

      // Se não tem cores, faz upload da imagem principal
      if (!hasColors) {
        if (selectedImage && selectedImage instanceof File) {
          mainImageUrl = await uploadImage(selectedImage);
        } else {
          toast({
            title: "Erro",
            description:
              "Por favor, selecione uma imagem válida para o produto.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }

      // Calcula estoque total
      let totalStock = 0;
      if (hasColors && data.colors) {
        totalStock = 0; // Para produtos com cores, estoque fica zerado na tabela principal
      } else {
        totalStock = data.stock || 0;
      }

      // Obtém o UUID da categoria
      const categoryId = categoryMap[data.category];
      if (!categoryId) {
        throw new Error(`Categoria inválida: ${data.category}`);
      }

      // Insere produto principal
      const { error: productError } = await supabase.from("produtos").insert([
        {
          id: productId,
          nome: data.name,
          descricao: data.description,
          preco: data.price,
          estoque: totalStock,
          categoria_id: categoryId, // Envia o UUID correto
          imagem_url: mainImageUrl, // Certifique-se de que está salvando o caminho relativo
          destaque: data.featured || false,
          peso: data.weight,
          altura: data.height,
          largura: data.width,
          comprimento: data.length,
        },
      ]);

      if (productError) {
        console.error("Erro ao inserir produto:", productError);
        throw productError;
      }

      // Se tem cores, insere cada cor
      if (hasColors && data.colors && data.colors.length > 0) {
        const colorInserts = await Promise.all(
          data.colors.map(async (color) => {
            let colorImageUrl = "";
            if (color.imageUrl) {
              colorImageUrl = await uploadImage(color.imageUrl as File);
            }

            return {
              id: crypto.randomUUID(),
              product_id: productId,
              name: color.name,
              hex_code: color.hexCode,
              stock: color.stock,
              image_url: colorImageUrl,
            };
          })
        );

        const { error: colorsError } = await supabase
          .from("product_colors")
          .insert(colorInserts);

        if (colorsError) {
          console.error("Erro ao inserir cores:", colorsError);
          throw colorsError;
        }
      }

      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso!",
      });

      form.reset();
      setHasColors(false);
      setSelectedImage(null); // Limpa a imagem selecionada
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast({
        title: "Erro",
        description:
          "Não foi possível adicionar o produto. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-white shadow-md rounded-md">
      <h1 className="text-3xl font-bold text-center">Cadastrar Produto</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome do Produto */}
          <div>
            <Label htmlFor="name">Nome do Produto*</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Ex: Kit Relação Honda CG 160"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="category">Categoria*</Label>
            <Select
              onValueChange={(value) => form.setValue("category", value)}
              defaultValue={form.getValues("category")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div>
          <Label htmlFor="description">Descrição*</Label>
          <textarea
            id="description"
            {...form.register("description")}
            placeholder="Descrição detalhada do produto"
            className="w-full p-2 border rounded-md"
            rows={4}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Preço */}
          <div>
            <Label htmlFor="price">Preço*</Label>
            <Input
              type="number"
              id="price"
              step="0.01"
              min="0"
              {...form.register("price")}
              placeholder="0.00"
            />
            {form.formState.errors.price && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>

          {/* Peso */}
          <div>
            <Label htmlFor="weight">Peso (kg)*</Label>
            <Input
              type="number"
              id="weight"
              step="0.01"
              min="0"
              {...form.register("weight")}
              placeholder="0.00"
            />
            {form.formState.errors.weight && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.weight.message}
              </p>
            )}
          </div>

          {/* Altura */}
          <div>
            <Label htmlFor="height">Altura (cm)*</Label>
            <Input
              type="number"
              id="height"
              step="0.01"
              min="0"
              {...form.register("height")}
              placeholder="0.00"
            />
            {form.formState.errors.height && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.height.message}
              </p>
            )}
          </div>

          {/* Largura */}
          <div>
            <Label htmlFor="width">Largura (cm)*</Label>
            <Input
              type="number"
              id="width"
              step="0.01"
              min="0"
              {...form.register("width")}
              placeholder="0.00"
            />
            {form.formState.errors.width && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.width.message}
              </p>
            )}
          </div>

          {/* Comprimento */}
          <div>
            <Label htmlFor="length">Comprimento (cm)*</Label>
            <Input
              type="number"
              id="length"
              step="0.01"
              min="0"
              {...form.register("length")}
              placeholder="0.00"
            />
            {form.formState.errors.length && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.length.message}
              </p>
            )}
          </div>
        </div>

        {/* Produto com Cores */}
        <div className="flex items-center space-x-2">
          <Input
            type="checkbox"
            id="productHasColors"
            className="h-4 w-4"
            checked={hasColors}
            onChange={(e) => {
              const checked = e.target.checked;
              setHasColors(checked);
              if (!checked) {
                form.setValue("colors", []);
                form.setValue("stock", 0);
              } else {
                form.setValue("stock", 0);
                setSelectedImage(null); // Limpa a imagem quando ativa cores
              }
            }}
          />
          <Label htmlFor="productHasColors" className="text-sm">
            Este produto possui variações de cores
          </Label>
        </div>

        {/* Estoque para Produto sem Cores */}
        {!hasColors && (
          <div>
            <Label htmlFor="stock">Estoque*</Label>
            <Input
              type="number"
              id="stock"
              min="0"
              {...form.register("stock")}
              placeholder="Quantidade em estoque"
            />
            {form.formState.errors.stock && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.stock.message}
              </p>
            )}
          </div>
        )}

        {/* Upload de Imagem para Produto sem Cores */}
        {!hasColors && (
          <div>
            <Label htmlFor="imageUrl">Imagem do Produto*</Label>
            <Input
              type="file"
              id="imageUrl"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setSelectedImage(file || null);
              }}
            />
            {selectedImage && (
              <p className="text-sm text-green-600 mt-1">
                Arquivo selecionado: {selectedImage.name}
              </p>
            )}
            {!selectedImage && (
              <p className="text-sm text-gray-500 mt-1">
                Nenhum arquivo selecionado
              </p>
            )}
          </div>
        )}

        {/* Cores (apenas se o produto tiver cores) */}
        {hasColors && (
          <div>
            <Label className="text-base font-medium">Cores e Estoque</Label>
            <p className="text-sm text-gray-600 mb-3">
              Adicione as cores disponíveis, suas imagens e quantidades em
              estoque
            </p>
            <ProductColorsManager
              colors={form.getValues("colors") || []}
              setColors={(colors) => form.setValue("colors", colors)}
            />
            {form.formState.errors.colors && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.colors.message}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="pt-6">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-moto-red hover:bg-red-700 w-full"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Cadastrar Produto
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
};

export default ProductCreatePage;
