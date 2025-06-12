import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const KitsPage = () => {
  const [products, setProducts] = useState([]);
  const [kitName, setKitName] = useState("");
  const [kitDescription, setKitDescription] = useState("");
  const [kitDiscount, setKitDiscount] = useState(0);
  const [kitItems, setKitItems] = useState([]);
  const [kitPhoto, setKitPhoto] = useState<File | null>(null);
  const [kitPhotoPreview, setKitPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("produtos")
        .select("*, product_colors(*)");
      if (error) {
        toast({
          title: "Erro ao carregar produtos",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProducts(data || []);
      }
    }
    fetchProducts();
  }, [toast]);

  const handleAddKitItem = (produtoId: string) => {
    const selectedProduct = products.find(
      (product) => product.id === produtoId
    );
    if (!selectedProduct) return;

    const newItem = {
      produtoId,
      nome: selectedProduct.nome,
      imagem_url: selectedProduct.imagem_url,
      preco: selectedProduct.preco, // Valor do produto
    };

    setKitItems((prev) => [...prev, newItem]);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setKitPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setKitPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setKitPhotoPreview(null);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!file) {
      throw new Error("Nenhum arquivo foi fornecido para upload.");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `kits/${fileName}`; // Caminho dentro do bucket

    try {
      const { error } = await supabase.storage
        .from("images") // Nome do bucket ajustado
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from("images") // Nome do bucket ajustado
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

  const handleSaveKit = async () => {
    if (!kitName || kitItems.length === 0 || !kitPhoto) {
      toast({
        title: "Erro",
        description:
          "Preencha todos os campos, adicione ao menos um item e uma foto.",
        variant: "destructive",
      });
      return;
    }

    let photoUrl = null;
    try {
      if (kitPhoto) {
        photoUrl = await uploadImage(kitPhoto);
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar foto",
        description: "Não foi possível fazer o upload da foto do kit.",
        variant: "destructive",
      });
      return;
    }

    const { data: kit, error: kitError } = await supabase
      .from("kits")
      .insert({
        nome: kitName,
        descricao: kitDescription,
        desconto: kitDiscount,
        foto: photoUrl,
      })
      .select()
      .single();

    if (kitError) {
      toast({
        title: "Erro ao salvar kit",
        description: kitError.message,
        variant: "destructive",
      });
      return;
    }

    const kitProdutos = kitItems.map((item) => ({
      kit_id: kit.id,
      produto_id: item.produtoId,
      valor: item.preco, // Salva o valor do produto no kit
    }));

    const { error: kitProdutosError } = await supabase
      .from("kit_produtos")
      .insert(kitProdutos);

    if (kitProdutosError) {
      toast({
        title: "Erro ao salvar itens do kit",
        description: kitProdutosError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Kit salvo com sucesso",
        description: "O kit foi criado com sucesso.",
      });
      setKitName("");
      setKitDescription("");
      setKitDiscount(0);
      setKitItems([]);
      setKitPhoto(null);
      setKitPhotoPreview(null);
    }
  };

  const calculateKitValue = () => {
    const totalValue = kitItems.reduce((sum, item) => {
      const product = products.find((product) => product.id === item.produtoId);

      if (!product) return sum;

      return sum + product.preco; // Soma o valor do produto
    }, 0);

    // Aplica o desconto
    const discountValue = (totalValue * kitDiscount) / 100;
    return totalValue - discountValue;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Gerenciar Kits</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Kit
            </label>
            <Input
              placeholder="Nome do Kit"
              value={kitName}
              onChange={(e) => setKitName(e.target.value)}
              className="mb-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do Kit
            </label>
            <Input
              placeholder="Descrição do Kit"
              value={kitDescription}
              onChange={(e) => setKitDescription(e.target.value)}
              className="mb-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desconto (%)
            </label>
            <Input
              type="number"
              placeholder="Desconto (%)"
              value={kitDiscount}
              onChange={(e) => setKitDiscount(Number(e.target.value))}
              className="mb-4"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto do Kit
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {kitPhotoPreview && (
              <img
                src={kitPhotoPreview}
                alt="Pré-visualização da Foto do Kit"
                className="mt-4 w-32 h-32 object-cover rounded"
              />
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adicionar Produto ao Kit
          </label>
          <Select
            onValueChange={(value) => handleAddKitItem(value)}
            className="w-full"
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {kitItems.map((item) => (
          <div
            key={item.produtoId}
            className="flex items-center gap-4 mb-4 border p-4 rounded-lg shadow-sm"
          >
            <img
              src={item.imagem_url || "/placeholder.png"}
              alt={item.nome}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{item.nome}</h2>
              <p className="text-sm text-gray-500">
                Preço: R$ {item.preco ? item.preco.toFixed(2) : "0.00"}
              </p>
            </div>
          </div>
        ))}
        <div className="text-right font-bold text-lg mb-4">
          Valor Total do Kit: R$ {calculateKitValue().toFixed(2)}
        </div>
        <Button onClick={handleSaveKit} className="w-full">
          Salvar Kit
        </Button>
      </div>
    </div>
  );
};

export default KitsPage;
