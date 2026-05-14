const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const { User, Category, Product } = require("../models");
const ROLES = require("../common/constants/roles.constant");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/restaurant";

// Helper to create "fake" markup prices (Original Price > Discounted Price)
const withMarkup = (finalPrice) => {
  const markup = Math.ceil(finalPrice * 1.35); // 35% markup to show good discounts
  return {
    price: markup,
    discountedPrice: finalPrice,
  };
};

const categories = [
  { name: "Burger", slug: "burger" },
  { name: "Sandwich", slug: "sandwich" },
  { name: "Fries", slug: "fries" },
  { name: "Pasta", slug: "pasta" },
  { name: "Pizza", slug: "pizza" },
  { name: "Combo", slug: "combo" },
  { name: "Shake", slug: "shake" },
  { name: "Fast Food", slug: "fast-food" },
  { name: "Side Order", slug: "side-order" },
];

const users = [
  { name: "Admin User", email: "admin@yopmail.com", password: "password123", role: ROLES.ADMIN },
  { name: "Regular User", email: "user@yopmail.com", password: "password123", role: ROLES.USER },
  { name: "Kitchen Staff", email: "kitchen@yopmail.com", password: "password123", role: ROLES.KITCHEN },
  { name: "Delivery Boy", email: "delivery@yopmail.com", password: "password123", role: ROLES.DELIVERY },
];

