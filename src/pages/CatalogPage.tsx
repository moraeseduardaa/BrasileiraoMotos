import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Tipo ajustado conforme sua tabela produtos
interface ProductColor {
  id: string; // UUID
  productId?: string; // UUID, pode ser nulo
  name: string; // Nome da cor
  hex_code: string; // Código hexadecimal da cor
  stock: number; // Estoque disponível
  createdAt?: string; // Data de criação, pode ser nulo
  image_url?: string; // URL da imagem, pode ser nulo
}

interface Product {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  imagem_url?: string;
  categoria: string;
  estoque: number;
  compatibilidade?: string[]; // array de motos compatíveis
  cores?: ProductColor[]; // Adiciona cores ao produto
  selectedColor?: ProductColor | null; // Cor selecionada
}

const CatalogPage = () => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMotorcycle, setSelectedMotorcycle] =
    useState("Todas as motos");
  const [selectedCategory, setSelectedCategory] = useState(
    "Todas as categorias"
  );

  const [productCategories, setProductCategories] = useState<string[]>([
    "Todas as categorias",
  ]);
  const [motorcycleModels, setMotorcycleModels] = useState<string[]>([
    "Todas as motos",
  ]);
  const [selectedColors, setSelectedColors] = useState<
    Record<string, ProductColor | null>
  >({});

  useEffect(() => {
    async function fetchCategoriesAndModels() {
      try {
        // Fetch categories from the database
        const { data: categories, error: categoriesError } = await supabase
          .from("categorias")
          .select("nome");

        if (categoriesError) {
          toast({
            title: "Erro ao carregar categorias",
            description: categoriesError.message,
            variant: "destructive",
          });
        } else if (categories) {
          setProductCategories((prev) => [
            ...new Set([...prev, ...categories.map((cat) => cat.nome)]), // Remove duplicatas
          ]);
        }

        // Fetch motorcycle models from the database
        const { data: models, error: modelsError } = await supabase
          .from("modelos_moto")
          .select("nome");

        if (modelsError) {
          toast({
            title: "Erro ao carregar modelos de moto",
            description: modelsError.message,
            variant: "destructive",
          });
        } else if (models) {
          setMotorcycleModels((prev) => [
            ...new Set([...prev, ...models.map((model) => model.nome)]), // Remove duplicatas
          ]);
        }
      } catch (error) {
        toast({
          title: "Erro inesperado",
          description: "Não foi possível carregar os dados.",
          variant: "destructive",
        });
      }
    }

    fetchCategoriesAndModels();
  }, [toast]);

  // Busca produtos do banco ao montar componente
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("produtos")
        .select("*, product_colors(*)"); // Inclui cores relacionadas

      if (error) {
        toast({
          title: "Erro ao carregar produtos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const processed = data?.map((prod) => {
        const cores = prod.product_colors || [];
        const primeiraCorComEstoque =
          cores.find((color) => color.stock > 0) || null;

        return {
          ...prod,
          compatibilidade:
            typeof prod.compatibilidade === "string"
              ? JSON.parse(prod.compatibilidade)
              : prod.compatibilidade || [],
          cores,
          selectedColor: primeiraCorComEstoque, // Define a cor padrão com estoque
        };
      }) as Product[];

      setProducts(processed || []);
      setFilteredProducts(processed || []);

      // Define cores selecionadas iniciais
      setSelectedColors(
        processed.reduce((acc, prod) => {
          acc[prod.id] = prod.selectedColor;
          return acc;
        }, {} as Record<string, ProductColor | null>)
      );
    }

    fetchProducts();
  }, [toast]);

  // Filtra produtos conforme critérios
  useEffect(() => {
    let filtered = [...products];

    // Filtro busca
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (p) =>
          p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ??
            false)
      );
    }

    // Filtro moto
    if (selectedMotorcycle !== "Todas as motos") {
      filtered = filtered.filter(
        (p) =>
          p.compatibilidade && p.compatibilidade.includes(selectedMotorcycle)
      );
    }

    // Filtro categoria
    if (selectedCategory !== "Todas as categorias") {
      filtered = filtered.filter((p) => p.categoria === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedMotorcycle, selectedCategory, products]);

  const handleAddToCart = (product: Product, selectedColor?: ProductColor) => {
    const colorToUse = selectedColor || selectedColors[product.id];

    addItem({
      id: `${product.id}-${colorToUse?.id || "default"}`, // Inclui a cor no ID
      name: product.nome,
      price: product.preco,
      imageUrl:
        colorToUse?.image_url ||
        product.imagem_url ||
        "https://xdagqtknjynksqdzwery.supabase.co/storage/v1/object/sign/estoque-produtos/LogoBrasileirao.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2Q4NmI2ODkxLTJlNDktNDM2Zi1iMmM4LWRkMjM3ZmFlZmY4MCJ9.eyJ1cmwiOiJlc3RvcXVlLXByb2R1dG9zL0xvZ29CcmFzaWxlaXJhby5wbmciLCJpYXQiOjE3NDg4Mjc0MDksImV4cCI6MzE1NTMxNzI5MTQwOX0.CNAwWmCvviIVrZIpMoRBgIHYoK1hrWHITxq8vK4cl7A",
      quantity: 1,
      cores: colorToUse?.name || "Padrão", // Propriedade agora válida
    });

    toast({
      title: "Produto adicionado",
      description: `${product.nome} (${
        colorToUse?.name || "Padrão"
      }) foi adicionado ao carrinho.`,
    });
  };

  const handleColorSelect = (productId: string, color: ProductColor) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: color,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Catálogo de Produtos</h1>

      {/* Busca e filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="min-w-[200px]">
              <Select
                value={selectedMotorcycle}
                onValueChange={setSelectedMotorcycle}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua moto" />
                </SelectTrigger>
                <SelectContent>
                  {motorcycleModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[200px]">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => {
                // Força filtro ao clicar no botão
                // Aqui ele já é reativo, mas mantive pra compatibilidade
              }}
              className="btn-moto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>
      </div>

      {/* Produtos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const selectedColor = selectedColors[product.id] || null;

            return (
              <div
                key={product.id}
                className="product-card group transition-all bg-white rounded-md shadow p-6 flex flex-col"
              >
                <div className="mb-4 overflow-hidden rounded-md">
                  <img
                    src={
                      selectedColor?.image_url ??
                      product.imagem_url ??
                      "https://xdagqtknjynksqdzwery.supabase.co/storage/v1/object/sign/estoque-produtos/LogoBrasileirao.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2Q4NmI2ODkxLTJlNDktNDM2Zi1iMmM4LWRkMjM3ZmFlZmY4MCJ9.eyJ1cmwiOiJlc3RvcXVlLXByb2R1dG9zL0xvZ29CcmFzaWxlaXJhby5wbmciLCJpYXQiOjE3NDg4Mjc0MDksImV4cCI6MzE1NTMxNzI5MTQwOX0.CNAwWmCvviIVrZIpMoRBgIHYoK1hrWHITxq8vK4cl7A"
                    }
                    alt={product.nome}
                    className="w-full h-[20rem] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mb-2">
                  {product.categoria}
                </span>
                <h3 className="font-medium text-lg mb-2">{product.nome}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.descricao || "-"}
                </p>
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Cores disponíveis:
                  </h4>
                  <div className="flex gap-2">
                    {product.cores?.map((color) => (
                      <div
                        key={color.id}
                        className={`w-6 h-6 rounded-full border cursor-pointer ${
                          selectedColor?.id === color.id
                            ? "ring-2 ring-moto-red"
                            : ""
                        }`}
                        style={{
                          backgroundColor: color.hex_code,
                          borderColor: color.stock > 0 ? "#d1d5db" : "red",
                        }}
                        title={`${color.name} (${
                          color.stock > 0 ? "Em estoque" : "Esgotado"
                        })`}
                        onClick={() => handleColorSelect(product.id, color)}
                      ></div>
                    ))}
                  </div>
                  {selectedColor && (
                    <p className="mt-2 text-sm text-gray-500">
                      Cor selecionada:{" "}
                      <span className="text-gray-700">
                        {selectedColor.name}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xl font-bold text-moto-red">
                    {product.preco.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <Button
                    onClick={() => handleAddToCart(product, selectedColor)}
                    size="sm"
                    className="btn-moto flex items-center"
                    disabled={
                      selectedColor
                        ? selectedColor.stock === 0
                        : product.estoque === 0
                    }
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {selectedColor && selectedColor.stock > 0
                      ? "Adicionar"
                      : "Esgotado"}
                  </Button>
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  <span
                    className={
                      selectedColor
                        ? selectedColor.stock > 0
                          ? "text-green-600"
                          : "text-red-600"
                        : product.estoque > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {selectedColor
                      ? selectedColor.stock > 0
                        ? `Em estoque: ${selectedColor.stock}`
                        : "Esgotado"
                      : product.estoque > 0
                      ? `Em estoque: ${product.estoque}`
                      : "Esgotado"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-gray-600">
            Nenhum produto encontrado
          </h3>
          <p className="mt-2 text-gray-500">
            Tente ajustar seus filtros ou buscar por outro termo.
          </p>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
