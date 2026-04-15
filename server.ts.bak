import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json());

  // Đảm bảo các thư mục tồn tại
  const dataDir = path.join(process.cwd(), "data");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  
  [dataDir, path.join(process.cwd(), "public"), uploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Cấu hình multer để lưu ảnh
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage: storage });

  // Phục vụ ảnh tĩnh
  app.use("/uploads", express.static(uploadsDir));

  // API: Tải ảnh lên
  app.post("/api/upload", upload.single("image"), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Không có file nào được tải lên" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  });

  const ordersFile = path.join(dataDir, "orders.json");
  if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, JSON.stringify([]));
  }

  const categoriesFile = path.join(dataDir, "categories.json");
  if (!fs.existsSync(categoriesFile)) {
    const initialCategories = [
      { id: 'all', name: 'Tất cả', icon: 'Sparkles', color: 'bg-pastel-yellow', subCategories: [] },
      { id: 'pen', name: 'Bút & Viết', icon: 'PenLine', color: 'bg-pastel-blue', image: 'https://picsum.photos/seed/pen-avatar/200/200', banner: 'https://picsum.photos/seed/pen-banner/1200/400', subCategories: ['Bút bi', 'Bút nước', 'Bút xóa', 'Bút màu', 'Bút highlight', 'Bút chì'] },
      { id: 'notebook', name: 'Sổ & Tập', icon: 'BookOpen', color: 'bg-pastel-purple', image: 'https://picsum.photos/seed/notebook-avatar/200/200', banner: 'https://picsum.photos/seed/notebook-banner/1200/400', subCategories: ['Sổ lò xo', 'Sổ bìa cứng', 'Sổ kế hoạch', 'Vở ô ly', 'Vở kẻ ngang'] },
      { id: 'art', name: 'Mỹ thuật', icon: 'Palette', color: 'bg-pastel-green', image: 'https://picsum.photos/seed/art-avatar/200/200', banner: 'https://picsum.photos/seed/art-banner/1200/400', subCategories: ['Màu nước', 'Màu sáp', 'Cọ vẽ', 'Giấy vẽ', 'Bút marker'] },
      { id: 'accessory', name: 'Phụ kiện', icon: 'Scissors', color: 'bg-primary-light', image: 'https://picsum.photos/seed/accessory-avatar/200/200', banner: 'https://picsum.photos/seed/accessory-banner/1200/400', subCategories: ['Thước kẻ', 'Gôm tẩy', 'Gọt chì', 'Kéo', 'Băng dính', 'Sticker'] },
    ];
    fs.writeFileSync(categoriesFile, JSON.stringify(initialCategories, null, 2));
  }

  const usersFile = path.join(dataDir, "users.json");
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([]));
  }

  const settingsFile = path.join(dataDir, "settings.json");
  if (!fs.existsSync(settingsFile)) {
    const defaultSettings = {
      logo: "/logo.png",
      loginBanner: "https://picsum.photos/seed/hanachibi-main/1000/800",
      loginBannerText: "Cùng HaniChibi viết nên ước mơ",
      mascotImage: "https://picsum.photos/seed/pink-panther/400/400",
      mascotText: "Pink panther đang đợi bạn đây nhé"
    };
    fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2));
  }

  // API: Lấy cài đặt
  app.get("/api/settings", (req, res) => {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsFile, "utf-8"));
      res.json(settings);
    } catch {
      res.status(500).json({ success: false, message: "Lỗi lấy cài đặt" });
    }
  });

  // API: Cập nhật cài đặt
  app.post("/api/settings", (req, res) => {
    try {
      const settings = req.body;
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
      res.json({ success: true, settings });
    } catch {
      res.status(500).json({ success: false, message: "Lỗi lưu cài đặt" });
    }
  });

  // API: Đăng ký
  app.post("/api/register", (req, res) => {
    try {
      const { name, email, password } = req.body;
      const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
      
      if (users.find((u: any) => u.email === email)) {
        return res.status(400).json({ success: false, message: "Email đã tồn tại" });
      }

      const newUser = { id: Date.now(), name, email, password, coins: 0 };
      users.push(newUser);
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      
      res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, coins: 0 } });
    } catch {
      res.status(500).json({ success: false, message: "Lỗi đăng ký" });
    }
  });

  // API: Đăng nhập
  app.post("/api/login", (req, res) => {
    try {
      const { email, password } = req.body;
      const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
      }

      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, coins: user.coins || 0 } });
    } catch {
      res.status(500).json({ success: false, message: "Lỗi đăng nhập" });
    }
  });

  const productsFile = path.join(dataDir, "products.json");
  if (!fs.existsSync(productsFile)) {
    const initialProducts = [
      { id: 1, name: 'Bút Gel Pastel HanaChiBi - Set 5 màu', price: 45000, originalPrice: 55000, image: 'https://picsum.photos/seed/pen1/600/600', category: 'pen', subCategory: 'Bút nước', brand: 'Thiên Long', isHot: true, isFlashSale: true, soldCount: 45, totalStock: 100, rating: 5, reviews: 124, description: 'Dòng bút gel mực mượt mà, màu sắc pastel nhẹ nhàng phù hợp cho việc ghi chú và trang trí sổ tay.' },
      { id: 2, name: 'Sổ tay lò xo A5 - Pinky Dream', price: 32000, originalPrice: 45000, image: 'https://picsum.photos/seed/notebook1/600/600', category: 'notebook', subCategory: 'Sổ lò xo', brand: 'HanaChiBi', isNew: true, isFlashSale: true, soldCount: 28, totalStock: 100, rating: 4.8, reviews: 89, description: 'Sổ tay bìa cứng cán màng mờ, giấy định lượng cao chống thấm mực, thiết kế Mascot HanaChiBi độc quyền.' },
      { id: 3, name: 'Hộp bút silicon hình thú dễ thương', price: 55000, originalPrice: 65000, image: 'https://picsum.photos/seed/case1/600/600', category: 'case', subCategory: 'Hộp bút', brand: 'Flexoffice', isFlashSale: true, soldCount: 67, totalStock: 100, rating: 4.9, reviews: 210, description: 'Chất liệu silicon cao cấp, mềm mịn, dễ vệ sinh. Sức chứa lớn cho tất cả đồ dùng học tập của bạn.' },
      { id: 4, name: 'Set Sticker trang trí Bullet Journal', price: 15000, originalPrice: 25000, image: 'https://picsum.photos/seed/sticker1/600/600', category: 'sticker', subCategory: 'Set sticker', brand: 'HanaChiBi', isNew: true, isFlashSale: true, soldCount: 12, totalStock: 100, rating: 5, reviews: 56, description: 'Hơn 50 sticker cắt sẵn với nhiều chủ đề dễ thương, màu sắc tươi sáng, độ bám dính tốt.' },
      { id: 5, name: 'Bút chì kim 0.5mm - Pastel Edition', price: 12000, image: 'https://picsum.photos/seed/pencil1/600/600', category: 'pen', subCategory: 'Bút chì', brand: 'Điểm 10', rating: 4.7, reviews: 45, description: 'Thiết kế công thái học giúp cầm nắm thoải mái, ngòi chì 0.5mm chắc chắn, không dễ gãy.' },
      { id: 6, name: 'Tập 200 trang - HanaChiBi Mascot', price: 18000, image: 'https://picsum.photos/seed/notebook2/600/600', category: 'notebook', subCategory: 'Vở kẻ ngang', brand: 'HanaChiBi', isHot: true, rating: 4.9, reviews: 312, description: 'Vở kẻ ngang chất lượng cao, độ trắng tự nhiên bảo vệ mắt, bìa in hình linh vật HanaChiBi.' },
      { id: 7, name: 'Gôm tẩy hình bánh donut màu sắc', price: 8000, image: 'https://picsum.photos/seed/eraser1/600/600', category: 'tool', subCategory: 'Gôm tẩy', brand: 'Colokit', rating: 4.6, reviews: 78, description: 'Gôm tẩy sạch, không để lại bụi, hình dáng bánh donut sáng tạo và bắt mắt.' },
      { id: 8, name: 'Bút highlight 2 đầu - Soft Color', price: 25000, image: 'https://picsum.photos/seed/highlighter1/600/600', category: 'pen', subCategory: 'Bút highlight', brand: 'Thiên Long', rating: 4.8, reviews: 156, description: 'Một đầu dẹt và một đầu tròn tiện lợi, màu sắc nhẹ nhàng không gây lóa mắt khi đọc lại.' }
    ];
    fs.writeFileSync(productsFile, JSON.stringify(initialProducts, null, 2));
  }

  // API: Lấy danh sách sản phẩm
  app.get("/api/products", (req, res) => {
    try {
      const products = JSON.parse(fs.readFileSync(productsFile, "utf-8"));
      res.json(products);
    } catch {
      res.status(500).json({ success: false, message: "Lỗi lấy sản phẩm" });
    }
  });

  // API: Thêm/Cập nhật sản phẩm
  app.post("/api/products", (req, res) => {
    try {
      const product = req.body;
      let products = JSON.parse(fs.readFileSync(productsFile, "utf-8"));
      
      if (product.id) {
        // Cập nhật
        products = products.map((p: any) => p.id === product.id ? product : p);
      } else {
        // Thêm mới
        product.id = Date.now();
        products.push(product);
      }
      
      fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
      res.json({ success: true, product });
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);
      res.status(500).json({ success: false, message: "Lỗi lưu sản phẩm" });
    }
  });

  // API: Xóa sản phẩm
  app.delete("/api/products/:id", (req, res) => {
    try {
      const id = req.params.id;
      let products = JSON.parse(fs.readFileSync(productsFile, "utf-8"));
      const initialCount = products.length;
      products = products.filter((p: any) => String(p.id) !== String(id));
      
      if (products.length === initialCount) {
        console.warn(`Không tìm thấy sản phẩm với ID: ${id} để xóa`);
      }
      
      fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
      res.json({ success: true });
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      res.status(500).json({ success: false, message: "Lỗi xóa sản phẩm" });
    }
  });

  // API: Lưu đơn hàng
  app.post("/api/orders", (req, res) => {
    try {
      const orderData = req.body;

      // KIỂM TRA BẢO MẬT: BẮT BUỘC CÓ USERID
      if (!orderData.userId) {
        return res.status(403).json({ success: false, message: "Bạn phải đăng nhập để đặt hàng!" });
      }

      const newOrder = {
        id: Date.now(),
        ...orderData,
        createdAt: new Date().toISOString()
      };

      const orders = JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
      orders.push(newOrder);
      fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

      // Cập nhật xu cho user nếu có
      if (orderData.userId) {
        let users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
        users = users.map((u: any) => {
          if (u.id === orderData.userId) {
            return { 
              ...u, 
              coins: (u.coins || 0) - (orderData.coinsUsed || 0) + (orderData.earnedCoins || 0) 
            };
          }
          return u;
        });
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      }

      res.status(201).json({ success: true, orderId: newOrder.id });
    } catch (error) {
      console.error("Lỗi lưu đơn hàng:", error);
      res.status(500).json({ success: false, message: "Lỗi lưu đơn hàng" });
    }
  });

  // API: Lấy danh sách danh mục
  app.get("/api/categories", (req, res) => {
    try {
      const categories = JSON.parse(fs.readFileSync(categoriesFile, "utf-8"));
      res.json(categories);
    } catch {
      res.status(500).json({ success: false, message: "Lỗi lấy danh mục" });
    }
  });

  // API: Thêm/Cập nhật danh mục
  app.post("/api/categories", (req, res) => {
    try {
      const category = req.body;
      const categories = JSON.parse(fs.readFileSync(categoriesFile, "utf-8"));
      
      const index = categories.findIndex((c: any) => c.id === category.id);
      if (index !== -1) {
        categories[index] = category;
      } else {
        categories.push(category);
      }
      
      fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));
      res.json({ success: true, category });
    } catch {
      res.status(500).json({ success: false, message: "Lỗi lưu danh mục" });
    }
  });

  // API: Xóa danh mục
  app.delete("/api/categories/:id", (req, res) => {
    try {
      const id = req.params.id;
      let categories = JSON.parse(fs.readFileSync(categoriesFile, "utf-8"));
      const initialCount = categories.length;
      categories = categories.filter((c: any) => String(c.id) !== String(id));
      
      if (categories.length === initialCount) {
        console.warn(`Không tìm thấy danh mục với ID: ${id} để xóa`);
      }
      
      fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));
      res.json({ success: true });
    } catch (error) {
      console.error("Lỗi xóa danh mục:", error);
      res.status(500).json({ success: false, message: "Lỗi xóa danh mục" });
    }
  });

  // API: Cập nhật thông tin người dùng
  app.patch("/api/users/:id", (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      let users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
      users = users.map((u: any) => String(u.id) === String(id) ? { ...u, ...updateData } : u);
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      res.json({ success: true });
    } catch (error) {
      console.error("Lỗi cập nhật người dùng:", error);
      res.status(500).json({ success: false, message: "Lỗi cập nhật người dùng" });
    }
  });

  // API: Cập nhật trạng thái đơn hàng
  app.patch("/api/orders/:id", (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      let orders = JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
      orders = orders.map((o: any) => String(o.id) === String(id) ? { ...o, ...updateData } : o);
      fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
      res.json({ success: true });
    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng:", error);
      res.status(500).json({ success: false, message: "Lỗi cập nhật đơn hàng" });
    }
  });

  // API: Lấy danh sách đơn hàng (Cho Admin)
  app.get("/api/orders", (req, res) => {
    try {
      const orders = JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
      res.json(orders);
    } catch {
      res.status(500).json({ success: false, message: "Lỗi lấy đơn hàng" });
    }
  });

  // Vite middleware cho development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
