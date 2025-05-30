import { createContext } from "react";
import { CartContextType } from "@/contexts/CartContext";

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);
