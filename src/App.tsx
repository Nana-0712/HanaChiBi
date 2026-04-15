import { useState, useEffect, useCallback, FormEvent, ChangeEvent } from "react";
import { 
  ShoppingBag, Search, X, User, ChevronRight, Star,
  Sparkles, PenLine, BookOpen, Palette, Scissors, ArrowRight,
  Facebook, Instagram, Phone, Mail, MapPin, Eye, ShoppingCart,
  Heart as HeartIcon, Upload, Printer, Zap, MoreVertical, Trash2, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "./constants";

const uploadImage = async (file: File, folder: string = "uploads"): Promise<string> => {
  console.log(`Starting upload to ${folder}:`, file.name, file.size, file.type);
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server upload error response:", errorText);
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Lỗi tải ảnh");
    }
    
    console.log("Upload successful:", result.imageUrl);
    return result.imageUrl;
  } catch (error: any) {
    console.error("Upload Error details:", error);
    throw new Error(`Lỗi tải ảnh: ` + error.message, { cause: error });
  }
};

const DECORATION_POSITIONS = [...Array(12)].map(() => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  rotation: `${Math.random() * 360}deg`,
  scale: 0.5 + Math.random()
}));

const PRODUCTS: Product[] = [
  { id: 1, name: 'Bút Gel Pastel HanaChiBi - Set 5 màu', price: 45000, originalPrice: 55000, image: 'https://picsum.photos/seed/pen1/600/600', category: 'pen', subCategory: 'Bút nước', brand: 'Thiên Long', isHot: true, isFlashSale: true, soldCount: 45, totalStock: 100, rating: 5, reviews: 124, description: 'Dòng bút gel mực mượt mà, màu sắc pastel nhẹ nhàng phù hợp cho việc ghi chú và trang trí sổ tay.' },
  { id: 2, name: 'Sổ tay lò xo A5 - Pinky Dream', price: 32000, originalPrice: 45000, image: 'https://picsum.photos/seed/notebook1/600/600', category: 'notebook', subCategory: 'Sổ lò xo', brand: 'HanaChiBi', isNew: true, isFlashSale: true, soldCount: 28, totalStock: 100, rating: 4.8, reviews: 89, description: 'Sổ tay bìa cứng cán màng mờ, giấy định lượng cao chống thấm mực, thiết kế Mascot HanaChiBi độc quyền.' },
  { id: 3, name: 'Hộp bút silicon hình thú dễ thương', price: 55000, originalPrice: 65000, image: 'https://picsum.photos/seed/case1/600/600', category: 'case', subCategory: 'Hộp bút', brand: 'Flexoffice', isFlashSale: true, soldCount: 67, totalStock: 100, rating: 4.9, reviews: 210, description: 'Chất liệu silicon cao cấp, mềm mịn, dễ vệ sinh. Sức chứa lớn cho tất cả đồ dùng học tập của bạn.' },
  { id: 4, name: 'Set Sticker trang trí Bullet Journal', price: 15000, originalPrice: 25000, image: 'https://picsum.photos/seed/sticker1/600/600', category: 'sticker', subCategory: 'Set sticker', brand: 'HanaChiBi', isNew: true, isFlashSale: true, soldCount: 12, totalStock: 100, rating: 5, reviews: 56, description: 'Hơn 50 sticker cắt sẵn với nhiều chủ đề dễ thương, màu sắc tươi sáng, độ bám dính tốt.' },
  { id: 5, name: 'Bút chì kim 0.5mm - Pastel Edition', price: 12000, image: 'https://picsum.photos/seed/pencil1/600/600', category: 'pen', subCategory: 'Bút chì', brand: 'Điểm 10', rating: 4.7, reviews: 45, description: 'Thiết kế công thái học giúp cầm nắm thoải mái, ngòi chì 0.5mm chắc chắn, không dễ gãy.' },
  { id: 6, name: 'Tập 200 trang - HanaChiBi Mascot', price: 18000, image: 'https://picsum.photos/seed/notebook2/600/600', category: 'notebook', subCategory: 'Vở kẻ ngang', brand: 'HanaChiBi', isHot: true, rating: 4.9, reviews: 312, description: 'Vở kẻ ngang chất lượng cao, độ trắng tự nhiên bảo vệ mắt, bìa in hình linh vật HanaChiBi.' },
  { id: 7, name: 'Gôm tẩy hình bánh donut màu sắc', price: 8000, image: 'https://picsum.photos/seed/eraser1/600/600', category: 'tool', subCategory: 'Gôm tẩy', brand: 'Colokit', rating: 4.6, reviews: 78, description: 'Gôm tẩy sạch, không để lại bụi, hình dáng bánh donut sáng tạo và bắt mắt.' },
  { id: 8, name: 'Bút highlight 2 đầu - Soft Color', price: 25000, image: 'https://picsum.photos/seed/highlighter1/600/600', category: 'pen', subCategory: 'Bút highlight', brand: 'Thiên Long', rating: 4.8, reviews: 156, description: 'Một đầu dẹt và một đầu tròn tiện lợi, màu sắc nhẹ nhàng không gây lóa mắt khi đọc lại.' }
];

const FLASH_SALE_PRODUCTS = PRODUCTS.filter(p => p.isFlashSale);

