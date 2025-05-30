import { useState, useEffect, ReactNode } from "react";
import { CartContext } from "@/contexts/CartContextInstance";
import { useContext } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  cores?: string; // Adiciona a propriedade 'cores'
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  shippingFee: number;
  discount: number;
  setShippingFee: (fee: number) => void;
  applyDiscount: (code: string) => boolean;
}

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    // Carrega o carrinho do localStorage quando o componente é montado
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Salva o carrinho no localStorage sempre que ele é atualizado
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (
    newItem: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => {
    setItems((prevItems) => {
      // Verifica se o item já existe no carrinho
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id
      );

      if (existingItemIndex >= 0) {
        // Se o item já existe, atualiza a quantidade
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity:
            updatedItems[existingItemIndex].quantity + (newItem.quantity || 1),
        };
        return updatedItems;
      } else {
        // Se o item não existe, adiciona ao carrinho
        return [...prevItems, { ...newItem, quantity: newItem.quantity || 1 }];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setShippingFee(0);
    setDiscount(0);
  };

  // Calcula o total de itens no carrinho
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calcula o preço total dos itens
  const itemsTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calcula o preço total com frete e desconto
  const totalPrice = itemsTotal + shippingFee - discount;

  // Simula a aplicação de um cupom de desconto
  const applyDiscount = (code: string) => {
    const codes = {
      MOTO10: 10, // 10% de desconto
      MOTO20: 20, // 20% de desconto
      FRETE: 0, // Frete grátis (aplicado de outra forma)
    };

    const codeUpperCase = code.toUpperCase();

    if (codeUpperCase in codes) {
      if (codeUpperCase === "FRETE") {
        setShippingFee(0);
        return true;
      } else {
        const discountPercent = codes[codeUpperCase as keyof typeof codes];
        const discountAmount = (itemsTotal * discountPercent) / 100;
        setDiscount(discountAmount);
        return true;
      }
    }

    return false;
  };

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    shippingFee,
    discount,
    setShippingFee,
    applyDiscount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  return useContext(CartContext);
};

export { CartContext };
