const mongoose = require("mongoose");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/restaurant";
const TENANT_ID = "restaurant01"; // Found from DB search

const data = {
  "BURGER": [
    { name: "Aloo Tikki Burger", price: 30, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800" },
    { name: "Veggie Burger", price: 45, image: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&q=80&w=800" },
    { name: "Cheesy Burger", price: 60, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800" },
    { name: "Cheesy Spicy Burger", price: 65, image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=800" },
    { name: "Paneer Tikka Burger", price: 80, image: "https://images.unsplash.com/photo-1547584370-2cc98b8b8dc8?auto=format&fit=crop&q=80&w=800" }
  ],
  "SANDWICH": [
    { name: "Grilled Sandwich (2 pcs.)", price: 60, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800" },
    { name: "Cheesy Grill", price: 70, image: "https://images.unsplash.com/photo-1475090169767-40ed8d18f67d?auto=format&fit=crop&q=80&w=800" },
    { name: "Paneer Grilled Sandwich", price: 85, image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&q=80&w=800" },
    { name: "Cheese Toast", price: 80, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800" }
  ],
  "FRIES": [
    { name: "French Fries", price: 59, image: "https://images.unsplash.com/photo-1630384066252-19e1ad95b4f6?auto=format&fit=crop&q=80&w=800" },
    { name: "Masala Fries", price: 69, image: "https://images.unsplash.com/photo-1585109649139-366815a0d33b?auto=format&fit=crop&q=80&w=800" },
    { name: "Saucy Fries", price: 79, image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80&w=800" },
    { name: "Peri-Peri Fries", price: 89, image: "https://images.unsplash.com/photo-1576444356170-66073046b1bc?auto=format&fit=crop&q=80&w=800" }
  ],
  "PASTA": [
    { name: "Red Pasta", price: 79, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800" },
    { name: "White Pasta", price: 89, image: "https://images.unsplash.com/photo-1645112481338-3560e909247d?auto=format&fit=crop&q=80&w=800" },
    { name: "Jambo Pasta", price: 99, image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&q=80&w=800" },
    { name: "Tandoori Pasta", price: 99, image: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&q=80&w=800" },
    { name: "Makhni Pasta", price: 99, image: "https://images.unsplash.com/photo-1598866594230-a7c12756260f?auto=format&fit=crop&q=80&w=800" }
  ],
  "SIDE ORDER": [
    { name: "Cheesy Dip", price: 20, image: "https://images.unsplash.com/photo-1576097449798-5c6f423f80c1?auto=format&fit=crop&q=80&w=800" },
    { name: "Spicy Dip", price: 20, image: "https://images.unsplash.com/photo-1585238341267-1cfec2046a55?auto=format&fit=crop&q=80&w=800" }
  ],
  "PIZZA": [
    {
      name: "Plain Pizza",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Regular", price: 99 },
        { name: "Medium", price: 199 },
        { name: "Large", price: 299 }
      ]
    },
    {
      name: "Cheesy Mushroom Pizza",
      image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Regular", price: 139 },
        { name: "Medium", price: 269 },
        { name: "Large", price: 399 }
      ]
    },
    {
      name: "Achari Pizza",
      image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Regular", price: 149 },
        { name: "Medium", price: 289 },
        { name: "Large", price: 399 }
      ]
    },
    {
      name: "Veg Deluxe Pizza",
      image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Regular", price: 169 },
        { name: "Medium", price: 309 },
        { name: "Large", price: 469 }
      ]
    },
    {
      name: "Premium Pizza",
      image: "https://images.unsplash.com/photo-1574129623262-b43b0c220a23?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Regular", price: 189 },
        { name: "Medium", price: 329 },
        { name: "Large", price: 479 }
      ]
    },
    {
      name: "Pizza King",
      image: "https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Regular", price: 209 },
        { name: "Medium", price: 399 },
        { name: "Large", price: 549 }
      ]
    }
  ],
  "COMBO": [
    { name: "4 Pizza Combo", price: 275, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800" },
    { name: "Singles Onion", price: 65, variations: [{ name: "Add-on", price: 65 }], image: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&q=80&w=800" },
    { name: "Singles Capsicum", price: 70, variations: [{ name: "Add-on", price: 70 }], image: "https://images.unsplash.com/photo-1620310260481-91f97022204a?auto=format&fit=crop&q=80&w=800" },
    { name: "Singles Corn", price: 70, variations: [{ name: "Add-on", price: 70 }], image: "https://images.unsplash.com/photo-1541829070764-84a7d30dee62?auto=format&fit=crop&q=80&w=800" },
    { name: "Singles Tomato", price: 70, variations: [{ name: "Add-on", price: 70 }], image: "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?auto=format&fit=crop&q=80&w=800" }
  ],
  "DOUBLE COMBO": [
    { name: "5 Pizza Combo", price: 420, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&q=80&w=800" },
    { name: "Onion & Capsicum", price: 80, variations: [{ name: "Add-on", price: 80 }], image: "https://images.unsplash.com/photo-1620310260481-91f97022204a?auto=format&fit=crop&q=80&w=800" },
    { name: "Onion & Corn", price: 80, variations: [{ name: "Add-on", price: 80 }], image: "https://images.unsplash.com/photo-1541829070764-84a7d30dee62?auto=format&fit=crop&q=80&w=800" },
    { name: "Paneer & Capsicum", price: 100, variations: [{ name: "Add-on", price: 100 }], image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800" },
    { name: "Paneer & Onion", price: 100, variations: [{ name: "Add-on", price: 100 }], image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },
    { name: "Corn & Capsicum", price: 90, variations: [{ name: "Add-on", price: 90 }], image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800" }
  ],
  "EXTRA TOPPING": [
    {
      name: "Extra Topping",
      image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Regular", price: 20 },
        { name: "Medium", price: 30 },
        { name: "Large", price: 50 }
      ]
    }
  ],
  "EXTRA CHEESE": [
    {
      name: "Extra Cheese",
      image: "https://images.unsplash.com/photo-1523293662444-f7b21c1a0690?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Regular", price: 30 },
        { name: "Medium", price: 50 },
        { name: "Large", price: 90 }
      ]
    }
  ],
  "SHAKE & DESSERT": [
    { name: "Vanilla Shake", price: 69, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800" },
    { name: "Chocolate Shake", price: 79, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800" },
    { name: "Butterscotch Shake", price: 79, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800" },
    { name: "Strawberry Shake", price: 79, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800" },
    { name: "Coke / Sprite", price: 40, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800" },
    { name: "Cold Coffee", price: 79, image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=800" },
    { name: "Hot Coffee", price: 39, image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800" }
  ],
  "FAST FOOD": [
    {
      name: "Simple Noodles",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Half", price: 30 },
        { name: "Full", price: 60 }
      ]
    },
    {
      name: "Veg Noodles",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Half", price: 40 },
        { name: "Full", price: 80 }
      ]
    },
    {
      name: "Paneer Noodles",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Half", price: 50 },
        { name: "Full", price: 100 }
      ]
    },
    {
      name: "Simple Momos",
      image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b4?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Half", price: 50 },
        { name: "Full", price: 100 }
      ]
    },
    {
      name: "Veg Momos",
      image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b4?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Half", price: 70 },
        { name: "Full", price: 140 }
      ]
    },
    {
      name: "Paneer Momos",
      image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b4?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "Half", price: 80 },
        { name: "Full", price: 160 }
      ]
    },
    {
      name: "Spring Roll",
      image: "https://images.unsplash.com/photo-1544333346-64e43dec3933?auto=format&fit=crop&q=80&w=800",
      variations: [
        { name: "2 pcs.", price: 79 },
        { name: "4 pcs.", price: 159 }
      ]
    }
  ]
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    for (const [catName, products] of Object.entries(data)) {
      let category = await Category.findOne({ name: catName, tenantId: TENANT_ID });
      if (!category) {
        category = await Category.create({
          name: catName,
          slug: catName.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-"),
          tenantId: TENANT_ID,
          sortOrder: 0
        });
        console.log(`Created category: ${catName}`);
      }

      for (const p of products) {
        const hasVariations = !!p.variations;
        const basePrice = hasVariations ? p.variations[0].price : p.price;
        
        await Product.findOneAndUpdate(
          { name: p.name, tenantId: TENANT_ID },
          {
            $set: {
              tenantId: TENANT_ID,
              name: p.name,
              price: basePrice,
              image: p.image,
              categoryId: category._id,
              hasVariations: hasVariations,
              variations: p.variations || [],
              isAvailable: true,
              isVeg: true
            }
          },
          { upsert: true, returnDocument: 'after' }
        );
        console.log(`Updated/Added product: ${p.name}`);
      }
    }

    console.log("Seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();