export default function App() {
  // HanaChiBi Stationery - Local Server Version (Updated)
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(() => localStorage.getItem('hanachibi_show_cart') === 'true');
  const [showCheckout, setShowCheckout] = useState(() => localStorage.getItem('hanachibi_show_checkout') === 'true');
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [isAdminView, setIsAdminView] = useState(() => localStorage.getItem('hanachibi_admin_view') === 'true');

  const toggleAdminView = (val: boolean) => {
    setIsAdminView(val);
    localStorage.setItem('hanachibi_admin_view', String(val));
  };
  const [adminTab, setAdminTab] = useState<'orders' | 'products' | 'categories' | 'settings'>(() => (localStorage.getItem('hanachibi_admin_tab') as any) || 'orders');
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [myOrdersTab, setMyOrdersTab] = useState("Tất cả");
  const [showOutOfStockModal, setShowOutOfStockModal] = useState<{orderId: string, productId: string} | null>(null);
  const [affectedOrders, setAffectedOrders] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'submitting' | 'success'>(() => (localStorage.getItem('hanachibi_order_status') as any) || 'idle');
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [customAlert, setCustomAlert] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [customConfirm, setCustomConfirm] = useState<{message: string, onConfirm: () => void} | null>(null);

  const showAlert = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setCustomAlert({ message, type });
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    setCustomConfirm({ message, onConfirm });
  }, []);
  const [settings, setSettings] = useState({
    logo: "/logo.png",
    loginBanner: "https://picsum.photos/seed/hanachibi-main/1000/800",
    loginBannerText: "Cùng HaniChibi viết nên ước mơ",
    mascotImage: "https://picsum.photos/seed/pink-panther/400/400",
    mascotText: "Pink panther đang đợi bạn đây nhé",
    qrCode: ""
  });
  const [showSearchTrends, setShowSearchTrends] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const trendingKeywords = ["Bút gel", "Sổ tay", "Sticker", "Washi tape", "Hộp bút"];
  const [customerInfo, setCustomerInfo] = useState({ 
    name: "", 
    phone: "", 
    address: "", 
    note: "",
    voucher: "",
    paymentMethod: "cod",
    shippingMethod: "standard",
    useCoins: false
  });
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedCartItems, setSelectedCartItems] = useState<number[]>([]);

  const decorationPositions = DECORATION_POSITIONS;

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const [productsRes, categoriesRes, settingsRes] = await Promise.all([
        fetch("/api/products", { signal: controller.signal }),
        fetch("/api/categories", { signal: controller.signal }),
        fetch("/api/settings", { signal: controller.signal })
      ]);

      clearTimeout(timeoutId);

      if (!productsRes.ok || !categoriesRes.ok || !settingsRes.ok) {
        throw new Error("Một hoặc nhiều yêu cầu API thất bại");
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const settingsData = await settingsRes.json();

      setLiveProducts(productsData);
      setCategories(categoriesData);
      setSettings(prev => ({ ...prev, ...settingsData }));
      setIsSettingsLoaded(true);
      setConnectionError(null);
    } catch (error: any) {
      console.error("Lỗi tải dữ liệu:", error);
      // Chỉ hiển thị lỗi kết nối nếu là lần tải đầu tiên hoặc chưa có dữ liệu
      if (isInitial || liveProducts.length === 0) {
        setConnectionError("Không thể kết nối với máy chủ. Vui lòng thử lại.");
      }
    }
  }, [liveProducts.length]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("/api/orders", { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Lỗi tải đơn hàng");

      const data = await response.json();
      const filteredOrders = user.role === 'admin' 
        ? data 
        : data.filter((o: any) => o.userId === user.id);
      
      filteredOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(filteredOrders);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    }
  }, [user]);

  useEffect(() => {
    const savedUser = localStorage.getItem('hanachibi_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setTimeout(() => {
        setUser({
          ...parsedUser,
          role: (["dinhthinguyetnga.11a6hd@gmail.com", "lequan1995.ub@gmail.com"].includes(parsedUser.email || "") ? "admin" : "user")
        });
      }, 0);
    }
    setTimeout(() => setIsAuthReady(true), 0);
  }, []);

  useEffect(() => {
    setTimeout(() => fetchData(true), 0);
    const interval = setInterval(() => fetchData(false), 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (user) {
      setTimeout(() => fetchOrders(), 0);
      const interval = setInterval(fetchOrders, 10000); // Poll orders more frequently
      return () => clearInterval(interval);
    }
  }, [user, fetchOrders]);
  const [vouchers] = useState([
    { code: "HANA10", discount: 10000, minOrder: 50000 },
    { code: "CHIBI20", discount: 20000, minOrder: 100000 },
    { code: "FREESHIP", discount: 15000, minOrder: 0 }
  ]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("Tất cả");
  const [loginForm, setLoginForm] = useState({ email: "", password: "", name: "", confirmPassword: "" });
  const [authError, setAuthError] = useState("");
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 0 });
  const [adminOrderSearch, setAdminOrderSearch] = useState("");
  const [showCancelModal, setShowCancelModal] = useState<{ orderId: number, type: 'admin' | 'customer' } | null>(null);
  const [cancelStep, setCancelStep] = useState<'confirm' | 'reason' | 'products'>('confirm');
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState<any>(null);
  const [outOfStockItems, setOutOfStockItems] = useState<number[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");
  const [activeAdminMenu, setActiveAdminMenu] = useState<number | null>(null);
  const [activeStatusMenu, setActiveStatusMenu] = useState<number | null>(null);


  const handleSaveSettings = async (newSettings: any) => {
    if (!isSettingsLoaded) {
      console.warn("Cài đặt chưa được tải xong, không thể lưu.");
      return;
    }
    console.log("Đang lưu cài đặt...", newSettings);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      const result = await response.json();
      if (result.success) {
        console.log("Lưu cài đặt thành công!");
        showAlert("Đã lưu cài đặt thành công! ✨", "success");
      } else {
        showAlert("Lỗi: " + result.message, "error");
      }
    } catch (error) {
      console.error("Lỗi lưu cài đặt:", error);
      showAlert("Lỗi lưu cài đặt. Vui lòng kiểm tra kết nối mạng.", "error");
    }
  };

  const updateSettings = async (updates: Partial<typeof settings>) => {
    const nextSettings = { ...settings, ...updates };
    setSettings(nextSettings);
    await handleSaveSettings(nextSettings);
  };

  const handleUpdateUser = async (updateData: any) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();
      if (result.success) {
        const updatedUser = { ...user, ...updateData };
        setUser(updatedUser);
        localStorage.setItem('hanachibi_user', JSON.stringify(updatedUser));
        
        const notify = document.createElement('div');
        notify.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-2xl font-black shadow-2xl z-[100] animate-bounce";
        notify.innerText = "Cập nhật thông tin thành công! ✨";
        document.body.appendChild(notify);
        setTimeout(() => notify.remove(), 3000);
      }
    } catch (error) {
      console.error("Lỗi cập nhật user:", error);
    }
  };

  const handleUserAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file, "avatars");
      handleUpdateUser({ avatar: imageUrl });
    } catch (error) {
      console.error("Lỗi tải ảnh đại diện:", error);
    }
  };
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [subCategoriesInput, setSubCategoriesInput] = useState("");
  const [orderDetail, setOrderDetail] = useState<any>(null);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
          name: loginForm.name
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        const userData = {
          ...result.user,
          role: (["dinhthinguyetnga.11a6hd@gmail.com", "lequan1995.ub@gmail.com"].includes(result.user.email || "") ? "admin" : "user")
        };
        setUser(userData);
        localStorage.setItem('hanachibi_user', JSON.stringify(userData));
        setShowLogin(false);
        setLoginForm({ email: "", password: "", name: "", confirmPassword: "" });
      } else {
        setAuthError(result.message);
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      setAuthError("Lỗi kết nối máy chủ");
    }
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('hanachibi_user');
    toggleAdminView(false);
  };

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      showAlert("Opps! Bạn cần đăng nhập để có thể đặt hàng nhé 🌸", "info");
      setShowLogin(true);
      return;
    }

    if (customerInfo.paymentMethod === 'bank' && !showQR) {
      setShowQR(true);
      return;
    }
    setOrderStatus('submitting');
    
    const calculateTotal = () => {
      return cart
        .filter(item => selectedCartItems.includes(item.product.id))
        .reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    };

    const cartTotal = calculateTotal();
    const voucher = vouchers.find(v => v.code === customerInfo.voucher);
    const discount = voucher && cartTotal >= voucher.minOrder ? voucher.discount : 0;
    const shipping = customerInfo.shippingMethod === 'express' ? 35000 : 20000;
    const coinsUsed = customerInfo.useCoins ? Math.min(user?.coins || 0, cartTotal - discount + shipping) : 0;
    const finalTotal = cartTotal - discount + shipping - coinsUsed;
    const earnedCoins = Math.floor(cartTotal / 10000);

    try {
      const orderData = {
        userId: user.id,
        customer: customerInfo,
        items: cart.filter(item => selectedCartItems.includes(item.product.id)),
        total: finalTotal,
        discount,
        shipping,
        coinsUsed,
        earnedCoins,
        status: customerInfo.paymentMethod === 'bank' ? "Chờ lấy hàng" : "Chờ xác nhận",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      if (result.success) {
        setOrderStatus('success');
        setCart(prev => prev.filter(item => !selectedCartItems.includes(item.product.id)));
        setSelectedCartItems([]);
        setShowQR(false);
        fetchOrders(); // Refresh orders
        showAlert("Đặt hàng thành công! HanaChiBi sẽ sớm liên hệ với bạn nhé 🌸", "success");
        setTimeout(() => {
          setShowCheckout(false);
          setOrderStatus('idle');
          setCustomerInfo({ 
            name: "", phone: "", address: "", note: "", 
            voucher: "", paymentMethod: "cod", shippingMethod: "standard", useCoins: false 
          });
        }, 3000);
      } else {
        showAlert(result.message, "error");
        setOrderStatus('idle');
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      setOrderStatus('idle');
      showAlert("Lỗi kết nối máy chủ khi đặt hàng", "error");
    }
  };

  const openZalo = () => {
    const link = document.createElement('a');
    link.href = "https://zalo.me/0123456789";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  const handleCancelOrder = async () => {
    if (!showCancelModal) return;
    const { orderId, type } = showCancelModal;
    
    const updateData = {
      status: 'Đã hủy',
      cancelledBy: type === 'admin' ? 'Quản trị viên' : 'Khách hàng',
      cancelReason: cancelReason,
      outOfStockItems: cancelReason === 'Hết hàng' ? outOfStockItems : []
    };

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();
      if (result.success) {
        setShowCancelModal(null);
        setOrderDetail(null);
        setCancelReason("");
        setOutOfStockItems([]);
        setCancelStep('confirm');
        fetchOrders();
        showAlert("Đã hủy đơn hàng thành công!", "success");
      }
    } catch (error) {
      console.error("Lỗi hủy đơn hàng:", error);
      showAlert("Lỗi hủy đơn hàng", "error");
    }
  };
  const handleAdminAccess = () => {
    if (adminPasswordInput === "hanachibi123") { // Mật khẩu mặc định
      toggleAdminView(true);
      setAdminTab('orders');
      setShowAdminPasswordModal(false);
      setAdminPasswordInput("");
      setAdminPasswordError("");
      setOrderDetail(null);
      setShowCancelModal(null);
    } else {
      setAdminPasswordError("Mật khẩu không chính xác!");
    }
  };

  const handleUpdateOrderStatus = async (orderId: number | string, updateData: any) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();
      if (result.success) {
        setOrderDetail(null);
        fetchOrders();
        showAlert("Cập nhật trạng thái đơn hàng thành công!", "success");
      } else {
        showAlert("Lỗi: " + result.message, "error");
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      showAlert("Không thể kết nối máy chủ để cập nhật trạng thái", "error");
    }
  };


  const handleProductImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await uploadImage(file, "products");
      setEditingProduct(prev => prev ? { ...prev, image: imageUrl } : null);
    } catch (error: any) {
      console.error("Lỗi tải ảnh sản phẩm:", error);
      showAlert("Không thể tải ảnh lên: " + (error.message || "Lỗi không xác định"), "error");
    }
  };

  const handleCategoryImageUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await uploadImage(file, "categories");
      setEditingCategory((prev: any) => prev ? { ...prev, [type]: imageUrl } : null);
    } catch (error: any) {
      console.error("Lỗi tải ảnh danh mục:", error);
      showAlert("Không thể tải ảnh lên: " + (error.message || "Lỗi không xác định"), "error");
    }
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    console.log("Saving product data:", editingProduct);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct),
      });
      
      const result = await response.json();
      if (result.success) {
        setEditingProduct(null);
        fetchData(); // Refresh data
        showAlert("Đã lưu sản phẩm thành công! ✨", "success");
      } else {
        showAlert("Lỗi: " + result.message, "error");
      }
    } catch (error: any) {
      console.error("Lỗi lưu sản phẩm:", error);
      showAlert("Không thể kết nối máy chủ để lưu sản phẩm", "error");
    }
  };

  const handleDeleteProduct = async (id: number | string) => {
    showConfirm("Bạn có chắc muốn xóa sản phẩm này?", async () => {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (result.success) {
          fetchData(); // Refresh data
          showAlert("Đã xóa sản phẩm thành công!", "success");
        } else {
          showAlert("Lỗi: " + result.message, "error");
        }
      } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        showAlert("Không thể kết nối máy chủ để xóa sản phẩm", "error");
      }
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSaveCategory = async (categoryData: any) => {
    if (!categoryData) return;
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      
      const result = await response.json();
      if (result.success) {
        setEditingCategory(null);
        setSubCategoriesInput("");
        fetchData(); // Refresh data
        showAlert("Đã lưu danh mục thành công! ✨", "success");
      } else {
        showAlert("Lỗi: " + result.message, "error");
      }
    } catch (error: any) {
      console.error("Lỗi lưu danh mục:", error);
      showAlert("Không thể kết nối máy chủ để lưu danh mục", "error");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    showConfirm("Bạn có chắc muốn xóa danh mục này?", async () => {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (result.success) {
          if (selectedCategory === id) setSelectedCategory("all");
          fetchData(); // Refresh data
          showAlert("Đã xóa danh mục thành công!", "success");
        } else {
          showAlert("Lỗi: " + result.message, "error");
        }
      } catch (error) {
        console.error("Lỗi xóa danh mục:", error);
        showAlert("Không thể kết nối máy chủ để xóa danh mục", "error");
      }
    });
  };

  const filteredProducts = (liveProducts.length > 0 ? liveProducts : PRODUCTS)
    .filter(p => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesSubCategory = selectedSubCategory === "all" || p.subCategory === selectedSubCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand));
      const matchesPrice = !priceRange || (p.price >= priceRange[0] && p.price <= priceRange[1]);
      return matchesCategory && matchesSubCategory && matchesSearch && matchesBrand && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      // Newest first (using createdAt or ID as fallback)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateA && dateB) return dateB - dateA;
      return String(b.id).localeCompare(String(a.id));
    });

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.account-menu-container')) {
        setShowAccountMenu(false);
      }
      // Close admin menus if clicking outside the relative containers
      if (!(event.target as Element).closest('.relative')) {
        setActiveAdminMenu(null);
        setActiveStatusMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);
  const bannerSlides = categories.filter(c => c.id !== 'all');
  const safeCurrentSlide = bannerSlides.length > 0 ? currentSlide % bannerSlides.length : 0;

  useEffect(() => {
    if (selectedCategory === 'all' && bannerSlides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [selectedCategory, bannerSlides.length]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart
    .filter(item => selectedCartItems.includes(item.product.id))
    .reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const getIcon = (iconName: string) => {
    const props = { className: "w-5 h-5" };
    switch (iconName) {
      case 'Sparkles': return <Sparkles {...props} />;
      case 'PenLine': return <PenLine {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'Palette': return <Palette {...props} />;
      case 'Scissors': return <Scissors {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  return (
    <div className={isAdminView ? "min-h-screen bg-gray-50 p-8 font-sans" : "min-h-screen flex flex-col font-sans bg-[#fffcfd] selection:bg-primary/30 selection:text-primary-dark relative overflow-x-hidden"}>
      <AnimatePresence>
        {!isAuthReady && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6"
          >
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 overflow-hidden border-4 border-primary-light shadow-2xl p-2 animate-pulse">
              <img src={settings.mascotImage} className="w-full h-full object-contain" onError={(e) => (e.target as HTMLImageElement).src = "https://picsum.photos/seed/pink-panther/400/400"} />
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 bg-primary-dark rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 bg-primary-dark rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 bg-primary-dark rounded-full" />
              </div>
              <p className="text-primary-dark font-black uppercase tracking-widest text-sm">
                {connectionError ? "Lỗi kết nối máy chủ!" : "Đang tải thế giới HanaChiBi..."}
              </p>
              {connectionError && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-center max-w-md">
                  <p className="text-red-500 text-xs font-bold mb-2">{connectionError}</p>
                  <p className="text-gray-500 text-[10px]">Vui lòng kiểm tra lại kết nối mạng hoặc máy chủ của bạn.</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-600 transition-all"
                  >
                    Thử lại ngay
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isAdminView ? (
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <h2 className="text-4xl font-black text-gray-900">Quản trị HanaChiBi 🐾</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setAdminTab('orders')} 
                className={`px-8 py-3 rounded-2xl font-black transition-all ${adminTab === 'orders' ? 'bg-primary-dark text-white' : 'bg-white text-gray-400'}`}
              >
                Đơn hàng
              </button>
              <button 
                onClick={() => { setAdminTab('products'); }} 
                className={`px-8 py-3 rounded-2xl font-black transition-all ${adminTab === 'products' ? 'bg-primary-dark text-white' : 'bg-white text-gray-400'}`}
              >
                Sản phẩm
              </button>
              <button 
                onClick={() => setAdminTab('categories')} 
                className={`px-8 py-3 rounded-2xl font-black transition-all ${adminTab === 'categories' ? 'bg-primary-dark text-white' : 'bg-white text-gray-400'}`}
              >
                Danh mục
              </button>
              <button 
                onClick={() => setAdminTab('settings')} 
                className={`px-8 py-3 rounded-2xl font-black transition-all ${adminTab === 'settings' ? 'bg-primary-dark text-white' : 'bg-white text-gray-400'}`}
              >
                Cài đặt
              </button>
              <button onClick={() => { toggleAdminView(false); setOrderDetail(null); setShowCancelModal(null); }} className="btn-primary px-8">Quay lại Shop</button>
            </div>
          </div>
          
          {adminTab === 'orders' ? (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-grow relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text"
                    placeholder="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng..."
                    value={adminOrderSearch}
                    onChange={e => setAdminOrderSearch(e.target.value)}
                    className="w-full pl-16 pr-8 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-primary-light outline-none font-bold shadow-sm transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl shadow-sm">
                  {["Tất cả", "Chờ xác nhận", "Chờ lấy hàng", "Chờ giao hàng", "Đã giao", "Trả hàng", "Đã hủy"].map(status => (
                    <button 
                      key={status}
                      onClick={() => setSelectedOrderStatus(status)}
                      className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${selectedOrderStatus === status ? 'bg-primary-dark text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                {orders.filter(o => {
                  const matchesStatus = selectedOrderStatus === "Tất cả" || o.status === selectedOrderStatus;
                  const matchesSearch = o.id.toString().includes(adminOrderSearch) || o.customer.name.toLowerCase().includes(adminOrderSearch.toLowerCase());
                  return matchesStatus && matchesSearch;
                }).length === 0 ? (
                  <div className="bg-white p-20 rounded-[3rem] text-center shadow-sm">
                    <p className="text-gray-400 font-bold text-xl">Chưa có đơn hàng nào trong mục này...</p>
                  </div>
                ) : (
                  orders
                    .filter(o => {
                      const matchesStatus = selectedOrderStatus === "Tất cả" || o.status === selectedOrderStatus;
                      const matchesSearch = o.id.toString().includes(adminOrderSearch) || o.customer.name.toLowerCase().includes(adminOrderSearch.toLowerCase());
                      return matchesStatus && matchesSearch;
                    })
                    .sort((a, b) => b.id - a.id)
                    .map(order => (
                      <div key={order.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-primary-light/20 group hover:border-primary-light transition-all">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="bg-primary-light text-primary-dark px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">#{order.id}</span>
                              <span className="text-gray-400 text-xs font-bold">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                              <div className="relative">
                                <button 
                                  onClick={() => setActiveStatusMenu(activeStatusMenu === order.id ? null : order.id)}
                                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                    order.status === 'Đã giao' ? 'bg-green-100 text-green-600' :
                                    order.status === 'Đã hủy' ? 'bg-red-100 text-red-600' :
                                    order.status === 'Chờ xác nhận' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-blue-100 text-blue-600'
                                  }`}
                                >
                                  {order.status}
                                </button>
                                <AnimatePresence>
                                  {activeStatusMenu === order.id && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 10 }}
                                      className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-2xl p-2 z-50 border-2 border-gray-50 min-w-[180px] grid grid-cols-1 gap-1"
                                    >
                                      {["Chờ xác nhận", "Chờ lấy hàng", "Chờ giao hàng", "Đã giao", "Trả hàng", "Đã hủy"].map(s => (
                                        <button 
                                          key={s}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateOrderStatus(order.id, { status: s });
                                            setActiveStatusMenu(null);
                                          }}
                                          className="text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-light/20 text-gray-500 hover:text-primary-dark transition-all"
                                        >
                                          Chuyển sang: {s}
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                            <h4 className="text-2xl font-black text-gray-900">{order.customer.name}</h4>
                            <div className="flex flex-col gap-1">
                              <p className="text-gray-500 font-bold flex items-center gap-2"><Phone className="w-4 h-4" /> {order.customer.phone}</p>
                              <p className="text-gray-500 font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> {order.customer.address}</p>
                            </div>
                            {order.customer.note && (
                              <div className="bg-primary-light/10 p-4 rounded-2xl border-l-4 border-primary-dark">
                                <p className="text-primary-dark font-bold italic text-sm">" {order.customer.note} "</p>
                              </div>
                            )}
                          </div>
                          <div className="text-right flex flex-col justify-between items-end">
                            <div className="space-y-1">
                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tổng thanh toán:</p>
                              <p className="text-3xl font-black text-primary-dark">{order.total.toLocaleString('vi-VN')}đ</p>
                              {order.discount > 0 && <p className="text-xs font-bold text-green-500">Đã giảm: {order.discount.toLocaleString('vi-VN')}đ</p>}
                            </div>
                            <div className="flex gap-3 mt-6 relative">
                              {order.status === 'Chờ xác nhận' && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id, { status: 'Chờ lấy hàng' })}
                                  className="px-6 py-3 rounded-xl bg-primary-dark text-white text-xs font-black uppercase tracking-widest hover:bg-primary-dark/90 transition-all shadow-lg shadow-primary-dark/20 flex items-center gap-2"
                                >
                                  <Check className="w-4 h-4" /> Xác nhận đơn
                                </button>
                              )}
                              <button 
                                onClick={() => setActiveAdminMenu(activeAdminMenu === order.id ? null : order.id)}
                                className={`p-3 rounded-xl transition-all ${activeAdminMenu === order.id ? 'bg-primary-light text-primary-dark' : 'bg-gray-50 text-gray-400 hover:bg-primary-light/20 hover:text-primary-dark'}`}
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                              <AnimatePresence>
                                {activeAdminMenu === order.id && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full right-0 mb-2 bg-white shadow-2xl rounded-2xl p-2 z-50 border-2 border-gray-50 min-w-[180px]"
                                  >
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOrderDetail(order);
                                        setActiveAdminMenu(null);
                                      }}
                                      className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-light/20 text-gray-500 hover:text-primary-dark transition-all flex items-center gap-3"
                                    >
                                      <Eye className="w-4 h-4" /> Chi tiết
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        try { window.print(); } catch(err) { console.error(err); }
                                        setActiveAdminMenu(null);
                                      }}
                                      className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-light/20 text-gray-500 hover:text-primary-dark transition-all flex items-center gap-3"
                                    >
                                      <Printer className="w-4 h-4" /> In hóa đơn
                                    </button>
                                    {order.status !== 'Đã hủy' && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCancellingOrder(order);
                                          setShowCancelModal({ orderId: order.id, type: 'admin' });
                                          setCancelStep('confirm');
                                          setActiveAdminMenu(null);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 text-red-400 hover:text-red-600 transition-all flex items-center gap-3"
                                      >
                                        <Trash2 className="w-4 h-4" /> Hủy đơn
                                      </button>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 pt-8 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {order.items.map((item: any) => (
                            <div key={item.product.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-[1.5rem] border border-gray-100">
                              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                                <img src={item.product.image} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-gray-800 line-clamp-1">{item.product.name}</p>
                                <p className="text-xs font-bold text-gray-400">Số lượng: {item.quantity} • {item.product.price.toLocaleString('vi-VN')}đ</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          ) : adminTab === 'products' ? (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-800">Danh sách sản phẩm ({liveProducts.length})</h3>
                <button 
                  onClick={() => {
                    const firstCat = categories.find(c => c.id !== 'all');
                    setEditingProduct({ 
                      name: "", 
                      price: 0, 
                      category: firstCat?.id || "other", 
                      image: "https://picsum.photos/seed/new/600/600", 
                      description: "", 
                      rating: 5, 
                      reviews: 0 
                    });
                  }}
                  className="btn-primary px-8"
                >
                  Thêm sản phẩm mới 🐾
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveProducts.map(product => (
                  <div key={product.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm flex gap-4 items-center border-2 border-transparent hover:border-primary-light transition-all">
                    <img src={product.image} className="w-24 h-24 rounded-2xl object-cover" />
                    <div className="flex-grow">
                      <h4 className="font-bold text-gray-800 line-clamp-1">{product.name}</h4>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full uppercase tracking-widest">
                          {categories.find(c => c.id === product.category)?.name || "Chưa phân loại"}
                        </span>
                        {product.subCategory && (
                          <span className="text-[10px] font-black px-2 py-0.5 bg-primary-light/20 text-primary-dark rounded-full uppercase tracking-widest">
                            {product.subCategory}
                          </span>
                        )}
                      </div>
                      <p className="text-primary-dark font-black">{product.price.toLocaleString('vi-VN')}đ</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setEditingProduct(product)} className="text-xs font-black text-blue-500 hover:underline">Sửa</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-xs font-black text-red-500 hover:underline">Xóa</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : adminTab === 'settings' ? (
            <div className="max-w-4xl mx-auto space-y-12">
              {!isSettingsLoaded ? (
                <div className="bg-white p-20 rounded-[3rem] shadow-sm border-2 border-primary-light/20 flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 border-4 border-primary-light border-t-primary rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-black animate-pulse">Đang tải cài đặt hệ thống... 🐾</p>
                </div>
              ) : (
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border-2 border-primary-light/20">
                  <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-primary-dark" /> Cài đặt giao diện 🐾
                  </h3>
                  
                  <div className="space-y-10">
                    {/* Debug Info for Admin */}
                    <div className="bg-blue-50 p-4 rounded-2xl text-[10px] font-mono text-blue-600 flex justify-between items-center">
                      <span>ADMIN DEBUG: {user?.email} | Role: {user?.role}</span>
                      <span className="bg-blue-200 px-2 py-0.5 rounded-full">Verified: {user?.emailVerified ? 'YES' : 'NO'}</span>
                    </div>

                    {/* Logo Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Logo cửa hàng</label>
                      <p className="text-sm text-gray-500 font-medium">Logo hiển thị trên thanh điều hướng và các trang chính.</p>
                      <div className="mt-4 flex items-center gap-6">
                        <div className="w-24 h-24 bg-white rounded-3xl border-2 border-primary-light shadow-sm flex items-center justify-center overflow-hidden relative group transition-all hover:shadow-md">
                          <img src={settings.logo} className="w-full h-full object-contain p-3" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const imageUrl = await uploadImage(file, "settings");
                                    await updateSettings({ logo: imageUrl });
                                  } catch (error) {
                                    console.error("Lỗi tải logo:", error);
                                    showAlert("Lỗi tải logo. Vui lòng thử lại.", "error");
                                  }
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <input 
                          value={settings.logo}
                          onChange={e => setSettings(prev => ({...prev, logo: e.target.value}))}
                          className="flex-grow px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light outline-none font-bold"
                          placeholder="Link logo..."
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-50" />

                  {/* Login Banner */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Banner trang đăng nhập</label>
                      <p className="text-sm text-gray-500 font-medium">Hình ảnh và nội dung hiển thị khi khách hàng chưa đăng nhập.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Banner đăng nhập</label>
                        <div className="flex gap-4">
                          <input 
                            value={settings.loginBanner}
                            onChange={e => setSettings(prev => ({...prev, loginBanner: e.target.value}))}
                            className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light outline-none font-bold"
                            placeholder="Link banner đăng nhập..."
                          />
                          <div className="relative">
                            <button type="button" className="h-full px-6 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-2">
                              <Upload className="w-5 h-5" /> Tải lên
                            </button>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const imageUrl = await uploadImage(file, "settings");
                                    await updateSettings({ loginBanner: imageUrl });
                                  } catch (error: any) {
                                    console.error("Lỗi tải banner đăng nhập:", error);
                                    showAlert("Lỗi tải banner: " + (error.message || "Lỗi không xác định"), "error");
                                  }
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                        {settings.loginBanner && (
                          <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-primary-light">
                            <img src={settings.loginBanner} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Câu khẩu hiệu (Slogan)</label>
                        <textarea 
                          value={settings.loginBannerText}
                          onChange={e => setSettings(prev => ({...prev, loginBannerText: e.target.value}))}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light outline-none font-bold h-32 resize-none"
                          placeholder="Cùng HaniChibi viết nên ước mơ..."
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-50" />

                  {/* Mascot Settings */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Linh vật (Mascot)</label>
                      <p className="text-sm text-gray-500 font-medium">Hình ảnh linh vật và lời chào hiển thị trong form đăng nhập.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <div className="relative w-40 h-40 rounded-full bg-white border-4 border-primary-light shadow-xl flex items-center justify-center overflow-hidden group mx-auto md:mx-0">
                          <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-primary-light/20">
                            <img 
                              key={settings.mascotImage} 
                              src={settings.mascotImage} 
                              className="w-full h-full object-contain p-2" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://picsum.photos/seed/pink-panther/400/400";
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const imageUrl = await uploadImage(file, "settings");
                                    await updateSettings({ mascotImage: imageUrl });
                                  } catch (error: any) {
                                    console.error("Lỗi tải mascot:", error);
                                    showAlert("Lỗi tải mascot: " + (error.message || "Lỗi không xác định"), "error");
                                  }
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <input 
                          value={settings.mascotImage}
                          onChange={e => setSettings(prev => ({ ...prev, mascotImage: e.target.value }))}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light outline-none font-bold"
                          placeholder="Link ảnh linh vật..."
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lời chào linh vật</label>
                        <textarea 
                          value={settings.mascotText}
                          onChange={e => setSettings(prev => ({ ...prev, mascotText: e.target.value }))}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light outline-none font-bold h-32 resize-none"
                          placeholder="Pink panther đang đợi bạn đây nhé..."
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-50" />

                  {/* QR Code Settings */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mã QR Thanh toán</label>
                      <p className="text-sm text-gray-500 font-medium">Tải lên mã QR ngân hàng của bạn để khách hàng quét khi thanh toán.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="relative w-48 aspect-square rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group">
                        {settings.qrCode ? (
                          <img src={settings.qrCode} className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-[10px] font-bold text-gray-400">Tải mã QR</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const imageUrl = await uploadImage(file, "settings");
                                await updateSettings({ qrCode: imageUrl });
                              } catch (error) {
                                console.error("Lỗi tải mã QR:", error);
                                showAlert("Lỗi tải mã QR. Vui lòng thử lại.", "error");
                              }
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex-grow space-y-4 w-full">
                        <input 
                          value={settings.qrCode}
                          onChange={e => setSettings(prev => ({...prev, qrCode: e.target.value}))}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light outline-none font-bold"
                          placeholder="Hoặc dán link mã QR..."
                        />
                        <p className="text-xs text-gray-400 italic font-medium">* Nếu để trống, hệ thống sẽ tự động tạo mã QR mặc định của shop.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10">
                    <button 
                      onClick={() => handleSaveSettings(settings)}
                      className="w-full btn-primary py-5 text-lg shadow-2xl shadow-primary/30"
                    >
                      Lưu tất cả thay đổi ✨
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-800">Quản lý danh mục ({categories.length})</h3>
                <button 
                  onClick={() => {
                    setEditingCategory({ id: `cat-${Date.now()}`, name: "", icon: "Sparkles", image: "", banner: "", subCategories: [] });
                    setSubCategoriesInput("");
                  }}
                  className="btn-primary px-8 py-4 flex items-center gap-3 shadow-xl"
                >
                  <Sparkles className="w-5 h-5" /> Thêm danh mục mới
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-primary-light/20 group hover:border-primary-light transition-all">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-primary-light/20 rounded-2xl flex items-center justify-center text-primary-dark overflow-hidden border-2 border-gray-50">
                        {cat.image ? (
                          <img src={cat.image} className="w-full h-full object-cover" />
                        ) : (
                          getIcon(cat.icon)
                        )}
                      </div>
                      <h4 className="text-xl font-black text-gray-900">{cat.name}</h4>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Danh mục con:</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.subCategories.map(sub => (
                          <span key={sub} className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-500">{sub}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-8 flex gap-4">
                      <button 
                        onClick={() => {
                          setEditingCategory(cat);
                          setSubCategoriesInput(cat.subCategories.join(", "));
                        }}
                        className="text-xs font-black text-blue-500 hover:underline uppercase tracking-widest"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-xs font-black text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Edit Modal */}
              <AnimatePresence>
                {editingCategory && (
                  <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingCategory(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10"
                    >
                      <h3 className="text-2xl font-black text-gray-900 mb-8">Danh mục 🐾</h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveCategory({
                          ...editingCategory,
                          subCategories: subCategoriesInput.split(",").map(s => s.trim()).filter(s => s !== "")
                        });
                      }} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Tên danh mục</label>
                          <input 
                            required
                            value={editingCategory.name}
                            onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light outline-none font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Danh mục con (cách nhau bằng dấu phẩy)</label>
                          <input 
                            value={subCategoriesInput}
                            onChange={e => setSubCategoriesInput(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light outline-none font-bold"
                            placeholder="Bút bi, Bút chì..."
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ảnh đại diện</label>
                            <div className="flex gap-2">
                              <input 
                                placeholder="Link ảnh..."
                                value={editingCategory.image || ""}
                                onChange={e => setEditingCategory({...editingCategory, image: e.target.value})}
                                className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light outline-none font-bold"
                              />
                              <div className="relative">
                                <button type="button" className="h-full px-4 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                                  <Upload className="w-5 h-5" />
                                </button>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleCategoryImageUpload(e, 'image')}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ảnh Banner</label>
                            <div className="flex gap-2">
                              <input 
                                placeholder="Link banner..."
                                value={editingCategory.banner || ""}
                                onChange={e => setEditingCategory({...editingCategory, banner: e.target.value})}
                                className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light outline-none font-bold"
                              />
                              <div className="relative">
                                <button type="button" className="h-full px-4 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                                  <Upload className="w-5 h-5" />
                                </button>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleCategoryImageUpload(e, 'banner')}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                          <button type="button" onClick={() => setEditingCategory(null)} className="flex-1 p-4 rounded-2xl bg-gray-100 text-gray-500 font-bold">Hủy</button>
                          <button type="submit" className="flex-1 btn-primary">Lưu lại</button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Product Edit Modal */}
          <AnimatePresence>
            {editingProduct && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingProduct(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto"
                >
                  <h3 className="text-3xl font-black text-gray-900 mb-8">{editingProduct.id ? "Sửa sản phẩm" : "Thêm sản phẩm"} 🐾</h3>
                  <form onSubmit={handleSaveProduct} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Tên sản phẩm</label>
                          <input 
                            required
                            value={editingProduct.name}
                            onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                            className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Giá bán (VNĐ)</label>
                            <input 
                              required
                              type="number"
                              value={editingProduct.price}
                              onChange={e => setEditingProduct({...editingProduct, price: parseInt(e.target.value)})}
                              className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Giá gốc (nếu giảm)</label>
                            <input 
                              type="number"
                              value={editingProduct.originalPrice || ""}
                              onChange={e => setEditingProduct({...editingProduct, originalPrice: parseInt(e.target.value) || undefined})}
                              className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Danh mục</label>
                          <select 
                            value={editingProduct.category}
                            onChange={e => setEditingProduct({...editingProduct, category: e.target.value, subCategory: ""})}
                            className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold appearance-none"
                          >
                            {categories.filter(c => c.id !== 'all').length === 0 && (
                              <option value="">Đang tải danh mục...</option>
                            )}
                            {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Loại sản phẩm (Dòng)</label>
                          <select 
                            value={editingProduct.subCategory || ""}
                            onChange={e => setEditingProduct({...editingProduct, subCategory: e.target.value})}
                            className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold appearance-none"
                          >
                            <option value="">-- Chọn loại sản phẩm --</option>
                            {categories.find(c => c.id === editingProduct.category)?.subCategories?.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                            {(!editingProduct.category || !categories.find(c => c.id === editingProduct.category)?.subCategories?.length) && (
                              <option value="" disabled>Vui lòng chọn danh mục trước</option>
                            )}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Thương hiệu</label>
                          <select 
                            value={editingProduct.brand || ""}
                            onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})}
                            className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold appearance-none"
                          >
                            <option value="">Chọn thương hiệu</option>
                            {["Thiên Long", "Flexoffice", "Điểm 10", "Colokit", "HanaChiBi"].map(brand => (
                              <option key={brand} value={brand}>{brand}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-primary-light/10 rounded-2xl">
                          <input 
                            type="checkbox"
                            id="isFlashSale"
                            checked={editingProduct.isFlashSale || false}
                            onChange={e => setEditingProduct({...editingProduct, isFlashSale: e.target.checked})}
                            className="w-6 h-6 rounded-lg accent-primary-dark"
                          />
                          <label htmlFor="isFlashSale" className="font-black text-primary-dark cursor-pointer">Hiển thị trong Flash Sale ⚡</label>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Hình ảnh sản phẩm</label>
                          <div className="flex gap-4">
                            <input 
                              required
                              placeholder="Dán link ảnh vào đây..."
                              value={editingProduct.image}
                              onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                              className="flex-1 px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold"
                            />
                            <div className="relative">
                              <button type="button" className="h-full px-6 rounded-2xl bg-primary-light/20 text-primary-dark font-black hover:bg-primary-light transition-all flex items-center gap-2">
                                <Upload className="w-5 h-5" /> Tải lên
                              </button>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleProductImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 ml-4 italic">* Bạn có thể dán link ảnh hoặc tải trực tiếp từ máy tính.</p>
                          {editingProduct.image && (
                            <div className="mt-4 aspect-square rounded-2xl overflow-hidden border-2 border-primary-light">
                              <img src={editingProduct.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Mô tả sản phẩm</label>
                      <textarea 
                        required
                        value={editingProduct.description}
                        onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                        className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold h-32 resize-none"
                      />
                    </div>
                    <div className="flex gap-4 pt-6">
                      <button type="button" onClick={() => setEditingProduct(null)} className="flex-grow py-4 rounded-2xl bg-gray-100 text-gray-500 font-black">Hủy</button>
                      <button type="submit" className="flex-grow btn-primary">Lưu sản phẩm ✨</button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
          {/* Background Paw Prints Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        {decorationPositions.map((pos, i) => (
          <div 
            key={i} 
            className="absolute"
            style={{ 
              top: pos.top, 
              left: pos.left,
              transform: `rotate(${pos.rotation}) scale(${pos.scale})`
            }}
          >
            <div className="w-10 h-10 bg-primary rounded-full mb-2 ml-5" />
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-primary rounded-full" />
              <div className="w-8 h-8 bg-primary rounded-full" />
              <div className="w-8 h-8 bg-primary rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className="bg-primary-dark text-white text-center py-2 text-xs sm:text-sm font-bold tracking-wide">
        🌸 CHÀO MỪNG BẠN ĐẾN VỚI THẾ GIỚI CUTE HANACHIBI! MIỄN PHÍ SHIP ĐƠN TỪ 200K • TẶNG 10 XU CHO MỖI 100K 🌸
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-lg py-2" : "bg-white py-4"}`}>
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Logo Section */}
            <div className="flex items-center gap-4 cursor-pointer group shrink-0" onClick={() => {
              setSelectedCategory("all");
              const now = Date.now();
              const lastClick = (window as any)._lastLogoClick || 0;
              const count = (window as any)._logoClickCount || 0;
              if (now - lastClick < 500) {
                (window as any)._logoClickCount = count + 1;
                if (count + 1 >= 5) {
                  setShowAdminPasswordModal(true);
                  (window as any)._logoClickCount = 0;
                }
              } else {
                (window as any)._logoClickCount = 1;
              }
              (window as any)._lastLogoClick = now;
            }}>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white flex items-center justify-center rounded-2xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 overflow-hidden border-2 border-primary-light">
                <img src={settings.logo} alt="HanaChiBi" className="w-full h-full object-contain p-1.5" onError={(e) => (e.target as HTMLImageElement).src = "https://picsum.photos/seed/hanachibi/200/200"} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-black text-primary-dark leading-none tracking-tight uppercase italic">HanaChiBi</h1>
              </div>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="flex-grow max-w-2xl hidden md:block relative">
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 border-2 border-transparent focus-within:border-primary-dark/30 transition-all">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sản phẩm..." 
                  className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchTrends(true)}
                  onBlur={() => setTimeout(() => setShowSearchTrends(false), 200)}
                />
                <Search className="w-5 h-5 text-gray-500 cursor-pointer" />
              </div>

              <AnimatePresence>
                {showSearchTrends && !searchQuery && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-[60]"
                  >
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Xu hướng tìm kiếm 🐾</h4>
                    <div className="flex flex-wrap gap-2">
                      {trendingKeywords.map(keyword => (
                        <button 
                          key={keyword}
                          onClick={() => setSearchQuery(keyword)}
                          className="px-4 py-2 bg-gray-50 hover:bg-primary-light/20 text-gray-600 hover:text-primary-dark rounded-xl text-xs font-bold transition-all"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Trigger */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-primary-dark transition-colors"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Actions */}
            <div className="flex items-center gap-6 shrink-0">
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center text-primary-dark">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Hỗ trợ khách hàng</p>
                  <p className="text-sm font-black text-gray-900">039 6265 421</p>
                </div>
              </div>
              
              <div className="relative account-menu-container">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-primary-light transition-colors overflow-hidden border-2 border-transparent group-hover:border-primary-light">
                    {user?.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase">{user ? 'Chào bạn,' : 'Tài khoản'}</p>
                    <p className="text-sm font-black text-gray-900">{user ? user.name : 'Đăng nhập'}</p>
                  </div>
                </div>

                <AnimatePresence>
                  {showAccountMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      {user ? (
                        <div className="p-2">
                          <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase">Đang đăng nhập</p>
                            <p className="text-sm font-black text-primary-dark truncate">{user.name}</p>
                          </div>
                          <div className="p-2 border-b border-gray-50 mb-1">
                            <label className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-primary-light/20 rounded-xl transition-colors cursor-pointer">
                              <Upload className="w-4 h-4" /> Đổi ảnh đại diện
                              <input type="file" accept="image/*" onChange={handleUserAvatarUpload} className="hidden" />
                            </label>
                          </div>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <X className="w-4 h-4" /> Đăng xuất
                          </button>
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          <button 
                            onClick={() => {
                              setAuthMode('login');
                              setShowLogin(true);
                              setShowAccountMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-primary-light/20 rounded-xl transition-colors"
                          >
                            <User className="w-4 h-4" /> Đăng nhập
                          </button>
                          <button 
                            onClick={() => {
                              setAuthMode('register');
                              setShowLogin(true);
                              setShowAccountMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-primary-light/20 rounded-xl transition-colors"
                          >
                            <Sparkles className="w-4 h-4" /> Đăng ký
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                className="relative p-2 text-gray-600 hover:text-primary-dark transition-colors"
                onClick={() => setShowMyOrders(true)}
              >
                <Printer className="w-6 h-6" />
                <span className="hidden sm:block text-[10px] font-black text-gray-400 uppercase mt-1">Đơn hàng</span>
              </button>

              <button 
                className="relative p-2 text-gray-600 hover:text-primary-dark transition-colors"
                onClick={() => setShowCart(true)}
              >
                <ShoppingBag className="w-7 h-7" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mt-4 overflow-hidden"
              >
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm sản phẩm..." 
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-light"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sub Nav */}
          <nav className="mt-4 border-t pt-4 flex items-center gap-4 overflow-x-auto no-scrollbar lg:gap-8">
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedSubCategory("all");
                }}
                className={`text-sm font-black uppercase tracking-wider flex items-center gap-3 transition-colors shrink-0 ${selectedCategory === cat.id ? 'text-primary-dark' : 'text-gray-600 hover:text-primary'}`}
              >
                {cat.image ? (
                  <img src={cat.image} className="w-6 h-6 rounded-lg object-cover border border-gray-100" />
                ) : (
                  getIcon(cat.icon)
                )}
                <span className="whitespace-nowrap">{cat.name}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${selectedCategory === cat.id ? 'rotate-90' : ''}`} />
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-3 border-b">
        <div className="container mx-auto px-4 flex items-center gap-2 text-xs font-bold text-gray-400">
          <span className="hover:text-primary-dark cursor-pointer" onClick={() => { setSelectedCategory("all"); setSelectedSubCategory("all"); }}>Trang chủ</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-primary-dark cursor-pointer" onClick={() => setSelectedSubCategory("all")}>
            {categories.find(c => c.id === selectedCategory)?.name || "Tất cả"}
          </span>
          {selectedSubCategory !== "all" && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary-dark">{selectedSubCategory}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Slider Section (Moving Banner) - Only shown when logged in */}
        {user && selectedCategory === "all" && !searchQuery && (
          <section className="relative h-[400px] md:h-[600px] overflow-hidden bg-gray-50">
            {bannerSlides.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={safeCurrentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <div className="relative w-full h-full">
                    <img 
                      src={bannerSlides[safeCurrentSlide]?.banner || `https://picsum.photos/seed/${bannerSlides[safeCurrentSlide]?.id}-hero/1920/800`} 
                      alt={bannerSlides[safeCurrentSlide]?.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-center px-4">
                        <motion.div
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h2 className="text-5xl md:text-8xl font-black text-white mb-6 uppercase tracking-tighter italic drop-shadow-2xl">
                            {bannerSlides[safeCurrentSlide]?.name}
                          </h2>
                          <button 
                            onClick={() => setSelectedCategory(bannerSlides[safeCurrentSlide]?.id)}
                            className="px-12 py-4 bg-white text-gray-900 rounded-full font-black text-sm uppercase tracking-widest hover:bg-primary-light hover:text-primary-dark transition-all shadow-2xl hover:scale-110 active:scale-95"
                          >
                            Khám phá ngay
                          </button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-primary-dark mx-auto mb-4 animate-bounce" />
                  <p className="text-gray-400 font-black uppercase tracking-widest">Đang tải banner... 🐾</p>
                </div>
              </div>
            )}

            {bannerSlides.length > 1 && (
              <>
                {/* Slider Indicators */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                  {bannerSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-500 ${safeCurrentSlide === index ? 'w-12 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button 
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-20 border border-white/30"
                >
                  <ChevronRight className="w-8 h-8 rotate-180" />
                </button>
                <button 
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-20 border border-white/30"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </section>
        )}

        {/* Welcome Section (Static Banner - only shown when not logged in and no search) */}
        {!user && selectedCategory === "all" && !searchQuery && (
          <section className="relative h-[400px] md:h-[600px] overflow-hidden bg-gray-50 border-t border-gray-100">
            <div className="relative w-full h-full">
              <img 
                src={settings.loginBanner} 
                alt="HanaChiBi Banner" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://picsum.photos/seed/hanachibi-main/1000/800";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent flex items-center">
                <div className="w-full max-w-[1800px] mx-auto px-8 md:px-16 lg:px-20">
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-left"
                  >
                    <div className="mb-8">
                      <h2 className="text-5xl md:text-7xl font-black text-[#c5b4e3] leading-[1.1] tracking-tight drop-shadow-sm">
                        Cùng HanaChiBi viết <br />
                        nên ước mơ
                      </h2>
                      <h2 className="text-6xl md:text-9xl font-black text-primary mt-2 leading-none tracking-tighter drop-shadow-md">
                        HanaChiBi
                      </h2>
                    </div>
                    
                    <p className="text-gray-500 font-semibold text-lg md:text-xl mb-10 max-w-xl leading-relaxed opacity-80">
                      Khám phá bộ sưu tập văn phòng phẩm pastel ngọt <br className="hidden md:block" />
                      ngào, chất lượng vượt trội dành riêng cho các bạn học <br className="hidden md:block" />
                      sinh, sinh viên.
                    </p>

                    <button 
                      onClick={() => setShowLogin(true)}
                      className="px-14 py-5 bg-[#ffb7c5] text-white rounded-full font-black text-lg uppercase tracking-widest hover:bg-[#ff8fa3] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-pink-200/50 flex items-center gap-2"
                    >
                      KHÁM PHÁ NGAY ✨
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        )}


        {/* Flash Sale Section */}
        {selectedCategory === "all" && !searchQuery && (
          <section className="py-12 bg-white relative overflow-hidden">
            <div className="max-w-[1800px] mx-auto px-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-[3rem] p-8 md:p-12 border-2 border-red-100 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col items-center justify-center mb-10 gap-8 relative z-10">
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-5xl md:text-7xl font-black text-red-600 italic tracking-tighter flex items-center gap-4 mb-2">
                      <Zap className="w-12 h-12 md:w-16 md:h-16 fill-current animate-pulse" /> FLASH SALE
                    </h3>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <p className="text-sm font-black text-red-400 uppercase tracking-widest">Kết thúc sau:</p>
                      <div className="flex gap-2">
                        {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((unit, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl border border-white/20">
                              {unit.toString().padStart(2, '0')}
                            </div>
                            {i < 2 && <span className="text-2xl font-black text-red-600">:</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="px-10 py-4 bg-red-600 text-white rounded-full font-black text-sm hover:bg-red-700 transition-all shadow-xl flex items-center gap-3 group">
                    Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                  {(liveProducts.length > 0 ? liveProducts.filter(p => p.isFlashSale) : FLASH_SALE_PRODUCTS).slice(0, 5).map((product) => (
                    <div key={product.id} className="bg-white rounded-[2.5rem] p-5 shadow-xl relative group hover:-translate-y-2 transition-all duration-500 border-2 border-transparent hover:border-red-200">
                      {product.originalPrice && product.price < product.originalPrice && (
                        <div className="absolute top-4 right-4 z-10 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-xl shadow-lg">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </div>
                      )}
                      <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 bg-gray-50 relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button 
                            onClick={() => setQuickViewProduct(product)}
                            className="w-12 h-12 bg-white text-red-600 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                            title="Xem nhanh"
                          >
                            <Eye className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => addToCart(product)}
                            className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                            title="Thêm vào giỏ"
                          >
                            <ShoppingCart className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-1 group-hover:text-red-600 transition-colors">{product.name}</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-black text-red-600">{product.price.toLocaleString('vi-VN')}đ</span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through font-bold">{product.originalPrice.toLocaleString('vi-VN')}đ</span>
                        )}
                      </div>
                      <div className="h-4 bg-red-100 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                          style={{ width: `${Math.max(20, ((product.soldCount || 0) / (product.totalStock || 100)) * 100)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                            {((product.soldCount || 0) / (product.totalStock || 100)) * 100 > 80 ? 'Sắp cháy 🔥' : `Đã bán ${product.soldCount || 0}`}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          addToCart(product);
                          setShowCheckout(true);
                        }}
                        className="w-full mt-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                      >
                        Đặt hàng ngay
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        <section className="py-12 bg-white">
          <div className="max-w-[1800px] mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Sidebar Filters */}
              {selectedCategory !== "all" && !searchQuery && (
                <aside className="w-full lg:w-64 shrink-0 space-y-10">
                  <div>
                    <h4 className="text-sm font-black text-primary-dark uppercase tracking-widest mb-6 border-b-2 border-primary-light pb-2">Loại sản phẩm</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="subcategory"
                          checked={selectedSubCategory === "all"}
                          onChange={() => setSelectedSubCategory("all")}
                          className="w-5 h-5 accent-primary-dark" 
                        />
                        <span className={`text-sm font-bold transition-colors ${selectedSubCategory === "all" ? 'text-primary-dark' : 'text-gray-500 group-hover:text-primary'}`}>
                          {selectedCategory === "all" ? "Tất cả sản phẩm" : `Tất cả ${categories.find(c => c.id === selectedCategory)?.name}`}
                        </span>
                      </label>
                      {Array.from(new Set(selectedCategory === "all" 
                        ? categories.flatMap(c => c.subCategories || [])
                        : categories.find(c => c.id === selectedCategory)?.subCategories || []
                      )).map(sub => (
                        <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="subcategory"
                            checked={selectedSubCategory === sub}
                            onChange={() => setSelectedSubCategory(sub)}
                            className="w-5 h-5 accent-primary-dark" 
                          />
                          <span className={`text-sm font-bold transition-colors ${selectedSubCategory === sub ? 'text-primary-dark' : 'text-gray-500 group-hover:text-primary'}`}>{sub}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-primary-dark uppercase tracking-widest mb-6 border-b-2 border-primary-light pb-2">Thương hiệu</h4>
                    <div className="space-y-3">
                      {["Thiên Long", "Flexoffice", "Điểm 10", "Colokit", "HanaChiBi"].map(brand => (
                        <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-5 h-5 accent-primary-dark" 
                          />
                          <span className={`text-sm font-bold transition-colors ${selectedBrands.includes(brand) ? 'text-primary-dark' : 'text-gray-500 group-hover:text-primary'}`}>{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-primary-dark uppercase tracking-widest mb-6 border-b-2 border-primary-light pb-2">Mức giá</h4>
                    <div className="space-y-3">
                      {[
                        { label: "Tất cả mức giá", range: null },
                        { label: "Dưới 20.000đ", range: [0, 20000] },
                        { label: "20.000đ - 50.000đ", range: [20000, 50000] },
                        { label: "50.000đ - 100.000đ", range: [50000, 100000] },
                        { label: "Trên 100.000đ", range: [100000, 1000000] }
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="priceRange"
                            checked={JSON.stringify(priceRange) === JSON.stringify(item.range)}
                            onChange={() => setPriceRange(item.range as [number, number] | null)}
                            className="w-5 h-5 accent-primary-dark" 
                          />
                          <span className={`text-sm font-bold transition-colors ${JSON.stringify(priceRange) === JSON.stringify(item.range) ? 'text-primary-dark' : 'text-gray-500 group-hover:text-primary'}`}>
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </aside>
              )}

              {/* Main Products Area */}
              <div className="flex-grow">
                {selectedCategory === "all" && !searchQuery ? (
                  <div className="space-y-24">
                    {categories.filter(c => c.id !== 'all').map(category => {
                      const categoryProducts = (liveProducts.length > 0 ? liveProducts : PRODUCTS)
                        .filter(p => p.category === category.id)
                        .slice(0, 5);

                      return (
                        <div key={category.id} className="space-y-10">
                          {/* Category Banner */}
                          <div className="relative h-[300px] md:h-[450px] rounded-[3rem] overflow-hidden group shadow-2xl">
                            <img 
                              src={category.banner || `https://picsum.photos/seed/${category.id}-banner/1200/400`} 
                              alt={category.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center px-6">
                              <div className="text-center">
                                <h3 className="text-5xl md:text-8xl font-black text-white mb-8 uppercase tracking-tight italic drop-shadow-2xl">
                                  {category.name}
                                </h3>
                                <button 
                                  onClick={() => setSelectedCategory(category.id)}
                                  className="px-12 py-4 bg-white text-gray-900 rounded-full font-black text-sm uppercase tracking-widest hover:bg-primary-light hover:text-primary-dark transition-all shadow-2xl hover:scale-110 active:scale-95"
                                >
                                  Khám phá ngay
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Sub-categories & Products */}
                          <div className="space-y-8">
                            <div className="flex items-center justify-between border-b-2 border-gray-50 pb-4">
                              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                                <button 
                                  onClick={() => setSelectedCategory(category.id)}
                                  className="px-6 py-2 bg-primary-dark text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg"
                                >
                                  Sản phẩm HOT
                                </button>
                                {category.subCategories.slice(0, 4).map(sub => (
                                  <button 
                                    key={sub}
                                    onClick={() => {
                                      setSelectedCategory(category.id);
                                      setSelectedSubCategory(sub);
                                    }}
                                    className="px-6 py-2 bg-white border-2 border-gray-100 text-gray-400 rounded-full text-xs font-black uppercase tracking-widest hover:border-primary-light hover:text-primary-dark transition-all"
                                  >
                                    {sub}
                                  </button>
                                ))}
                              </div>
                              <button 
                                onClick={() => setSelectedCategory(category.id)}
                                className="text-xs font-black text-primary-dark uppercase tracking-widest hover:underline underline-offset-4"
                              >
                                Xem tất cả
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                              {categoryProducts.map((product) => (
                                <div key={product.id} className="bg-white rounded-[2rem] p-4 border-2 border-gray-50 hover:border-primary-light/30 transition-all group flex flex-col h-full shadow-sm hover:shadow-xl relative overflow-hidden">
                                  <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-4 bg-gray-50">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <button 
                                        onClick={() => setQuickViewProduct(product)}
                                        className="w-10 h-10 bg-white text-gray-900 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                      >
                                        <Eye className="w-5 h-5" />
                                      </button>
                                      <button 
                                        onClick={() => addToCart(product)}
                                        className="w-10 h-10 bg-primary-dark text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                      >
                                        <ShoppingCart className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                  <h4 className="font-bold text-gray-800 mb-1 line-clamp-1 text-xs group-hover:text-primary-dark transition-colors">{product.name}</h4>
                                  <div className="flex items-center justify-between mt-auto">
                                    <span className="text-lg font-black text-primary-dark">{product.price.toLocaleString('vi-VN')}đ</span>
                                    <button 
                                      onClick={() => {
                                        addToCart(product);
                                        setShowCheckout(true);
                                      }}
                                      className="text-[10px] font-black text-primary-dark uppercase tracking-widest hover:underline"
                                    >
                                      Đặt hàng
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                      <h3 className="text-3xl font-black text-gray-900 uppercase italic">
                        {searchQuery ? `Kết quả tìm kiếm cho: "${searchQuery}"` : (selectedCategory === "all" ? "Tất cả sản phẩm" : (categories.find(c => c.id === selectedCategory)?.name || "Danh mục"))}
                      </h3>
                      <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0">
                        <span className="text-xs font-black text-gray-400 uppercase whitespace-nowrap">Sắp xếp:</span>
                        {[
                          { id: 'name-asc', label: 'Tên A → Z' },
                          { id: 'name-desc', label: 'Tên Z → A' },
                          { id: 'price-asc', label: 'Giá tăng dần' },
                          { id: 'price-desc', label: 'Giá giảm dần' },
                          { id: 'newest', label: 'Hàng mới' }
                        ].map(sort => (
                          <button 
                            key={sort.id}
                            onClick={() => setSortBy(sort.id)}
                            className={`text-xs font-bold whitespace-nowrap transition-colors ${sortBy === sort.id ? 'text-primary-dark underline underline-offset-4' : 'text-gray-400 hover:text-primary'}`}
                          >
                            {sort.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-[2.5rem] p-5 border-2 border-gray-50 hover:border-primary-light/30 transition-all group flex flex-col h-full shadow-sm hover:shadow-2xl relative overflow-hidden">
                          <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 bg-gray-50">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              {product.isNew && <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg uppercase tracking-widest">New</span>}
                              {product.isHot && <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg uppercase tracking-widest">Hot</span>}
                            </div>
                            {product.soldCount && (
                              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-primary-dark text-[10px] font-black px-3 py-1 rounded-lg shadow-sm border border-primary-light/20">
                                Đã bán {product.soldCount}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button 
                              onClick={() => addToCart(product)}
                              className="absolute bottom-4 right-4 w-14 h-14 bg-primary-dark text-white rounded-2xl shadow-xl flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
                            >
                              <ShoppingCart className="w-6 h-6" />
                            </button>
                          </div>
                          <h4 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3rem] leading-snug text-sm group-hover:text-primary-dark transition-colors">{product.name}</h4>
                          <div className="flex items-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                            ))}
                            <span className="text-[10px] font-bold text-gray-400 ml-1">({product.reviews})</span>
                          </div>
                          <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-2xl font-black text-primary-dark">{product.price.toLocaleString('vi-VN')}đ</span>
                              {product.originalPrice && (
                                <span className="text-xs text-gray-400 line-through font-bold">{product.originalPrice.toLocaleString('vi-VN')}đ</span>
                              )}
                            </div>
                            <button 
                              onClick={() => setQuickViewProduct(product)}
                              className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-primary-light/20 hover:text-primary-dark transition-all flex items-center justify-center"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredProducts.length === 0 && (
                      <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Search className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold">Không tìm thấy sản phẩm nào phù hợp~ 🐾</p>
                        <button onClick={() => setSearchQuery("")} className="mt-4 text-primary-dark font-black hover:underline">Xem tất cả sản phẩm</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Tại Sao Chọn HanaChiBi?</h3>
              <p className="text-primary/60 font-bold uppercase tracking-[0.3em] text-xs">Cam kết chất lượng từ tâm</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: "Thiết kế độc quyền", desc: "Sản phẩm mang đậm phong cách Pink Panther & HanaChiBi.", icon: Sparkles, color: "bg-pastel-pink" },
                { title: "Chất lượng cao cấp", desc: "Tuyển chọn kỹ lưỡng từ những nhà cung cấp uy tín nhất.", icon: Star, color: "bg-pastel-yellow" },
                { title: "Giao hàng siêu tốc", desc: "Nhận hàng trong vòng 2h tại khu vực nội thành.", icon: ShoppingBag, color: "bg-pastel-blue" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-12 rounded-[4rem] bg-gray-50 hover:bg-white hover:shadow-2xl transition-all duration-500 group border-2 border-transparent hover:border-primary-light/20">
                  <div className={`w-24 h-24 ${item.color} rounded-[2rem] flex items-center justify-center mb-8 shadow-lg group-hover:rotate-12 transition-transform`}>
                    <item.icon className="w-10 h-10 text-primary-dark" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-4">{item.title}</h4>
                  <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-32 bg-primary-dark relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-[4rem] p-12 md:p-20 text-center border border-white/20">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Nhận Ưu Đãi Từ Báo Hồng! 🐾</h3>
              <p className="text-white/80 text-lg mb-12 font-medium">Đăng ký nhận tin để không bỏ lỡ các bộ sưu tập mới và mã giảm giá độc quyền.</p>
              <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <input 
                  type="email" 
                  placeholder="Email của bạn..." 
                  className="flex-grow px-10 py-5 rounded-full bg-white/10 border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white transition-all font-bold"
                />
                <button className="px-12 py-5 rounded-full bg-white text-primary-dark font-black hover:scale-105 transition-all shadow-xl">
                  Đăng ký ngay
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogin(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 overflow-hidden"
            >
              <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
              <div className="text-center mb-10">
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden border-4 border-primary-light shadow-xl p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-primary-light/20">
                    <img 
                      key={settings.mascotImage} 
                      src={settings.mascotImage} 
                      className="w-full h-full object-contain p-2" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://picsum.photos/seed/pink-panther/400/400";
                      }}
                    />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900">{authMode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}</h3>
                <p className="text-gray-400 font-bold mt-2">{authMode === 'login' ? settings.mascotText : 'Tham gia cộng đồng HanaChiBi ngay hôm nay! 🐾'}</p>
              </div>
              <form className="space-y-6" onSubmit={handleAuth}>
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Họ và tên</label>
                    <input 
                      type="text" 
                      required
                      value={loginForm.name}
                      onChange={e => setLoginForm({...loginForm, name: e.target.value})}
                      className="w-full px-6 py-4 rounded-full bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none font-bold transition-all" 
                      placeholder="Nguyễn Văn A" 
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Email / Số điện thoại</label>
                  <input 
                    type="text" 
                    required
                    value={loginForm.email}
                    onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full px-6 py-4 rounded-full bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none font-bold transition-all" 
                    placeholder="Nhập thông tin của bạn..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Mật khẩu</label>
                  <input 
                    type="password" 
                    required
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full px-6 py-4 rounded-full bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none font-bold transition-all" 
                    placeholder="••••••••" 
                  />
                </div>
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Xác nhận mật khẩu</label>
                    <input 
                      type="password" 
                      required 
                      value={loginForm.confirmPassword}
                      onChange={e => setLoginForm({...loginForm, confirmPassword: e.target.value})}
                      className="w-full px-6 py-4 rounded-full bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none font-bold transition-all" 
                      placeholder="••••••••" 
                    />
                  </div>
                )}
                
                {authError && <p className="text-red-500 text-xs font-bold text-center">{authError}</p>}

                <button type="submit" className="btn-primary w-full py-5 text-lg">
                  {authMode === 'login' ? 'Đăng nhập ngay ✨' : 'Đăng ký tài khoản ✨'}
                </button>
                <div className="text-center">
                  <p className="text-gray-400 font-bold">
                    {authMode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
                    <span 
                      className="text-primary-dark cursor-pointer ml-2 underline underline-offset-4"
                      onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    >
                      {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
                    </span>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* My Orders Modal */}
      <AnimatePresence>
        {showMyOrders && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMyOrders(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 bg-primary-dark text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-dark shadow-lg">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-widest">Đơn hàng của tôi 🐾</h3>
                    <p className="text-xs font-bold text-primary-light">Theo dõi và quản lý đơn hàng của bạn</p>
                  </div>
                </div>
                <button onClick={() => setShowMyOrders(false)} className="p-3 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto bg-gray-50 flex flex-col">
                <div className="bg-white border-b sticky top-0 z-10">
                  <div className="flex overflow-x-auto custom-scrollbar">
                    {["Tất cả", "Chờ xác nhận", "Chờ lấy hàng", "Chờ giao hàng", "Đã giao", "Trả hàng", "Đã hủy"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setMyOrdersTab(tab)}
                        className={`px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-4 ${myOrdersTab === tab ? 'border-primary-dark text-primary-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8 flex-grow overflow-y-auto custom-scrollbar">
                  {!user ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-bold mb-6">Vui lòng đăng nhập để xem đơn hàng của bạn</p>
                      <button onClick={() => { setShowMyOrders(false); setShowLogin(true); }} className="btn-primary px-8 py-3">Đăng nhập ngay</button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.filter(o => o.userId === user.id && (myOrdersTab === "Tất cả" || o.status === myOrdersTab)).length === 0 ? (
                        <div className="text-center py-20">
                          <p className="text-gray-400 font-bold">Không tìm thấy đơn hàng nào ở mục này~</p>
                        </div>
                      ) : (
                        orders.filter(o => o.userId === user.id && (myOrdersTab === "Tất cả" || o.status === myOrdersTab)).map(order => (
                          <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Mã đơn: #{order.id}</p>
                                <p className="text-xs text-gray-400 font-bold">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                              </div>
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                order.status === 'Đã giao' ? 'bg-green-100 text-green-600' :
                                order.status === 'Đã hủy' ? 'bg-red-100 text-red-600' :
                                'bg-primary-light/20 text-primary-dark'
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="space-y-4 mb-6">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4">
                                  <img src={item.product.image} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                                  <div className="flex-grow">
                                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.product.name}</p>
                                    <p className="text-xs text-gray-400 font-bold">{item.product.price.toLocaleString('vi-VN')}đ x {item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t">
                              <div className="text-sm font-black text-primary-dark">
                                Tổng cộng: {order.total.toLocaleString('vi-VN')}đ
                              </div>
                              <div className="flex gap-3">
                                {order.status === 'Chờ xác nhận' && (
                                  <button 
                                    onClick={() => {
                                      setCancellingOrder(order);
                                      setShowCancelModal({ orderId: order.id, type: 'customer' });
                                      setCancelStep('confirm');
                                    }}
                                    className="px-4 py-2 text-xs font-black text-red-500 hover:bg-red-50 transition-all rounded-xl border border-red-100"
                                  >
                                    Hủy đơn
                                  </button>
                                )}
                                <button 
                                  onClick={() => setOrderDetail(order)}
                                  className="px-4 py-2 text-xs font-black text-primary-dark hover:bg-primary-light/20 transition-all rounded-xl"
                                >
                                  Chi tiết
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shared Modals */}

      {/* Out of Stock Modal */}
      <AnimatePresence>
        {showOutOfStockModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOutOfStockModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Sản phẩm hết hàng!</h3>
                <p className="text-gray-500 font-bold">Có {affectedOrders.length} đơn hàng đang chờ xác nhận chứa sản phẩm này.</p>
              </div>

              <div className="max-h-[40vh] overflow-y-auto mb-8 space-y-4 custom-scrollbar">
                {affectedOrders.map(order => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-black text-gray-800">#{order.id} - {order.customer.name}</p>
                      <p className="text-xs text-gray-400 font-bold">{order.customer.phone}</p>
                    </div>
                    <button 
                      onClick={() => {
                        handleUpdateOrderStatus(order.id, { status: 'Đã hủy', adminCancelReason: 'Sản phẩm hết hàng' });
                        setAffectedOrders(prev => prev.filter(o => o.id !== order.id));
                      }}
                      className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all"
                    >
                      Hủy đơn này
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowOutOfStockModal(null)} className="flex-1 p-5 rounded-2xl bg-gray-100 text-gray-500 font-bold">Đóng</button>
                <button 
                  onClick={() => {
                    affectedOrders.forEach(order => {
                      handleUpdateOrderStatus(order.id, { status: 'Đã hủy', adminCancelReason: 'Sản phẩm hết hàng' });
                    });
                    setShowOutOfStockModal(null);
                  }}
                  className="flex-1 btn-primary bg-red-500 hover:bg-red-600"
                >
                  Hủy tất cả {affectedOrders.length} đơn
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQuickViewProduct(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button onClick={() => setQuickViewProduct(null)} className="absolute top-6 right-6 z-20 p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
              <div className="md:w-1/2 bg-gray-50">
                <img src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="md:w-1/2 p-10 flex flex-col">
                <span className="text-primary-dark font-black uppercase text-xs tracking-widest mb-4">
                  {categories.find(c => c.id === quickViewProduct.category)?.name}
                </span>
                <h3 className="text-3xl font-black text-gray-900 mb-4">{quickViewProduct.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-pastel-yellow text-pastel-yellow" />)}
                  </div>
                  <span className="text-sm text-gray-400 font-bold">{quickViewProduct.reviews} đánh giá</span>
                </div>
                <div className="text-3xl font-black text-primary-dark mb-8">
                  {quickViewProduct.price.toLocaleString('vi-VN')}đ
                </div>
                <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                  {quickViewProduct.description}
                </p>
                <div className="mt-auto flex gap-4">
                  <button 
                    onClick={() => { addToCart(quickViewProduct); setQuickViewProduct(null); }}
                    className="flex-grow btn-primary flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-5 h-5" /> Thêm vào giỏ hàng
                  </button>
                  <button className="p-4 rounded-2xl bg-primary-light/30 text-primary-dark hover:bg-primary-light transition-all">
                    <HeartIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckout(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-10 pb-4 flex justify-between items-center border-b border-gray-50">
                <h3 className="text-3xl font-black text-gray-900">Thông tin đặt hàng 🐾</h3>
                <button onClick={() => { setShowCheckout(false); setOrderStatus('idle'); }} className="p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-10 pt-6 custom-scrollbar">
                {orderStatus === 'success' ? (
                  <div className="text-center py-10">
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Sparkles className="w-12 h-12" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-4">Đặt hàng thành công!</h3>
                    <p className="text-gray-500 font-medium mb-8">Cảm ơn bạn đã ủng hộ HanaChiBi. Báo Hồng sẽ sớm liên hệ với bạn để xác nhận đơn hàng nhé! 🐾</p>
                    <button onClick={() => { setShowCheckout(false); setOrderStatus('idle'); }} className="btn-primary px-12">Tiếp tục mua sắm</button>
                  </div>
                ) : showQR ? (
                  <div className="text-center space-y-8">
                    <div className="bg-primary-light/10 p-8 rounded-[2.5rem] border-2 border-primary-light/30">
                      <h4 className="text-xl font-black text-primary-dark mb-4">Quét mã QR để thanh toán</h4>
                      <div className="bg-white p-6 rounded-3xl shadow-xl inline-block mb-6">
                        <img 
                          src={settings.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=STK:0123456789|NH:MBBANK|CT:THANH TOAN DON HANG ${customerInfo.phone}`} 
                          alt="QR Code" 
                          className="w-64 h-64 mx-auto object-contain"
                        />
                      </div>
                      <div className="space-y-2 text-left bg-white p-6 rounded-2xl border border-primary-light/20">
                        <p className="text-sm font-bold text-gray-700 flex justify-between"><span>Ngân hàng:</span> <span className="text-primary-dark">MB Bank</span></p>
                        <p className="text-sm font-bold text-gray-700 flex justify-between"><span>Số tài khoản:</span> <span className="text-primary-dark">0396265421</span></p>
                        <p className="text-sm font-bold text-gray-700 flex justify-between"><span>Chủ TK:</span> <span className="text-primary-dark uppercase">HanaChiBi Shop</span></p>
                        <p className="text-sm font-bold text-gray-700 flex justify-between"><span>Số tiền:</span> <span className="text-red-500">{(cartTotal + (customerInfo.shippingMethod === 'express' ? 35000 : 20000)).toLocaleString('vi-VN')}đ</span></p>
                        <p className="text-sm font-bold text-gray-700 flex justify-between"><span>Nội dung:</span> <span className="text-primary-dark">{customerInfo.phone}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setShowQR(false)} className="flex-1 p-5 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-all">Quay lại</button>
                      <button onClick={handleCheckout} className="flex-1 btn-primary">Tôi đã chuyển khoản</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCheckout} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Họ và tên</label>
                        <input 
                          required
                          value={customerInfo.name}
                          onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                          className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Số điện thoại</label>
                        <input 
                          required
                          value={customerInfo.phone}
                          onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                          className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold"
                          placeholder="09xx xxx xxx"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Địa chỉ giao hàng</label>
                      <input 
                        required
                        value={customerInfo.address}
                        onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                        className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold"
                        placeholder="Số nhà, tên đường, phường/xã..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Mã giảm giá</label>
                        <div className="flex gap-2">
                          <input 
                            value={customerInfo.voucher}
                            onChange={e => setCustomerInfo({...customerInfo, voucher: e.target.value.toUpperCase()})}
                            className="flex-grow px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold"
                            placeholder="NHẬP MÃ..."
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Phương thức vận chuyển</label>
                        <select 
                          value={customerInfo.shippingMethod}
                          onChange={e => setCustomerInfo({...customerInfo, shippingMethod: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold appearance-none"
                        >
                          <option value="standard">Giao hàng tiêu chuẩn (20k)</option>
                          <option value="express">Giao hàng hỏa tốc (35k)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Phương thức thanh toán</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          type="button"
                          onClick={() => setCustomerInfo({...customerInfo, paymentMethod: 'cod'})}
                          className={`px-6 py-4 rounded-2xl border-2 font-bold transition-all ${customerInfo.paymentMethod === 'cod' ? 'border-primary-dark bg-primary-light/10 text-primary-dark' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                        >
                          Thanh toán khi nhận hàng (COD)
                        </button>
                        <button 
                          type="button"
                          onClick={() => setCustomerInfo({...customerInfo, paymentMethod: 'bank'})}
                          className={`px-6 py-4 rounded-2xl border-2 font-bold transition-all ${customerInfo.paymentMethod === 'bank' ? 'border-primary-dark bg-primary-light/10 text-primary-dark' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                        >
                          Chuyển khoản ngân hàng
                        </button>
                      </div>
                      {customerInfo.paymentMethod === 'bank' && (
                        <div className="mt-4 p-6 bg-primary-light/10 rounded-2xl border-2 border-primary-light/30">
                          <p className="text-xs font-black text-primary-dark uppercase mb-2">Thông tin chuyển khoản:</p>
                          <p className="text-sm font-bold text-gray-700">Ngân hàng: MB Bank</p>
                          <p className="text-sm font-bold text-gray-700">STK: 0396265421</p>
                          <p className="text-sm font-bold text-gray-700">Chủ TK: HanaChiBi Shop</p>
                          <p className="text-xs text-gray-400 mt-2 italic">* Vui lòng ghi nội dung chuyển khoản là SĐT của bạn.</p>
                        </div>
                      )}
                    </div>

                    {user && user.coins > 0 && (
                      <div className="flex items-center justify-between p-6 bg-pastel-yellow/10 rounded-2xl border-2 border-pastel-yellow/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pastel-yellow rounded-full flex items-center justify-center text-white font-black shadow-sm">
                            Xu
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">Dùng xu tích điểm</p>
                            <p className="text-xs font-bold text-gray-400">Bạn đang có {user.coins} xu</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={customerInfo.useCoins}
                            onChange={e => setCustomerInfo({...customerInfo, useCoins: e.target.checked})}
                            className="sr-only peer" 
                          />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Ghi chú (nếu có)</label>
                      <textarea 
                        value={customerInfo.note}
                        onChange={e => setCustomerInfo({...customerInfo, note: e.target.value})}
                        className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light focus:bg-white outline-none transition-all font-bold h-24 resize-none"
                        placeholder="Lời nhắn cho shop..."
                      />
                    </div>
                    
                    <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white">
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm font-bold text-gray-400">
                          <span>Tạm tính ({cart.length} sản phẩm):</span>
                          <span>{cartTotal.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-400">
                          <span>Phí vận chuyển:</span>
                          <span>{(customerInfo.shippingMethod === 'express' ? 35000 : 20000).toLocaleString('vi-VN')}đ</span>
                        </div>
                        {customerInfo.voucher && vouchers.find(v => v.code === customerInfo.voucher && cartTotal >= v.minOrder) && (
                          <div className="flex justify-between text-sm font-bold text-green-400">
                            <span>Giảm giá voucher:</span>
                            <span>-{vouchers.find(v => v.code === customerInfo.voucher)?.discount.toLocaleString('vi-VN')}đ</span>
                          </div>
                        )}
                        {customerInfo.useCoins && (
                          <div className="flex justify-between text-sm font-bold text-pastel-yellow">
                            <span>Dùng xu:</span>
                            <span>-{Math.min(user?.coins || 0, cartTotal).toLocaleString('vi-VN')}đ</span>
                          </div>
                        )}
                        <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                          <span className="text-lg font-black">Tổng thanh toán:</span>
                          <span className="text-3xl font-black text-primary-light">
                            {(
                              cartTotal 
                              - (vouchers.find(v => v.code === customerInfo.voucher && cartTotal >= v.minOrder)?.discount || 0)
                              + (customerInfo.shippingMethod === 'express' ? 35000 : 20000)
                              - (customerInfo.useCoins ? Math.min(user?.coins || 0, cartTotal) : 0)
                            ).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={orderStatus === 'submitting'}
                        className="w-full bg-white text-gray-900 py-5 rounded-2xl font-black text-lg hover:bg-primary-light hover:text-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {orderStatus === 'submitting' ? <div className="w-6 h-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-6 h-6" />}
                        {customerInfo.paymentMethod === 'bank' ? 'TIẾP TỤC THANH TOÁN' : 'XÁC NHẬN ĐẶT HÀNG'}
                      </button>
                      <p className="text-center text-[10px] font-black text-gray-500 uppercase tracking-widest mt-4">
                        Bạn sẽ nhận được {Math.floor(cartTotal / 10000)} xu sau khi đơn hàng hoàn tất 🐾
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Zalo Button */}
      <button 
        onClick={openZalo}
        className="fixed bottom-8 right-8 z-[80] w-16 h-16 bg-[#0068ff] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" className="w-10 h-10 bg-white rounded-full p-1" />
        <div className="absolute right-20 bg-white px-4 py-2 rounded-xl shadow-xl text-xs font-black text-[#0068ff] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border-2 border-[#0068ff]/10">
          Chat với shop ngay! 🐾
        </div>
      </button>

      {/* Floating Mascot */}
      <div className="fixed bottom-8 left-8 z-[80] hidden md:block">
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative group"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-2xl shadow-xl text-xs font-black text-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border-2 border-primary-light">
            Chào bạn! Pink Panther đang đợi bạn đây~ 🐾
          </div>
          <div className="w-20 h-20 bg-white rounded-full border-4 border-primary-light shadow-2xl flex items-center justify-center overflow-hidden">
            <img 
              src={settings.mascotImage} 
              alt="Hana" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://picsum.photos/seed/hanachibi-mascot/200/200";
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[100]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCart(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox"
                    checked={cart.length > 0 && selectedCartItems.length === cart.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCartItems(cart.map(item => item.product.id));
                      } else {
                        setSelectedCartItems([]);
                      }
                    }}
                    className="w-5 h-5 rounded accent-primary-dark cursor-pointer"
                  />
                  <h3 className="text-2xl font-black text-gray-900">Giỏ hàng ({cartCount})</h3>
                </div>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-8">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-primary-light/20 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-primary-dark" />
                    </div>
                    <p className="text-gray-400 font-bold">Giỏ hàng đang trống trơn~</p>
                    <button onClick={() => setShowCart(false)} className="mt-6 text-primary font-black">Tiếp tục mua sắm</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-4 items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                        <input 
                          type="checkbox"
                          checked={selectedCartItems.includes(item.product.id)}
                          onChange={() => {
                            if (selectedCartItems.includes(item.product.id)) {
                              setSelectedCartItems(selectedCartItems.filter(id => id !== item.product.id));
                            } else {
                              setSelectedCartItems([...selectedCartItems, item.product.id]);
                            }
                          }}
                          className="w-5 h-5 rounded accent-primary-dark cursor-pointer shrink-0"
                        />
                        <img src={item.product.image} className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-light/20" />
                        <div className="flex-grow">
                          <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.product.name}</h4>
                          <p className="text-primary-dark font-black text-sm mt-1">{(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button 
                              onClick={() => {
                                if (item.quantity > 1) {
                                  setCart(cart.map(c => c.product.id === item.product.id ? { ...c, quantity: c.quantity - 1 } : c));
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-light transition-colors"
                            >
                              -
                            </button>
                            <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => setCart(cart.map(c => c.product.id === item.product.id ? { ...c, quantity: c.quantity + 1 } : c))}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-light transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={() => setCart(cart.filter(c => c.product.id !== item.product.id))}
                          className="text-gray-300 hover:text-red-400 transition-colors p-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                  <div className="p-8 bg-gray-50 border-t">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-500 font-bold">Tổng cộng:</span>
                      <span className="text-2xl font-black text-primary-dark">{cartTotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button 
                        disabled={selectedCartItems.length === 0}
                        onClick={() => { setShowCart(false); setShowCheckout(true); }}
                        className="w-full btn-primary py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Thanh toán ngay ({selectedCartItems.length}) ✨
                      </button>
                      <button 
                        onClick={openZalo}
                        className="w-full py-5 rounded-full bg-[#0068ff] text-white font-black flex items-center justify-center gap-3 hover:bg-[#0052cc] transition-all shadow-lg"
                      >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" className="w-6 h-6 bg-white rounded-full p-0.5" />
                        Chốt đơn qua Zalo
                      </button>
                    </div>
                  </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        </>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {orderDetail && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOrderDetail(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 bg-primary-dark text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-dark shadow-lg">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-widest">Chi tiết đơn hàng 🐾</h3>
                    <p className="text-xs font-bold text-primary-light">Mã đơn: #{orderDetail.id}</p>
                  </div>
                </div>
                <button onClick={() => setOrderDetail(null)} className="p-3 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Thông tin người mua</h4>
                    <div className="space-y-2">
                      <p className="font-black text-gray-900">{orderDetail.customer.name}</p>
                      <p className="text-sm text-gray-500 font-bold flex items-center gap-2"><Phone className="w-4 h-4" /> {orderDetail.customer.phone}</p>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> {orderDetail.customer.address}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Trạng thái & Thanh toán</h4>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-900">Phương thức: <span className="text-primary-dark uppercase">{orderDetail.customer.paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD'}</span></p>
                      <p className="text-sm font-bold text-gray-900">Vận chuyển: <span className="text-primary-dark uppercase">{orderDetail.customer.shippingMethod === 'express' ? 'Hỏa tốc' : 'Tiêu chuẩn'}</span></p>
                      <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        orderDetail.status === 'Đã giao' ? 'bg-green-100 text-green-600' :
                        orderDetail.status === 'Đã hủy' ? 'bg-red-100 text-red-600' :
                        'bg-primary-light/20 text-primary-dark'
                      }`}>
                        {orderDetail.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Sản phẩm đã mua</h4>
                  <div className="space-y-3">
                    {orderDetail.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <img src={item.product.image} className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
                        <div className="flex-grow">
                          <p className="font-bold text-gray-800">{item.product.name}</p>
                          <p className="text-xs text-gray-400 font-bold">{item.product.price.toLocaleString('vi-VN')}đ x {item.quantity}</p>
                        </div>
                        <p className="font-black text-primary-dark">{(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                      </div>
                    ))}
                  </div>
                </div>

                {orderDetail.status === 'Đã hủy' && (
                  <div className="p-6 bg-red-50 rounded-3xl border-2 border-red-100">
                    <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">Thông tin hủy đơn</p>
                    <p className="text-sm font-bold text-red-600">Người hủy: {orderDetail.cancelledBy}</p>
                    <p className="text-sm font-bold text-red-600">Lý do: {orderDetail.cancelReason}</p>
                    {orderDetail.outOfStockItems && orderDetail.outOfStockItems.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-red-400">Sản phẩm hết hàng:</p>
                        <ul className="list-disc list-inside text-xs text-red-600 font-bold mt-1">
                          {orderDetail.items.filter((item: any) => orderDetail.outOfStockItems.includes(item.product.id)).map((item: any) => (
                            <li key={item.product.id}>{item.product.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-6 border-t space-y-2">
                  <div className="flex justify-between text-sm font-bold text-gray-400">
                    <span>Tạm tính:</span>
                    <span>{(orderDetail.total + orderDetail.discount - orderDetail.shipping + orderDetail.coinsUsed).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-400">
                    <span>Phí vận chuyển:</span>
                    <span>{orderDetail.shipping.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {orderDetail.discount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-green-500">
                      <span>Giảm giá:</span>
                      <span>-{orderDetail.discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  {orderDetail.coinsUsed > 0 && (
                    <div className="flex justify-between text-sm font-bold text-pastel-yellow">
                      <span>Dùng xu:</span>
                      <span>-{orderDetail.coinsUsed.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-lg font-black text-gray-900">Tổng cộng:</span>
                    <span className="text-3xl font-black text-primary-dark">{orderDetail.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t flex gap-4">
                {isAdminView && orderDetail.status === 'Chờ xác nhận' && (
                  <button 
                    onClick={() => handleUpdateOrderStatus(orderDetail.id, { status: 'Chờ lấy hàng' })}
                    className="flex-1 py-4 rounded-2xl bg-primary-dark text-white font-black hover:bg-primary-dark/90 transition-all shadow-lg shadow-primary-dark/20 flex items-center justify-center gap-3"
                  >
                    <Check className="w-5 h-5" /> Xác nhận đơn
                  </button>
                )}
                {isAdminView && (
                  <button 
                    onClick={() => { try { window.print(); } catch(err) { console.error(err); } }}
                    className="flex-1 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-600 font-black flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
                  >
                    <Printer className="w-5 h-5" /> In hóa đơn
                  </button>
                )}
                {orderDetail.status !== 'Đã hủy' && (
                  <button 
                    onClick={() => {
                      setCancellingOrder(orderDetail);
                      setShowCancelModal({ orderId: orderDetail.id, type: isAdminView ? 'admin' : 'customer' });
                      setCancelStep('confirm');
                    }}
                    className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {showCancelModal && cancellingOrder && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCancelModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10"
            >
              {cancelStep === 'confirm' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <Trash2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Hủy đơn hàng?</h3>
                    <p className="text-gray-400 font-bold mt-2">Bạn có chắc chắn muốn hủy đơn hàng #{showCancelModal.orderId} không?</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setShowCancelModal(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black">Quay lại</button>
                    <button onClick={() => setCancelStep('reason')} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black shadow-lg shadow-red-200">Đồng ý</button>
                  </div>
                </div>
              )}

              {cancelStep === 'reason' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-black text-gray-900">Lý do hủy đơn</h3>
                  <div className="space-y-3">
                    {(showCancelModal.type === 'admin' 
                      ? ["Hết hàng", "Khách hàng yêu cầu hủy", "Thông tin không hợp lệ", "Đơn hàng trùng lặp", "Lý do khác"]
                      : ["Muốn thay đổi địa chỉ nhận hàng", "Muốn thay đổi sản phẩm", "Tìm thấy giá rẻ hơn", "Không còn nhu cầu mua nữa", "Lý do khác"]
                    ).map(reason => (
                      <button 
                        key={reason}
                        onClick={() => {
                          setCancelReason(reason);
                          if (showCancelModal.type === 'admin' && reason === 'Hết hàng') {
                            setCancelStep('products');
                          }
                        }}
                        className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all border-2 ${cancelReason === reason ? 'border-primary-dark bg-primary-light/10 text-primary-dark' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setCancelStep('confirm')} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black">Quay lại</button>
                    <button 
                      disabled={!cancelReason}
                      onClick={() => {
                        if (showCancelModal.type === 'admin' && cancelReason === 'Hết hàng') {
                          setCancelStep('products');
                        } else {
                          handleCancelOrder();
                        }
                      }} 
                      className="flex-1 py-4 rounded-2xl bg-primary-dark text-white font-black shadow-lg disabled:opacity-50"
                    >
                      {showCancelModal.type === 'admin' && cancelReason === 'Hết hàng' ? 'Tiếp tục' : 'Xác nhận hủy'}
                    </button>
                  </div>
                </div>
              )}

              {cancelStep === 'products' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Sản phẩm hết hàng</h3>
                    <p className="text-gray-400 font-bold mt-1 text-sm">Vui lòng chọn các sản phẩm đã hết hàng</p>
                  </div>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                    {cancellingOrder.items.map((item: any) => (
                      <div 
                        key={item.product.id}
                        onClick={() => {
                          if (outOfStockItems.includes(item.product.id)) {
                            setOutOfStockItems(outOfStockItems.filter(id => id !== item.product.id));
                          } else {
                            setOutOfStockItems([...outOfStockItems, item.product.id]);
                          }
                        }}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${outOfStockItems.includes(item.product.id) ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}
                      >
                        <img src={item.product.image} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-gray-400 font-bold">Số lượng: {item.quantity}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${outOfStockItems.includes(item.product.id) ? 'bg-red-500 border-red-500' : 'border-gray-200'}`}>
                          {outOfStockItems.includes(item.product.id) && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setCancelStep('reason')} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black">Quay lại</button>
                    <button 
                      disabled={outOfStockItems.length === 0}
                      onClick={handleCancelOrder} 
                      className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black shadow-lg shadow-red-200 disabled:opacity-50"
                    >
                      Xác nhận hủy
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Admin Password Modal */}
      <AnimatePresence>
        {showAdminPasswordModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdminPasswordModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto text-primary-dark">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Xác thực Admin 🐾</h3>
                  <p className="text-gray-400 font-bold mt-2">Vui lòng nhập mật khẩu để vào trang quản trị</p>
                </div>
                <div className="space-y-4">
                  <input 
                    type="password"
                    placeholder="Nhập mật khẩu..."
                    value={adminPasswordInput}
                    onChange={e => setAdminPasswordInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdminAccess()}
                    className="w-full px-8 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-light outline-none font-bold text-center"
                  />
                  {adminPasswordError && <p className="text-red-500 text-xs font-bold">{adminPasswordError}</p>}
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowAdminPasswordModal(false)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black">Hủy</button>
                  <button onClick={handleAdminAccess} className="flex-1 py-4 rounded-2xl bg-primary-dark text-white font-black shadow-lg">Xác nhận</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-white pt-24 pb-12 border-t-8 border-primary-light/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-primary-light">
                  <img 
                    src={settings.logo} 
                    alt="HanaChiBi Logo" 
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://picsum.photos/seed/hanachibi-logo/200/200";
                    }}
                  />
                </div>
                <h2 className="text-2xl font-black text-primary-dark">HanaChiBi</h2>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed">
                HanaChiBi - Nơi hội tụ những món đồ dùng học tập xinh xắn nhất, giúp bạn tự tin tỏa sáng trên con đường tri thức.
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-primary-light/20 flex items-center justify-center text-primary-dark hover:bg-primary hover:text-white transition-all shadow-sm">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-8 uppercase text-xs tracking-[0.2em]">Khám phá</h4>
              <ul className="space-y-4">
                {["Sản phẩm mới", "Bán chạy nhất", "Combo tiết kiệm", "Quà tặng xinh"].map(item => (
                  <li key={item}><a href="#" className="text-gray-500 font-bold hover:text-primary transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-8 uppercase text-xs tracking-[0.2em]">Hỗ trợ</h4>
              <ul className="space-y-4">
                {["Chính sách đổi trả", "Phí vận chuyển", "Hướng dẫn chọn quà", "Liên hệ hỗ trợ"].map(item => (
                  <li key={item}><a href="#" className="text-gray-500 font-bold hover:text-primary transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-8 uppercase text-xs tracking-[0.2em]">Liên hệ</h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-4 text-gray-500 font-medium">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <span>Trường Đại học Hải Phòng, quận Kiến An</span>
                </li>
                <li className="flex items-center gap-4 text-gray-500 font-medium">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span>039 6265 421</span>
                </li>
                <li className="flex items-center gap-4 text-gray-500 font-medium">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span>hello@hanachibi.vn</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">© 2026 HanaChiBi Stationery. Made with 💖</p>
            <div className="flex gap-8 items-center grayscale opacity-40">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {customAlert && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setCustomAlert(null)} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
                customAlert.type === 'success' ? 'bg-green-100 text-green-500' : 
                customAlert.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
              }`}>
                {customAlert.type === 'success' ? <Check className="w-8 h-8" /> : 
                 customAlert.type === 'error' ? <X className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
              </div>
              <p className="text-gray-900 font-black text-lg mb-8">{customAlert.message}</p>
              <button
                onClick={() => setCustomAlert(null)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
              >
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {customConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setCustomConfirm(null)} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-gray-900 font-black text-lg mb-8">{customConfirm.message}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setCustomConfirm(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    customConfirm.onConfirm();
                    setCustomConfirm(null);
                  }}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
