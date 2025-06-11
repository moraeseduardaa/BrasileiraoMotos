import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("produtos")
        .select("*, product_colors(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao carregar produto:", error.message);
      } else {
        const primeiraCorComEstoque =
          data.product_colors?.find((color) => color.stock > 0) || null;
        setProduct({ ...data, selectedColor: primeiraCorComEstoque });
        setSelectedColor(primeiraCorComEstoque);
      }
    }

    fetchProduct();
  }, [id]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleAddToCart = () => {
    if (!selectedColor && product.product_colors?.length > 0) {
      toast({
        title: "Selecione uma cor",
        description:
          "Por favor, selecione uma cor antes de adicionar ao carrinho.",
        variant: "warning",
      });
      return;
    }

    addItem({
      id: `${product.id}-${selectedColor?.id || "default"}`,
      name: product.nome,
      price: product.preco,
      imageUrl: selectedColor?.image_url || product.imagem_url,
      quantity: 1,
      cores: selectedColor?.name || "Padrão",
    });

    toast({
      title: "Produto adicionado",
      description: `${product.nome} (${
        selectedColor?.name || "Padrão"
      }) foi adicionado ao carrinho.`,
    });
  };

  const handleBuyNow = () => {
    if (!selectedColor && product.product_colors?.length > 0) {
      toast({
        title: "Selecione uma cor",
        description: "Por favor, selecione uma cor antes de comprar.",
        variant: "warning",
      });
      return;
    }

    addItem({
      id: `${product.id}-${selectedColor?.id || "default"}`,
      name: product.nome,
      price: product.preco,
      imageUrl: selectedColor?.image_url || product.imagem_url,
      quantity: 1,
      cores: selectedColor?.name || "Padrão",
    });

    toast({
      title: "Compra iniciada",
      description: `Você está comprando ${product.nome} (${
        selectedColor?.name || "Padrão"
      }).`,
    });

    // Redirecionar para a página de checkout (ajuste conforme necessário)
    window.location.href = "/checkout";
  };

  if (!product) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagem do produto */}
        <div>
          <img
            src={
              selectedColor?.image_url ||
              product.imagem_url ||
              "https://via.placeholder.com/500x500?text=Sem+Imagem"
            }
            alt={product.nome}
            className="w-full h-auto rounded-md shadow-md"
          />
        </div>

        {/* Detalhes do produto */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.nome}</h1>
          <p className="text-lg text-gray-700 mb-4">
            {product.descricao || "Sem descrição disponível."}
          </p>
          <p className="text-lg mb-2">
            <strong>Categoria:</strong> {product.categoria}
          </p>
          <p className="text-lg mb-2">
            <strong>Preço:</strong>{" "}
            {product.preco.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="text-lg mb-2">
            <strong>Compatibilidade:</strong>{" "}
            {product.compatibilidade?.length > 0
              ? product.compatibilidade.map((modelo) => modelo.nome).join(", ")
              : "N/A"}
          </p>

          {/* Cores disponíveis */}
          {product.product_colors?.length > 0 && (
            <div className="mb-6">
              <strong className="block mb-2">Cores disponíveis:</strong>
              <div className="flex gap-2">
                {product.product_colors.map((color) => (
                  <div
                    key={color.id}
                    className={`w-8 h-8 rounded-full border cursor-pointer ${
                      selectedColor?.id === color.id
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                    style={{
                      backgroundColor: color.hex_code,
                      borderColor: color.stock > 0 ? "#d1d5db" : "red",
                    }}
                    title={`${color.name} (${
                      color.stock > 0 ? "Em estoque" : "Esgotado"
                    })`}
                    onClick={() => handleColorSelect(color)}
                  ></div>
                ))}
              </div>
              {selectedColor && (
                <p className="mt-2 text-sm text-gray-500">
                  Cor selecionada:{" "}
                  <span className="text-gray-700">{selectedColor.name}</span>
                </p>
              )}
            </div>
          )}

          {/* Estoque */}
          <p className="text-lg mb-4">
            <strong>Estoque:</strong>{" "}
            {selectedColor
              ? selectedColor.stock > 0
                ? `Em estoque: ${selectedColor.stock}`
                : "Esgotado"
              : product.estoque > 0
              ? `Em estoque: ${product.estoque}`
              : "Esgotado"}
          </p>

          {/* Botões de ação */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={
                selectedColor
                  ? selectedColor.stock === 0
                  : product.estoque === 0
              }
            >
              Adicionar ao Carrinho
            </Button>
            <Button
              onClick={handleBuyNow}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={
                selectedColor
                  ? selectedColor.stock === 0
                  : product.estoque === 0
              }
            >
              Comprar Agora
            </Button>
          </div>

          <Button
            onClick={() => window.history.back()}
            className="mt-6 bg-gray-500 hover:bg-gray-600 text-white"
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
