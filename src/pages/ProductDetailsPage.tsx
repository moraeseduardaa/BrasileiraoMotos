import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [kitProducts, setKitProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [kitSelectedColors, setKitSelectedColors] = useState({}); // Estado para cores selecionadas dos produtos do kit
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProductOrKit() {
      if (id.startsWith("kit-")) {
        // Carrega os detalhes do kit
        const kitId = id.replace("kit-", "");
        const { data, error } = await supabase
          .from("kits")
          .select("*, kit_produtos(*, produtos(*, product_colors(*)))")
          .eq("id", kitId)
          .single();

        if (error) {
          console.error("Erro ao carregar kit:", error.message);
        } else {
          setProduct({
            id: `kit-${data.id}`,
            nome: data.nome,
            descricao: data.descricao,
            preco: data.desconto || 0,
            imagem_url: data.foto,
            categoria: "Kit",
          });
          setKitProducts(data.kit_produtos || []);
        }
      } else {
        // Carrega os detalhes do produto
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
    }

    fetchProductOrKit();
  }, [id]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleKitColorSelect = (productId, color) => {
    setKitSelectedColors((prev) => ({
      ...prev,
      [productId]: color,
    }));
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

  const handleAddKitToCart = () => {
    const itemsToAdd = kitProducts.map((kitItem) => {
      const selectedColor = kitSelectedColors[kitItem.produtos.id] || null;
      return {
        id: `${kitItem.produtos.id}-${selectedColor?.id || "default"}`,
        name: kitItem.produtos.nome,
        price: product.preco / kitProducts.length, // Divide o preço do kit igualmente entre os produtos
        imageUrl: selectedColor?.image_url || kitItem.produtos.imagem_url,
        quantity: 1,
        cores: selectedColor?.name || "Padrão",
      };
    });

    itemsToAdd.forEach((item) => addItem(item));

    toast({
      title: "Kit adicionado",
      description: `${product.nome} foi adicionado ao carrinho com as cores selecionadas.`,
    });
  };

  if (!product) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagem do produto ou kit */}
        <div>
          <img
            src={
              selectedColor?.image_url ||
              product.imagem_url ||
              "https://dummyimage.com/500x500/cccccc/000000&text=Sem+Imagem"
            }
            alt={product.nome}
            className="w-full h-auto rounded-md shadow-md"
          />
        </div>

        {/* Detalhes do produto ou kit */}
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

          {/* Cores disponíveis (apenas para produtos) */}
          {product.categoria !== "Kit" &&
            product.product_colors?.length > 0 && (
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

          {/* Produtos do Kit */}
          {product.categoria === "Kit" && kitProducts.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Produtos do Kit</h2>
              <ul>
                {kitProducts.map((kitItem) => (
                  <li key={kitItem.id} className="mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          kitSelectedColors[kitItem.produtos.id]?.image_url ||
                          kitItem.produtos.imagem_url ||
                          "https://dummyimage.com/100x100/cccccc/000000&text=Sem+Imagem"
                        }
                        alt={kitItem.produtos.nome}
                        className="w-16 h-16 rounded-md shadow-md"
                      />
                      <div>
                        <strong>{kitItem.produtos.nome}</strong>
                        <p className="text-sm text-gray-500">
                          {kitItem.produtos.descricao || "Sem descrição"}
                        </p>
                        {kitItem.produtos.product_colors?.length > 0 && (
                          <div className="mt-2">
                            <strong className="block mb-1">
                              Cores disponíveis:
                            </strong>
                            <div className="flex gap-2">
                              {kitItem.produtos.product_colors.map((color) => (
                                <div
                                  key={color.id}
                                  className={`w-6 h-6 rounded-full border cursor-pointer ${
                                    kitSelectedColors[kitItem.produtos.id]
                                      ?.id === color.id
                                      ? "ring-2 ring-blue-500"
                                      : ""
                                  }`}
                                  style={{
                                    backgroundColor: color.hex_code,
                                    borderColor:
                                      color.stock > 0 ? "#d1d5db" : "red",
                                  }}
                                  title={`${color.name} (${
                                    color.stock > 0 ? "Em estoque" : "Esgotado"
                                  })`}
                                  onClick={() =>
                                    handleKitColorSelect(
                                      kitItem.produtos.id,
                                      color
                                    )
                                  }
                                ></div>
                              ))}
                            </div>
                            {kitSelectedColors[kitItem.produtos.id] && (
                              <p className="mt-1 text-sm text-gray-500">
                                Cor selecionada:{" "}
                                <span className="text-gray-700">
                                  {kitSelectedColors[kitItem.produtos.id].name}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-4 mt-6">
            {product.categoria === "Kit" ? (
              <Button
                onClick={handleAddKitToCart}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Adicionar Kit ao Carrinho
              </Button>
            ) : (
              <Button
                onClick={handleAddToCart}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Adicionar ao Carrinho
              </Button>
            )}
            <Button
              onClick={() => window.history.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
