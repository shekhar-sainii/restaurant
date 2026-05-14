const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Models
const { Tenant, User, Category, Product, Table } = require("../models");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/restaurant";

const seedData = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for high-quality image seeding...");
    // 1. Clear existing data
    console.log("Cleaning up existing data...");
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Table.deleteMany({});
    // 2. Create Super Admin
    console.log("Creating Super Admin...");
    await User.create({
      name: "Global Super Admin",
      email: "superadmin@qservice.com",
      password: "superadmin123",
      role: "SUPER_ADMIN",
      isActive: true,
      tenantId: null
    });
    const restaurants = [
      {
        id: "restaurant01",
        slug: "rest01",
        name: "Luxe Pizza Kings",
        color: "#ca1b1b",
        admin: "admin@rest01.com",
        logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop",
        categories: [
          { name: "Artisanal Pizzas", img: "https://images.unsplash.com/photo-1593504049359-74330189a355?q=80&w=1500" },
          { name: "Italian Sides", img: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=1500" },
          { name: "Premium Mocktails", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1500" }
        ],
        products: [
          { name: "Truffle Mushroom Pizza", price: 599, catIdx: 0, img: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=1500" },
          { name: "Fiery Burrata Pizza", price: 499, catIdx: 0, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=2070" },
          { name: "Cheesy Garlic Bread", price: 199, catIdx: 1, img: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=1500" }
        ]
      },
      {
        id: "restaurant02",
        slug: "burgerhub",
        name: "Urban Burger Hub",
        color: "#f57c00",
        admin: "admin@burgerhub.com",
        logo: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2070&auto=format&fit=crop",
        categories: [
          { name: "Gourmet Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1500" },
          { name: "Crispy Fries", img: "https://images.unsplash.com/photo-1573015084170-a6e033834241?q=80&w=1500" },
          { name: "Thick Shakes", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=1500" }
        ],
        products: [
          { name: "The Big Beast Burger", price: 449, catIdx: 0, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899" },
          { name: "Classic Cheese Burger", price: 349, catIdx: 0, img: "https://images.unsplash.com/photo-1571091723244-13c5213d0950?q=80&w=1500" },
          { name: "Cajun Spiced Fries", price: 179, catIdx: 1, img: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=1500" }
        ]
      },
      {
        id: "restaurant03",
        slug: "sushizen",
        name: "Sushi Zen Garden",
        color: "#00695c",
        admin: "admin@sushizen.com",
        logo: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop",
        categories: [
          { name: "Fresh Nigiri", img: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?q=80&w=1500" },
          { name: "Hand Rolls", img: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1500" },
          { name: "Japanese Tea", img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1500" }
        ],
        products: [
          { name: "Salmon Sashimi", price: 699, catIdx: 0, img: "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?q=80&w=1500" },
          { name: "Dragon Roll", price: 549, catIdx: 1, img: "https://images.unsplash.com/photo-1559466273-d95e72debaf8?q=80&w=1500" },
          { name: "Matcha Latte", price: 249, catIdx: 2, img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=1500" }
        ]
      }
    ];

    for (const res of restaurants) {
      console.log(`\nSeeding: ${res.name}...`);

      // Create Tenant
      const tenant = await Tenant.create({
        tenantId: res.id,
        slug: res.slug,
        businessName: res.name,
        dbMode: "SHARED",
        status: "ACTIVE",
        logo: res.logo,
        theme: {
          primaryColor: res.color,
          mode: "dark"
        },
        paymentSettings: {
          upiIdPrimary: `${res.slug}@ybl`,
          upiIdSecondary: `paytm${res.slug}@ptm`,
          upiMerchantName: res.name
        }
      });

      // Create Admin
      const admin = await User.create({
        name: `${res.name} Admin`,
        email: res.admin,
        password: "admin123",
        role: "ADMIN",
        tenantId: res.id,
        isActive: true
      });

      tenant.ownerAdminId = admin._id;
      await tenant.save();

      // Categories
      const cats = [];
      for (let i = 0; i < res.categories.length; i++) {
        const c = await Category.create({
          tenantId: res.id,
          name: res.categories[i].name,
          slug: res.categories[i].name.toLowerCase().replace(/ /g, "-"),
          image: res.categories[i].img,
          sortOrder: i
        });
        cats.push(c);
      }

      // Products
      for (const p of res.products) {
        await Product.create({
          tenantId: res.id,
          name: p.name,
          slug: p.name.toLowerCase().replace(/ /g, "-"),
          price: p.price,
          categoryId: cats[p.catIdx]._id,
          image: p.img,
          isAvailable: true
        });
      }

      // Tables
      for (let i = 1; i <= 5; i++) {
        await Table.create({
          tenantId: res.id,
          tableNumber: i,
          capacity: 4,
          status: "AVAILABLE"
        });
      }
    }

    console.log("\n==================================================");
    console.log("HIGH-QUALITY SEEDING COMPLETED");
    console.log("==================================================");
    console.log("The platform now has professional-grade imagery.");
    process.exit(0);
  } catch (error) {
    console.error("Error during high-quality seeding:", error);
    process.exit(1);
  }
};

seedData();
