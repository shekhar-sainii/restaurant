/**
 * Full Multi-Tenant Seed Script
 * Creates 5 tenants with categories, products, and sample orders.
 *
 * Run: node backend/scripts/seed-all-tenants.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

// ─── Tenant Definitions ───────────────────────────────────────────────────────

const TENANTS = [
  {
    tenantId: "pizzakings",
    slug: "pizzakings",
    businessName: "Pizza Kings",
    businessType: "RESTAURANT",
    theme: { primaryColor: "#c9a227", backgroundColor: "#0f0f0f", fontFamily: "Playfair Display" },
    paymentSettings: {
      cashEnabled: true, upiEnabled: true,
      upiIdPrimary: "shivanshsaini733@oksbi",
      upiIdSecondary: "9520640928@okbizaxis",
      upiMerchantName: "Pizza Kings",
    },
    enabledModules: { dineIn: true, delivery: true, tableOrdering: true, qrOrdering: true, chat: true, staffMgmt: true },
    subscriptionPlan: "FREE",
    admin: { name: "Pizza Kings Admin", email: "admin@pizzakings.com", mobile: "9000000001", password: "Admin@123" },
    categories: [
      { name: "Pizzas",       slug: "pizzas",       sortOrder: 1 },
      { name: "Sides",        slug: "sides",        sortOrder: 2 },
      { name: "Beverages",    slug: "beverages",    sortOrder: 3 },
      { name: "Desserts",     slug: "desserts",     sortOrder: 4 },
    ],
    products: [
      { cat: "pizzas",    name: "Margherita Pizza",    price: 199, disc: 179, desc: "Classic tomato base with fresh mozzarella and basil", isVeg: true,  variations: [{ name: "Small", price: 199, discountedPrice: 179 }, { name: "Medium", price: 299, discountedPrice: 269 }, { name: "Large", price: 399, discountedPrice: 359 }] },
      { cat: "pizzas",    name: "Farm Fresh Pizza",    price: 249, disc: 219, desc: "Loaded with seasonal farm vegetables", isVeg: true,  variations: [{ name: "Small", price: 249 }, { name: "Medium", price: 349 }, { name: "Large", price: 449 }] },
      { cat: "pizzas",    name: "Paneer Pizza",        price: 279, disc: 249, desc: "Spiced cottage cheese with bell peppers", isVeg: true,  variations: [{ name: "Small", price: 279 }, { name: "Medium", price: 379 }, { name: "Large", price: 479 }] },
      { cat: "pizzas",    name: "Cheese Burst Pizza",  price: 329, disc: 299, desc: "Oozing cheese in every bite", isVeg: true,  variations: [{ name: "Medium", price: 329, discountedPrice: 299 }, { name: "Large", price: 429, discountedPrice: 389 }] },
      { cat: "pizzas",    name: "BBQ Chicken Pizza",   price: 349, disc: 319, desc: "Smoky BBQ sauce with grilled chicken", isVeg: false, variations: [{ name: "Small", price: 349 }, { name: "Medium", price: 449 }, { name: "Large", price: 549 }] },
      { cat: "sides",     name: "Garlic Bread",        price: 99,  disc: 89,  desc: "Crispy garlic bread with herb butter", isVeg: true },
      { cat: "sides",     name: "Loaded Fries",        price: 129, disc: 109, desc: "Crispy fries with cheese and jalapeños", isVeg: true },
      { cat: "beverages", name: "Coca Cola",           price: 60,  disc: null, desc: "Chilled 300ml can", isVeg: true },
      { cat: "beverages", name: "Fresh Lime Soda",     price: 79,  disc: null, desc: "Refreshing lime with soda", isVeg: true },
      { cat: "desserts",  name: "Choco Lava Cake",     price: 149, disc: 129, desc: "Warm chocolate cake with molten center", isVeg: true },
    ],
  },
  {
    tenantId: "honeyhub",
    slug: "honeyhub",
    businessName: "Honey Hub",
    businessType: "HONEY_STORE",
    theme: { primaryColor: "#f59e0b", backgroundColor: "#0f0a00", fontFamily: "Inter" },
    paymentSettings: {
      cashEnabled: true, upiEnabled: true,
      upiIdPrimary: "honeyhub@upi",
      upiIdSecondary: null,
      upiMerchantName: "Honey Hub",
    },
    enabledModules: { dineIn: false, delivery: true, tableOrdering: false, qrOrdering: false, weightPricing: true, chat: true, staffMgmt: true },
    subscriptionPlan: "STARTER",
    admin: { name: "Honey Hub Admin", email: "admin@honeyhub.com", mobile: "9000000002", password: "Admin@123" },
    categories: [
      { name: "Raw Honey",     slug: "raw-honey",     sortOrder: 1 },
      { name: "Organic Honey", slug: "organic-honey", sortOrder: 2 },
      { name: "Flavoured",     slug: "flavoured",     sortOrder: 3 },
      { name: "Gift Packs",    slug: "gift-packs",    sortOrder: 4 },
    ],
    products: [
      { cat: "raw-honey",     name: "Raw Honey 250g",       price: 199, disc: 179, desc: "Pure unprocessed raw honey, 250g jar", isVeg: true },
      { cat: "raw-honey",     name: "Raw Honey 500g",       price: 349, disc: 319, desc: "Pure unprocessed raw honey, 500g jar", isVeg: true },
      { cat: "raw-honey",     name: "Raw Honey 1kg",        price: 649, disc: 599, desc: "Family pack raw honey, 1kg jar", isVeg: true },
      { cat: "organic-honey", name: "Organic Honey 250g",   price: 249, disc: 219, desc: "Certified organic, no additives", isVeg: true },
      { cat: "organic-honey", name: "Mustard Honey 500g",   price: 399, disc: 369, desc: "Thick mustard flower honey, rich taste", isVeg: true },
      { cat: "organic-honey", name: "Forest Honey 500g",    price: 449, disc: 399, desc: "Wild forest honey, dark and aromatic", isVeg: true },
      { cat: "flavoured",     name: "Cinnamon Honey 250g",  price: 279, disc: 249, desc: "Honey infused with Ceylon cinnamon", isVeg: true },
      { cat: "flavoured",     name: "Ginger Honey 250g",    price: 279, disc: 249, desc: "Honey with fresh ginger extract", isVeg: true },
      { cat: "flavoured",     name: "Tulsi Honey 250g",     price: 299, disc: 269, desc: "Honey with holy basil, immunity booster", isVeg: true },
      { cat: "gift-packs",    name: "Honey Gift Box (3 jars)", price: 799, disc: 699, desc: "3 assorted honey jars in premium box", isVeg: true },
    ],
  },
  {
    tenantId: "bakerybliss",
    slug: "bakerybliss",
    businessName: "Bakery Bliss",
    businessType: "BAKERY",
    theme: { primaryColor: "#ec4899", backgroundColor: "#0f0008", fontFamily: "Georgia" },
    paymentSettings: {
      cashEnabled: true, upiEnabled: true,
      upiIdPrimary: "bakerybliss@upi",
      upiIdSecondary: null,
      upiMerchantName: "Bakery Bliss",
    },
    enabledModules: { dineIn: true, delivery: true, tableOrdering: false, qrOrdering: false, chat: true, staffMgmt: true },
    subscriptionPlan: "FREE",
    admin: { name: "Bakery Bliss Admin", email: "admin@bakerybliss.com", mobile: "9000000003", password: "Admin@123" },
    categories: [
      { name: "Cakes",    slug: "cakes",    sortOrder: 1 },
      { name: "Breads",   slug: "breads",   sortOrder: 2 },
      { name: "Pastries", slug: "pastries", sortOrder: 3 },
      { name: "Cookies",  slug: "cookies",  sortOrder: 4 },
    ],
    products: [
      { cat: "cakes",    name: "Chocolate Truffle Cake",  price: 599, disc: 549, desc: "Rich dark chocolate layers with ganache", isVeg: true, variations: [{ name: "500g", price: 599, discountedPrice: 549 }, { name: "1kg", price: 1099, discountedPrice: 999 }] },
      { cat: "cakes",    name: "Vanilla Sponge Cake",     price: 499, disc: 449, desc: "Light vanilla sponge with cream frosting", isVeg: true, variations: [{ name: "500g", price: 499 }, { name: "1kg", price: 949 }] },
      { cat: "cakes",    name: "Red Velvet Cake",         price: 649, disc: 599, desc: "Classic red velvet with cream cheese frosting", isVeg: true, variations: [{ name: "500g", price: 649 }, { name: "1kg", price: 1199 }] },
      { cat: "cakes",    name: "Black Forest Cake",       price: 699, disc: 649, desc: "Cherries, cream and chocolate layers", isVeg: true, variations: [{ name: "500g", price: 699 }, { name: "1kg", price: 1299 }] },
      { cat: "breads",   name: "Whole Wheat Bread",       price: 60,  disc: null, desc: "Freshly baked whole wheat loaf", isVeg: true },
      { cat: "breads",   name: "Sourdough Bread",         price: 120, disc: 109, desc: "Artisan sourdough with crispy crust", isVeg: true },
      { cat: "breads",   name: "Garlic Herb Focaccia",    price: 149, disc: 129, desc: "Italian flatbread with garlic and rosemary", isVeg: true },
      { cat: "pastries", name: "Croissant",               price: 79,  disc: null, desc: "Buttery flaky French croissant", isVeg: true },
      { cat: "pastries", name: "Chocolate Éclair",        price: 89,  disc: 79,  desc: "Choux pastry with chocolate glaze", isVeg: true },
      { cat: "cookies",  name: "Choco Chip Cookies (6pc)",price: 149, disc: 129, desc: "Soft baked cookies with chocolate chips", isVeg: true },
      { cat: "cookies",  name: "Butter Cookies (12pc)",   price: 199, disc: 179, desc: "Classic melt-in-mouth butter cookies", isVeg: true },
    ],
  },
  {
    tenantId: "freshgrocer",
    slug: "freshgrocer",
    businessName: "Fresh Grocer",
    businessType: "GROCERY",
    theme: { primaryColor: "#22c55e", backgroundColor: "#000f04", fontFamily: "Inter" },
    paymentSettings: {
      cashEnabled: true, upiEnabled: true,
      upiIdPrimary: "freshgrocer@upi",
      upiIdSecondary: null,
      upiMerchantName: "Fresh Grocer",
    },
    enabledModules: { dineIn: false, delivery: true, tableOrdering: false, qrOrdering: false, weightPricing: true, chat: true, staffMgmt: true },
    subscriptionPlan: "PRO",
    admin: { name: "Fresh Grocer Admin", email: "admin@freshgrocer.com", mobile: "9000000004", password: "Admin@123" },
    categories: [
      { name: "Staples",    slug: "staples",    sortOrder: 1 },
      { name: "Oils & Ghee",slug: "oils-ghee",  sortOrder: 2 },
      { name: "Spices",     slug: "spices",     sortOrder: 3 },
      { name: "Beverages",  slug: "beverages",  sortOrder: 4 },
    ],
    products: [
      { cat: "staples",   name: "Basmati Rice 5kg",      price: 399, disc: 369, desc: "Premium aged basmati rice", isVeg: true },
      { cat: "staples",   name: "Wheat Flour (Atta) 5kg",price: 249, disc: 229, desc: "Whole wheat chakki atta", isVeg: true },
      { cat: "staples",   name: "Sugar 1kg",              price: 55,  disc: null, desc: "Refined white sugar", isVeg: true },
      { cat: "staples",   name: "Toor Dal 1kg",           price: 149, disc: 139, desc: "Split pigeon peas", isVeg: true },
      { cat: "staples",   name: "Moong Dal 1kg",          price: 139, disc: 129, desc: "Split green gram", isVeg: true },
      { cat: "oils-ghee", name: "Sunflower Oil 1L",       price: 149, disc: 139, desc: "Refined sunflower cooking oil", isVeg: true },
      { cat: "oils-ghee", name: "Mustard Oil 1L",         price: 169, disc: 155, desc: "Cold pressed mustard oil", isVeg: true },
      { cat: "oils-ghee", name: "Pure Desi Ghee 500g",    price: 499, disc: 469, desc: "Cow milk pure ghee", isVeg: true },
      { cat: "spices",    name: "Turmeric Powder 200g",   price: 49,  disc: null, desc: "Pure haldi powder", isVeg: true },
      { cat: "spices",    name: "Red Chilli Powder 200g", price: 59,  disc: null, desc: "Kashmiri red chilli powder", isVeg: true },
      { cat: "spices",    name: "Garam Masala 100g",      price: 79,  disc: 69,  desc: "Aromatic whole spice blend", isVeg: true },
      { cat: "beverages", name: "Tea Leaves 500g",        price: 199, disc: 179, desc: "Assam CTC tea leaves", isVeg: true },
      { cat: "beverages", name: "Coffee Powder 200g",     price: 249, disc: 229, desc: "South Indian filter coffee blend", isVeg: true },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randId() {
  return new mongoose.Types.ObjectId();
}

function orderNum(tenantId) {
  const ts = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 12);
  return `ORD-${ts}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  const db = mongoose.connection.db;

  for (const t of TENANTS) {
    console.log(`\n── Seeding: ${t.businessName} (${t.tenantId}) ──`);

    // 1. Upsert tenant admin user
    let adminId;
    const existingAdmin = await db.collection("users").findOne({ email: t.admin.email });
    if (existingAdmin) {
      adminId = existingAdmin._id;
      console.log(`  ℹ️  Admin exists: ${t.admin.email}`);
    } else {
      const hashed = await bcrypt.hash(t.admin.password, 10);
      const r = await db.collection("users").insertOne({
        tenantId: t.tenantId,
        name: t.admin.name,
        email: t.admin.email,
        mobile: t.admin.mobile,
        password: hashed,
        role: "ADMIN",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      adminId = r.insertedId;
      console.log(`  ✅ Admin created: ${t.admin.email} / ${t.admin.password}`);
    }

    // 2. Upsert tenant
    const existingTenant = await db.collection("tenants").findOne({ tenantId: t.tenantId });
    if (existingTenant) {
      console.log(`  ℹ️  Tenant exists: ${t.tenantId}`);
    } else {
      await db.collection("tenants").insertOne({
        tenantId: t.tenantId,
        slug: t.slug,
        businessName: t.businessName,
        businessType: t.businessType,
        status: "ACTIVE",
        dbMode: "SHARED",
        dbUri: null,
        logo: null,
        theme: t.theme,
        ownerAdminId: adminId,
        paymentSettings: {
          razorpayEnabled: false,
          razorpayKeyId: null,
          ...t.paymentSettings,
        },
        enabledModules: {
          dineIn: false, delivery: true, tableOrdering: false,
          qrOrdering: false, combos: false, weightPricing: false,
          chat: true, staffMgmt: true,
          ...t.enabledModules,
        },
        subscriptionPlan: t.subscriptionPlan,
        subscriptionExpiry: null,
        contactEmail: t.admin.email,
        contactPhone: t.admin.mobile,
        address: "India",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  ✅ Tenant created: /${t.slug}`);
    }

    // 3. Upsert categories
    const catMap = {}; // slug → _id
    for (const cat of t.categories) {
      const existing = await db.collection("categories").findOne({ tenantId: t.tenantId, slug: cat.slug });
      if (existing) {
        catMap[cat.slug] = existing._id;
      } else {
        const r = await db.collection("categories").insertOne({
          tenantId: t.tenantId,
          name: cat.name,
          slug: cat.slug,
          sortOrder: cat.sortOrder,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        catMap[cat.slug] = r.insertedId;
      }
    }
    console.log(`  ✅ Categories: ${Object.keys(catMap).length}`);

    // 4. Upsert products
    let prodCount = 0;
    const prodIds = [];
    for (const p of t.products) {
      const catId = catMap[p.cat];
      if (!catId) { console.warn(`  ⚠️  Category '${p.cat}' not found`); continue; }

      const existing = await db.collection("products").findOne({ tenantId: t.tenantId, name: p.name });
      if (existing) {
        prodIds.push(existing._id);
        continue;
      }

      const hasVariations = !!(p.variations && p.variations.length > 0);
      const r = await db.collection("products").insertOne({
        tenantId: t.tenantId,
        name: p.name,
        description: p.desc,
        price: p.price,
        discountedPrice: p.disc || null,
        categoryId: catId,
        image: null,
        isVeg: p.isVeg,
        hasVariations,
        variations: p.variations || [],
        isAvailable: true,
        tags: [],
        sortOrder: prodCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prodIds.push(r.insertedId);
      prodCount++;
    }
    console.log(`  ✅ Products: ${prodCount} new`);

    // 5. Sample orders (3 per tenant)
    const existingOrders = await db.collection("orders").countDocuments({ tenantId: t.tenantId });
    if (existingOrders === 0 && prodIds.length > 0) {
      const sampleOrders = [
        {
          orderStatus: "DELIVERED",
          paymentStatus: "PAID",
          paymentMethod: "CASH",
          orderType: t.enabledModules?.dineIn ? "DINING" : "DELIVERY",
          tableNumber: t.enabledModules?.dineIn ? 1 : null,
        },
        {
          orderStatus: "RECEIVED",
          paymentStatus: "PENDING",
          paymentMethod: null,
          orderType: "DELIVERY",
          tableNumber: null,
        },
        {
          orderStatus: "PREPARING",
          paymentStatus: "PAID",
          paymentMethod: "UPI",
          orderType: t.enabledModules?.dineIn ? "DINING" : "DELIVERY",
          tableNumber: t.enabledModules?.dineIn ? 2 : null,
        },
      ];

      for (const o of sampleOrders) {
        // Pick 2 random products
        const items = prodIds.slice(0, 2).map(pid => {
          const prod = t.products.find((_, i) => prodIds[i]?.toString() === pid.toString()) || t.products[0];
          return {
            productId: pid,
            name: prod?.name || "Item",
            price: prod?.price || 100,
            discountedPrice: prod?.disc || null,
            qty: Math.floor(Math.random() * 2) + 1,
            image: null,
            isVeg: prod?.isVeg ?? true,
          };
        });

        const subtotal = items.reduce((s, i) => s + (i.discountedPrice || i.price) * i.qty, 0);

        await db.collection("orders").insertOne({
          tenantId: t.tenantId,
          orderNumber: orderNum(t.tenantId),
          userId: null,
          guestName: "Test Customer",
          guestMobile: "9999999999",
          orderType: o.orderType,
          tableNumber: o.tableNumber,
          items,
          subtotal,
          discount: 0,
          deliveryCharge: 0,
          totalAmount: subtotal,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          paymentId: null,
          orderStatus: o.orderStatus,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 3),
          updatedAt: new Date(),
        });
      }
      console.log(`  ✅ Sample orders: 3`);
    } else {
      console.log(`  ℹ️  Orders already exist, skipping`);
    }
  }

  // ── Migrate existing data without tenantId → pizzakings ──────────────────
  console.log("\n── Migrating orphan records → pizzakings ──");
  for (const col of ["orders", "products", "categories", "tables", "payments"]) {
    const r = await db.collection(col).updateMany(
      { tenantId: { $in: [null, undefined, ""] } },
      { $set: { tenantId: "pizzakings" } }
    );
    if (r.modifiedCount > 0) console.log(`  ✅ ${col}: ${r.modifiedCount} migrated`);
  }
  const ur = await db.collection("users").updateMany(
    { tenantId: { $in: [null, undefined, ""] }, role: { $ne: "SUPER_ADMIN" } },
    { $set: { tenantId: "pizzakings" } }
  );
  if (ur.modifiedCount > 0) console.log(`  ✅ users: ${ur.modifiedCount} migrated`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed complete!\n");
  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│  Tenant Credentials                                         │");
  console.log("├─────────────────────────────────────────────────────────────┤");
  for (const t of TENANTS) {
    const line = `│  ${t.businessName.padEnd(18)} ${t.admin.email.padEnd(28)} Admin@123  │`;
    console.log(line);
  }
  console.log("├─────────────────────────────────────────────────────────────┤");
  console.log("│  URLs: /pizzakings  /honeyhub  /bakerybliss  /freshgrocer   │");
  console.log("│  Super Admin: node scripts/create-super-admin.js            │");
  console.log("└─────────────────────────────────────────────────────────────┘\n");

  await mongoose.disconnect();
}

seed().catch(err => { console.error("❌", err.message); process.exit(1); });