const products = (catMap) => [
  // Burger
  { name: "Aloo Tikki Burger", ...withMarkup(30), categoryId: catMap.burger, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop" },
  { name: "Veggie Burger", ...withMarkup(45), categoryId: catMap.burger, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=500&auto=format&fit=crop" },
  { name: "Cheesy Burger", ...withMarkup(60), categoryId: catMap.burger, image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=500&auto=format&fit=crop" },
  { name: "Cheesy Spicy Burger", ...withMarkup(65), categoryId: catMap.burger, image: "https://images.unsplash.com/photo-1553355100-d164627702e1?q=80&w=500&auto=format&fit=crop" },
  { name: "Paneer Tikka Burger", ...withMarkup(80), categoryId: catMap.burger, image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=500&auto=format&fit=crop" },
  
  // Sandwich
  { name: "Grilled Sandwich (2 pcs)", ...withMarkup(60), categoryId: catMap.sandwich, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=500&auto=format&fit=crop" },
  { name: "Cheesy Grill", ...withMarkup(70), categoryId: catMap.sandwich, image: "https://images.unsplash.com/photo-1539252554452-da098b76323d?q=80&w=500&auto=format&fit=crop" },
  { name: "Paneer Grilled Sandwich", ...withMarkup(85), categoryId: catMap.sandwich, image: "https://images.unsplash.com/photo-1559466273-d95e72debaf8?q=80&w=500&auto=format&fit=crop" },
  { name: "Cheese Toast", ...withMarkup(80), categoryId: catMap.sandwich, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500&auto=format&fit=crop" },

  // Fries
  { name: "French Fries", ...withMarkup(59), categoryId: catMap.fries, image: "https://images.unsplash.com/photo-1630384066221-44776853511b?q=80&w=500&auto=format&fit=crop" },
  { name: "Masala Fries", ...withMarkup(69), categoryId: catMap.fries, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=500&auto=format&fit=crop" },
  { name: "Saucy Fries", ...withMarkup(79), categoryId: catMap.fries, image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=500&auto=format&fit=crop" },
  { name: "Peri-Peri Fries", ...withMarkup(89), categoryId: catMap.fries, image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=500&auto=format&fit=crop" },

  // Pasta
  { name: "Red Pasta", ...withMarkup(79), categoryId: catMap.pasta, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=500&auto=format&fit=crop" },
  { name: "White Pasta", ...withMarkup(89), categoryId: catMap.pasta, image: "https://images.unsplash.com/photo-1645112481338-33317f6984e1?q=80&w=500&auto=format&fit=crop" },
  { name: "Jambo Pasta", ...withMarkup(99), categoryId: catMap.pasta, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=500&auto=format&fit=crop" },
  { name: "Tandoori Pasta", ...withMarkup(99), categoryId: catMap.pasta, image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?q=80&w=500&auto=format&fit=crop" },
  { name: "Makhni Pasta", ...withMarkup(99), categoryId: catMap.pasta, image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=500&auto=format&fit=crop" },

  // Pizza (Main Section - Basic)
  { 
    name: "Cheesy Mushroom", 
    ...withMarkup(99), 
    categoryId: catMap.pizza,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500&auto=format&fit=crop",
    hasVariations: true,
    variations: [
      { name: "Regular", ...withMarkup(99) },
      { name: "Medium", ...withMarkup(199) },
      { name: "Large", ...withMarkup(299) },
    ]
  },
  { 
    name: "Margherita", 
    ...withMarkup(149), 
    categoryId: catMap.pizza,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?q=80&w=500&auto=format&fit=crop",
    hasVariations: true,
    variations: [
      { name: "Regular", ...withMarkup(149) },
      { name: "Medium", ...withMarkup(249) },
      { name: "Large", ...withMarkup(349) },
    ]
  },
  
  // Pizza (Premium)
  { 
    name: "Farm Fresh", 
    ...withMarkup(189), 
    categoryId: catMap.pizza,
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=500&auto=format&fit=crop",
    hasVariations: true,
    variations: [
      { name: "Regular", ...withMarkup(189) },
      { name: "Medium", ...withMarkup(319) },
      { name: "Large", ...withMarkup(449) },
    ],
    dayWisePricing: [
      { day: 0, discountPercentage: 20 }, // Extra 20% off on Sundays
    ]
  },

  // Fast Food (Half/Full)
  { 
    name: "Spring Roll", 
    ...withMarkup(90), 
    categoryId: catMap["fast-food"], 
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500&auto=format&fit=crop",
    hasVariations: true,
    variations: [
      { name: "Half (4 pcs)", ...withMarkup(90) },
      { name: "Full (8 pcs)", ...withMarkup(160) },
    ]
  },

  // Momos (Simple, Veg, Paneer)
  { 
    name: "Steamed Momos", 
    ...withMarkup(60), 
    categoryId: catMap["fast-food"], 
    image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?q=80&w=500&auto=format&fit=crop",
    hasVariations: true,
    variations: [
      { name: "Simple", ...withMarkup(60) },
      { name: "Veg", ...withMarkup(80) },
      { name: "Paneer", ...withMarkup(110) },
    ]
  },
  { 
    name: "Fried Momos", 
    ...withMarkup(80), 
    categoryId: catMap["fast-food"], 
    image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?q=80&w=500&auto=format&fit=crop",
    hasVariations: true,
    variations: [
      { name: "Simple", ...withMarkup(80) },
      { name: "Veg", ...withMarkup(100) },
      { name: "Paneer", ...withMarkup(130) },
    ]
  },

  // Noodles (Simple, Veg, Paneer)
  { 
    name: "Hakka Noodles", 
    ...withMarkup(70), 
    categoryId: catMap["fast-food"], 
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=500&auto=format&fit=crop",
    hasVariations: true,
    variations: [
      { name: "Simple", ...withMarkup(70) },
      { name: "Veg", ...withMarkup(90) },
      { name: "Paneer", ...withMarkup(120) },
    ]
  },

  // Shake
  { name: "Vanilla Shake", ...withMarkup(69), categoryId: catMap.shake, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=500&auto=format&fit=crop" },
  { name: "Cold Coffee", ...withMarkup(79), categoryId: catMap.shake, image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=500&auto=format&fit=crop" },
];

const seedDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to DB for seeding...");

    // Clear existing
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Seed Users
    await User.create(users);
    console.log("Users seeded successfully.");

    // Seed Categories
    const createdCats = await Category.create(categories);
    const catMap = {};
    createdCats.forEach(c => { catMap[c.slug] = c._id; });
    console.log("Categories seeded successfully.");

    // Seed Products
    await Product.create(products(catMap));
    console.log("Products seeded successfully.");

    console.log("Database seeded successfully with marked-up prices!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
