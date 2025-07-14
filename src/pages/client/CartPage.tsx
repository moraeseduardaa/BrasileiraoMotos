import { useState, useEffect } from "react"; // Adicionado useEffect
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext"; // Adicionado useAuth
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, Plus, Minus, Tag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { supabase } from "@/lib/supabaseClient";

const calcularDimensoesCaixa = (itensCarrinho) => {
  // Lógica para calcular dimensões e peso da caixa
  let pesoTotal = 0.2; // Peso da caixa
  let volumeTotal = 0;

  itensCarrinho.forEach((item) => {
    pesoTotal += item.peso * item.quantity;
    volumeTotal +=
      item.altura * item.largura * item.comprimento * item.quantity;
  });

  const dimensaoCubica = Math.cbrt(volumeTotal * 1.25); // Margem de segurança
  return {
    altura: Math.max(dimensaoCubica * 0.8, 2),
    largura: Math.max(dimensaoCubica, 11),
    comprimento: Math.max(dimensaoCubica * 1.2, 16),
    peso: Math.max(pesoTotal * 1.1, 0.3),
  };
};

const calcularFreteMelhorEnvio = async (cepDestino, itensCarrinho) => {
  const caixa = calcularDimensoesCaixa(itensCarrinho);

  try {
    const response = await fetch(
      "https://api.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_MELHOR_ENVIO_TOKEN}`,
        },
        body: JSON.stringify({
          from: { postal_code: "87043436" },
          to: { postal_code: cepDestino },
          products: [
            {
              weight: caixa.peso,
              width: caixa.largura,
              height: caixa.altura,
              length: caixa.comprimento,
              insurance_value: itensCarrinho.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              ),
              quantity: 1,
            },
          ],
          services: ["1"],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Nenhuma opção de frete foi encontrada.");
    }
    return data[0].price;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("Erro de rede ou URL inacessível:", error);
      throw new Error(
        "Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
      );
    } else {
      console.error("Erro ao calcular frete com Melhor Envio:", error);
      throw new Error(
        "Ocorreu um problema ao calcular o frete. Tente novamente mais tarde."
      );
    }
  }
};

