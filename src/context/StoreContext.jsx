import { createContext, useState, useEffect, useContext } from "react";

export const StoreContext = createContext(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreContextProvider');
  }
  return context;
};

const StoreContextProvider = (props) => {
  const [isAdmin, setAdmin] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [currentUser, setCurrentUser] = useState(
    () => JSON.parse(localStorage.getItem("currentUser")) || null
  );
  const [cartItems, setCartItems] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    return savedUser?.cartItems || {};
  });

  const [selectedSize, setSelectedSize] = useState('');

  const addToCart = (itemId, size) => {
    const idStr = String(itemId);
    const itemKey = size ? `${idStr}-${size}` : idStr;
    setCartItems((prev) => ({
      ...prev,
      [itemKey]: (prev[itemKey] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId, size) => {
    const idStr = String(itemId);
    const itemKey = size ? `${idStr}-${size}` : idStr;
    setCartItems((prev) => {
      if (!prev[itemKey]) return prev;
      const newCart = { ...prev };
      if (newCart[itemKey] > 1) newCart[itemKey] -= 1;
      else delete newCart[itemKey];
      return newCart;
    });
  };

  const getTotal = () => {
    let total = 0;
    for (const item in cartItems) {
      const [itemId] = item.split('-');
      const itemInfo = dishes.find((product) => String(product.id) === itemId);
      if (itemInfo) total += itemInfo.price * cartItems[item];
    }
    return total;
  };

  const [editDishId, setEditDishId] = useState(null);
  const [editedDish, setEditedDish] = useState({ name: '', price: 0 });
  const updateDish = async (id) => {
    const original = dishes.find(d => String(d.id) === String(id));
    if (!original) return alert(" Không tìm thấy món ăn để cập nhật");
    
    const merged = { id: Number(id), name: editedDish.name, price: editedDish.price };
  
    const res = await fetch(`http://localhost:3001/dishes/${Number(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
  
    if (res.ok) {
      alert(" Cập nhật món ăn thành công");
      setEditDishId(null);
      fetchDish();
    } else {
      alert(" Cập nhật thất bại");
    }
  };
  
  const fetchDish = async () => {
    try {
      const res = await fetch("http://localhost:3001/dishes");
      const data = await res.json();
      setDishes(data);
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi fetch dishes:", error);
    }
  };
  
  useEffect(() => {
    fetchDish();
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      fetch(`http://localhost:3001/users/${currentUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems }),
      })
        .then((res) => res.ok && console.log("✅ Cart saved to server"))
        .catch((err) => console.error("❌ Lỗi khi lưu cart:", err));
    }
  }, [cartItems]);

  useEffect(() => {
    console.log("Cập nhật giỏ hàng:", cartItems);
  }, [cartItems]);

  const contextValue = {
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotal,
    currentUser,
    setCurrentUser,
    isAdmin,
    setAdmin,
    dishes,
    setDishes,
    editDishId,
    setEditDishId,
    editedDish,
    setEditedDish,
    updateDish,
    fetchDish,
    selectedSize,
    setSelectedSize
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
