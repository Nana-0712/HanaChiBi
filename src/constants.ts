export const PRODUCTS = [
  { id: 1, name: 'Bút Gel Pastel HanaChiBi', price: 45000, originalPrice: 55000, image: 'https://picsum.photos/seed/pen1/600/600', category: 'pen', subCategory: 'Bút nước', brand: 'Thiên Long', isHot: true, isFlashSale: true, soldCount: 45, totalStock: 100, rating: 5, reviews: 124, description: 'Dòng bút gel mực mượt mà, màu sắc pastel nhẹ nhàng.' },
  { id: 2, name: 'Sổ tay lò xo A5', price: 32000, originalPrice: 45000, image: 'https://picsum.photos/seed/notebook1/600/600', category: 'notebook', subCategory: 'Sổ lò xo', brand: 'HanaChiBi', isNew: true, isFlashSale: true, soldCount: 28, totalStock: 100, rating: 4.8, reviews: 89, description: 'Sổ tay bìa cứng cán màng mờ.' }
];

export const FLASH_SALE_PRODUCTS = PRODUCTS.filter(p => p.isFlashSale);