const CartPage = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    totalItems,
    totalPrice,
    shippingFee,
    setShippingFee,
    discount,
    applyDiscount,
    addItem,
  } = useCart();
  const { user, isInitialized } = useAuth(); // Adicionado isInitialized
  const { toast } = useToast();
  const navigate = useNavigate();

  const [cep, setCep] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [produtosSugeridos, setProdutosSugeridos] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [coresProduto, setCoresProduto] = useState([]);

  useEffect(() => {
    const fetchProdutos = async () => {
      setIsLoadingProducts(true);
      try {
        const { data, error } = await supabase
          .from("produtos")
          .select(
            "id, nome, descricao, preco, estoque, categoria_id, imagem_url, destaque"
          )
          .gt("estoque", 0) // Apenas produtos com estoque
          .limit(10); // Limite de produtos exibidos

        if (error) {
          console.error("Erro ao buscar produtos:", error);
          toast({
            title: "Erro ao carregar produtos",
            description: "Não foi possível carregar os produtos.",
            variant: "destructive",
          });
        } else {
          setProdutosSugeridos(data || []);
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar produtos:", error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Ocorreu um erro inesperado ao carregar os produtos.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProdutos();
  }, [toast]);

  useEffect(() => {
    const fetchCoresProduto = async () => {
      try {
        const { data, error } = await supabase
          .from("product_colors")
          .select("id, product_id, name, hex_code, stock, image_url")
          .gt("stock", 0); // Apenas cores com estoque

        if (error) {
          console.error("Erro ao buscar cores dos produtos:", error);
          toast({
            title: "Erro ao carregar cores",
            description: "Não foi possível carregar as cores dos produtos.",
            variant: "destructive",
          });
        } else {
          setCoresProduto(data || []);
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar cores dos produtos:", error);
        toast({
          title: "Erro ao carregar cores",
          description: "Ocorreu um erro inesperado ao carregar as cores.",
          variant: "destructive",
        });
      }
    };

    fetchCoresProduto();
  }, [toast]);

  // Função para adicionar produto sugerido ao carrinho
  const adicionarAoCarrinho = (produto) => {
    try {
      // Formatando o produto para o formato esperado pelo carrinho
      const produtoFormatado = {
        id: produto.id,
        name: produto.nome,
        price: parseFloat(produto.preco),
        quantity: 1,
        imageUrl: produto.imagem_url,
        peso: parseFloat(produto.peso || 0),
        altura: parseFloat(produto.altura || 0),
        largura: parseFloat(produto.largura || 0),
        comprimento: parseFloat(produto.comprimento || 0),
      };

      addItem(produtoFormatado);

      toast({
        title: "Produto adicionado",
        description: `${produto.nome} foi adicionado ao carrinho!`,
      });
    } catch (error) {
      console.error("Erro ao adicionar produto ao carrinho:", error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Não foi possível adicionar o produto ao carrinho.",
        variant: "destructive",
      });
    }
  };

  const handleCalculateShipping = async () => {
    if (!cep.match(/^\d{5}-\d{3}$/)) {
      toast({
        title: "CEP inválido",
        description: "Por favor, digite um CEP válido com 8 números",
        variant: "destructive",
      });
      return;
    }

    setIsCalculatingShipping(true);

    try {
      let valorFrete = 0;

      if (cep.startsWith("870")) {
        valorFrete = 10; // Maringá
      } else if (cep.startsWith("8711")) {
        valorFrete = 15; // Sarandi
      } else if (cep.startsWith("8699")) {
        valorFrete = 20; // Marialva, Paiçandu ou Iguatemi
      } else if (cep.startsWith("8716")) {
        valorFrete = 30; // Mandaguaçu
      } else {
        valorFrete = await calcularFreteMelhorEnvio(cep, items);
      }

      setShippingFee(valorFrete);
      toast({
        title: "Frete calculado",
        description: `O valor do frete é R$ ${valorFrete.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao calcular frete",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleApplyDiscount = () => {
    if (shippingFee === 0) {
      toast({
        title: "Calcule o frete",
        description: "Por favor, calcule o frete antes de finalizar a compra",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingDiscount(true);

    setTimeout(() => {
      const success = applyDiscount(discountCode);

      if (success) {
        toast({
          title: "Cupom aplicado",
          description: "Desconto aplicado com sucesso!",
        });
      } else {
        toast({
          title: "Cupom inválido",
          description: "Este código de cupom não existe ou expirou",
          variant: "destructive",
        });
      }

      setIsApplyingDiscount(false);
    }, 1000);
  };

  const validateCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho para finalizar a compra",
        variant: "destructive",
      });
      return false;
    }

    if (shippingFee === null || shippingFee === undefined) {
      toast({
        title: "Calcule o frete",
        description: "Por favor, calcule o frete antes de finalizar a compra",
        variant: "destructive",
      });
      return false;
    }

    if (totalPrice < 40) {
      toast({
        title: "Valor mínimo não atingido",
        description: "O valor mínimo para finalizar a compra é R$ 40,00.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleGoToCheckout = () => {
    if (!validateCheckout()) return;
    
    // Aguardar inicialização do contexto de autenticação
    if (!isInitialized) {
      toast({
        title: "Carregando",
        description: "Aguarde um momento...",
        variant: "default",
      });
      return;
    }
    
    // Verificar se o usuário está autenticado antes de ir para o checkout
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para finalizar sua compra com segurança",
        variant: "default",
      });
      // Salvar a intenção de ir para checkout após login
      sessionStorage.setItem('redirectAfterLogin', '/cliente/checkout');
      navigate("/auth/login");
      return;
    }
    
    // Verificar se o usuário tem o role correto
    if (user.user_metadata?.role !== "cliente") {
      toast({
        title: "Acesso negado",
        description: "Você precisa de uma conta de cliente para fazer compras",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }
    
    navigate("/cliente/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Meu Carrinho</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-medium mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">
            Parece que você ainda não adicionou nenhum produto ao carrinho.
          </p>
          <Button className="bg-moto-red hover:bg-red-700" asChild>
            <a href="/catalogo">Explorar Catálogo</a>
          </Button>
        </div>

        {/* Produtos sugeridos mesmo com carrinho vazio */}
        {produtosSugeridos.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Produtos em Destaque</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {produtosSugeridos.map((produto) => (
                <Card
                  key={produto.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <img
                      src={
                        produto.imageUrl?.trim()
                          ? produto.imageUrl.trim()
                          : "https://xdagqtknjynksqdzwery.supabase.co/storage/v1/object/sign/estoque-produtos/LogoBrasileirao.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2Q4NmI2ODkxLTJlNDktNDM2Zi1iMmM4LWRkMjM3ZmFlZmY4MCJ9.eyJ1cmwiOiJlc3RvcXVlLXByb2R1dG9zL0xvZ29CcmFzaWxlaXJhby5wbmciLCJpYXQiOjE3NDg4Mjc0MDksImV4cCI6MzE1NTMxNzI5MTQwOX0.CNAwWmCvviIVrZIpMoRBgIHYoK1hrWHITxq8vK4cl7A"
                      }
                      alt={produto.nome}
                      className="w-full h-[20rem] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <h3 className="text-sm font-semibold mb-1 line-clamp-2">
                      {produto.nome}
                    </h3>
                    <p className="text-moto-red font-bold text-sm mb-2">
                      {parseFloat(produto.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {coresProduto
                        .filter((cor) => cor.product_id === produto.id)
                        .map((cor) => (
                          <div
                            key={cor.id}
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: cor.hex_code }}
                            title={cor.name}
                          ></div>
                        ))}
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-moto-red hover:bg-red-700 mt-4"
                      onClick={() => adicionarAoCarrinho(produto)}
                    >
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Meu Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-2">
                Itens do Carrinho ({totalItems})
              </h2>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="p-6 border-b flex flex-col sm:flex-row items-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden mr-6 flex-shrink-0">
                  <img
                    src={
                      item.imageUrl && item.imageUrl.trim() !== ""
                        ? item.imageUrl
                        : "https://xdagqtknjynksqdzwery.supabase.co/storage/v1/object/sign/estoque-produtos/LogoBrasileirao.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2Q4NmI2ODkxLTJlNDktNDM2Zi1iMmM4LWRkMjM3ZmFlZmY4MCJ9.eyJ1cmwiOiJlc3RvcXVlLXByb2R1dG9zL0xvZ29CcmFzaWxlaXJhby5wbmciLCJpYXQiOjE3NDg4Mjc0MDksImV4cCI6MzE1NTMxNzI5MTQwOX0.CNAwWmCvviIVrZIpMoRBgIHYoK1hrWHITxq8vK4cl7A"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-grow">
                  <h3 className="font-medium text-lg">{item.name}</h3>
                  {item.cores && (
                    <p className="text-sm text-gray-500 mt-1">
                      Cor: <span className="text-gray-700">{item.cores}</span>
                    </p>
                  )}
                  <div className="text-xl font-bold text-moto-red mt-1">
                    {item.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </div>

                <div className="flex items-center mt-4 sm:mt-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <span className="w-10 text-center">{item.quantity}</span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do pedido</CardTitle>
              <CardDescription>
                Revise os itens e finalize sua compra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>
                    {(totalPrice - shippingFee + discount).toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      }
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span>
                    {shippingFee.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>
                      -
                      {discount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    {totalPrice.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Calcular frete
                  </label>
                  <div className="flex">
                    <Input
                      type="text"
                      placeholder="Digite seu CEP"
                      value={cep}
                      onChange={(e) => {
                        const raw = e.target.value
                          .replace(/\D/g, "")
                          .substring(0, 8);
                        const formatted = raw.replace(
                          /^(\d{5})(\d{0,3})$/,
                          "$1-$2"
                        );
                        setCep(formatted);
                      }}
                      className="rounded-r-none"
                    />
                    <Button
                      className="rounded-l-none"
                      onClick={handleCalculateShipping}
                      disabled={isCalculatingShipping}
                    >
                      {isCalculatingShipping ? "Calculando..." : "Calcular"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <a
                      href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-moto-red hover:underline"
                    >
                      Não sei meu CEP
                    </a>
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Cupom de desconto
                  </label>
                  <div className="flex">
                    <Input
                      type="text"
                      placeholder="Digite o código do cupom"
                      value={discountCode}
                      onChange={(e) =>
                        setDiscountCode(e.target.value.toUpperCase())
                      }
                      className="rounded-r-none"
                    />
                    <Button
                      variant="outline"
                      className="rounded-l-none border-l-0"
                      onClick={handleApplyDiscount}
                      disabled={isApplyingDiscount}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      {isApplyingDiscount ? "Aplicando..." : "Aplicar"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={isCalculatingShipping || isApplyingDiscount || !isInitialized}
                className="w-full bg-moto-red hover:bg-red-700 text-white"
                size="lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGoToCheckout();
                }}
              >
                {!isInitialized 
                  ? "Carregando..." 
                  : !user 
                    ? "Fazer Login para Finalizar" 
                    : "Ir para Pagamento"
                }
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Produtos Sugeridos */}
      {produtosSugeridos.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">
            Você também pode gostar
          </h2>
          {isLoadingProducts ? (
            <div className="text-center py-8">
              <p>Carregando produtos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {produtosSugeridos.map((produto) => (
                <Card
                  key={produto.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <img
                      src={
                        produto.imageUrl?.trim()
                          ? produto.imageUrl.trim()
                          : "https://xdagqtknjynksqdzwery.supabase.co/storage/v1/object/sign/estoque-produtos/LogoBrasileirao.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2Q4NmI2ODkxLTJlNDktNDM2Zi1iMmM4LWRkMjM3ZmFlZmY4MCJ9.eyJ1cmwiOiJlc3RvcXVlLXByb2R1dG9zL0xvZ29CcmFzaWxlaXJhby5wbmciLCJpYXQiOjE3NDg4Mjc0MDksImV4cCI6MzE1NTMxNzI5MTQwOX0.CNAwWmCvviIVrZIpMoRBgIHYoK1hrWHITxq8vK4cl7A"
                      }
                      alt={produto.nome}
                      className="w-full h-[20rem] object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <h3 className="text-sm font-semibold mb-1 line-clamp-2">
                      {produto.nome}
                    </h3>
                    <p className="text-moto-red font-bold text-sm mb-2">
                      {parseFloat(produto.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {coresProduto
                        .filter((cor) => cor.product_id === produto.id)
                        .map((cor) => (
                          <div
                            key={cor.id}
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: cor.hex_code }}
                            title={cor.name}
                          ></div>
                        ))}
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-moto-red hover:bg-red-700 mt-4"
                      onClick={() => adicionarAoCarrinho(produto)}
                    >
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPage;
