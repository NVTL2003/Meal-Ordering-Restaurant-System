// src/store/CartContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getCurrentCart, type Cart } from "../services/cart/cartService"; // Import API services

interface CartState {
  cart: Cart | null;
  cartItemCount: number; // Tổng số lượng món (item.quantity)
  fetchCart: () => Promise<void>; // Hàm để refetch và cập nhật giỏ hàng
  isLoading: boolean;
}

const CartContext = createContext<CartState | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Logic chính để lấy và tính toán giỏ hàng
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentCart = await getCurrentCart();
      setCart(currentCart);

      // Tính tổng số lượng
      const totalCount =
        currentCart.items
          ?.filter((item) => item.status === "AVAILABLE") // chỉ tính món còn hàng
          .reduce((total, item) => total + item.quantity, 0) || 0;

      setCartItemCount(totalCount);
    } catch (error) {
      // Có thể giỏ hàng chưa được tạo hoặc lỗi khác. Reset về rỗng.
      setCart(null);
      setCartItemCount(0);
      console.warn(
        "Failed to fetch current cart, possibly cart is empty or not created.",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load giỏ hàng lần đầu khi component mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = { cart, cartItemCount, fetchCart, isLoading };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
