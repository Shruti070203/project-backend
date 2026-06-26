require("dotenv").config();
const path = require("path");
const cors = require("@fastify/cors");
const fastify = require("fastify")({ logger: true });
const swagger = require("@fastify/swagger");
const swaggerUI = require("@fastify/swagger-ui");
const {
  db,
  initializeDatabase,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductsByCategory,
  getStatistics,
} = require("./db");

const { registerUser, loginUser,verifyOtp, resendOtp, } = require("./auth");

const productSchema = {
  type: "object",
  properties: {
    id: { type: "number", description: "Product ID" },
    title: { type: "string", description: "Product name/title" },
    description: { type: "string", description: "Product description" },
    price: { type: "number", description: "Product price" },
    category: { type: "string", description: "Product category" },
    rating: { type: "number", description: "Product rating (1-5)" },
    stock: { type: "number", description: "Available stock" },
    brand: { type: "string", description: "Brand name" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["title", "description", "price", "category", "brand"],
};

const productRequestSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    price: { type: "number" },
    category: { type: "string" },
    rating: { type: "number" },
    stock: { type: "number" },
    brand: { type: "string" },
  },
};

const toNumber = (val, def = null) => {
  const n = Number(val);
  return isNaN(n) ? def : n;
};

async function registerPlugins() {
await fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "images"),
  prefix: "/images/",
});
// await fastify.register(cors, { origin: "*" });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Ecommerce Product API",
        description: "Amazon-like CRUD API with SQLite database, search, filters, and category-wise organization",
        version: "1.0.0",
        contact: { name: "API Support" },
      },
      tags: [
        { name: "Products", description: "General product operations" },
        { name: "Products - Electronics" },
        { name: "Products - Clothing" },
        { name: "Products - Books" },
        { name: "Products - Sports" },
        { name: "Products - Home" },
        { name: "Products - Beauty" },
        { name: "Products - Toys" },
        { name: "Statistics" },
      ],
      servers: [{ url: "http://localhost:3001" }],
    },
  });
  await fastify.register(swaggerUI, { routePrefix: "/docs" });
}

function registerRoutes() {

  fastify.post("/api/auth/register", registerUser);
    // Koi /api/auth/register pe aaye → registerUser function chalao
// Koi /api/auth/login pe aaye → loginUser function chalao

fastify.post("/api/auth/verify-otp", verifyOtp);

fastify.post("/api/auth/resend-otp", resendOtp);

  fastify.post("/api/auth/login", loginUser);

  fastify.get("/products", {
    schema: {
      tags: ["Products"],
      summary: "Get all products with filters",
      querystring: {
        type: "object",
        properties: {
          page: { type: "number", default: 1 },
          limit: { type: "number", default: 10 },
          category: { type: "string" },
          minPrice: { type: "number" },
          maxPrice: { type: "number" },
          rating: { type: "number" },
          search: { type: "string" },
          sortBy: { type: "string", default: "createdAt" },
          sortOrder: { type: "string", default: "DESC" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            total: { type: "number" },
            page: { type: "number" },
            limit: { type: "number" },
            data: { type: "array", items: productSchema },
          },
        },
      },
    },
  }, async (req) => {
    return getProducts({
      page: toNumber(req.query.page, 1),
      limit: toNumber(req.query.limit, 10),
      category: req.query.category,
      minPrice: toNumber(req.query.minPrice),
      maxPrice: toNumber(req.query.maxPrice),
      rating: toNumber(req.query.rating),
      search: req.query.search,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "DESC",
    });
  });

  fastify.get("/products/:id", {
    schema: {
      tags: ["Products"],
      summary: "Get product by ID",
      params: { type: "object", properties: { id: { type: "number" } }, required: ["id"] },
      response: {
        200: productSchema,
        404: { type: "object", properties: { message: { type: "string" } } },
      },
    },
  }, async (req, reply) => {
    const product = await getProductById(Number(req.params.id));
    if (!product) return reply.code(404).send({ message: "Product not found" });
    return product;
  });

  fastify.post("/products", {
    schema: {
      tags: ["Products"],
      summary: "Create new product",
      body: productRequestSchema,
      response: {
        201: { type: "object", properties: { message: { type: "string" }, data: productSchema } },
      },
    },
  }, async (req, reply) => {
    const newProduct = await createProduct(req.body);
    reply.code(201);
    return { message: "Product created successfully", data: newProduct };
  });

  fastify.patch("/products/:id", {
    schema: {
      tags: ["Products"],
      summary: "Update product",
      params: { type: "object", properties: { id: { type: "number" } }, required: ["id"] },
      body: productRequestSchema,
      response: {
        200: { type: "object", properties: { message: { type: "string" }, data: productSchema } },
        404: { type: "object", properties: { message: { type: "string" } } },
      },
    },
  }, async (req, reply) => {
    const updated = await updateProduct(toNumber(req.params.id), req.body);
    if (!updated) return reply.code(404).send({ message: "Product not found" });
    return { message: "Product updated successfully", data: updated };
  });

  fastify.delete("/products/:id", {
    schema: {
      tags: ["Products"],
      summary: "Delete product",
      params: { type: "object", properties: { id: { type: "number" } }, required: ["id"] },
      response: {
        200: { type: "object", properties: { message: { type: "string" }, data: productSchema } },
        404: { type: "object", properties: { message: { type: "string" } } },
      },
    },
  }, async (req, reply) => {
    const deleted = await deleteProduct(Number(req.params.id));
    if (!deleted) return reply.code(404).send({ message: "Product not found" });
    return { message: "Product deleted successfully", data: deleted };
  });

  fastify.get("/categories", {
    schema: {
      tags: ["Products"],
      summary: "Get all categories",
      response: { 200: { type: "array", items: { type: "string" } } },
    },
  }, async () => getCategories());

  const categoryRoutes = ["Electronics", "Clothing", "Books", "Sports", "Home", "Beauty", "Toys"];

  for (const category of categoryRoutes) {
    const tagName = `Products - ${category}`;

    fastify.get(`/categories/${category.toLowerCase()}/products`, {
      schema: {
        tags: [tagName],
        summary: `Get ${category} products`,
        querystring: { type: "object", properties: { page: { type: "number", default: 1 }, limit: { type: "number", default: 10 } } },
        response: {
          200: {
            type: "object",
            properties: {
              total: { type: "number" }, page: { type: "number" },
              limit: { type: "number" }, category: { type: "string" },
              data: { type: "array", items: productSchema },
            },
          },
        },
      },
    }, async (req) => {
      const result = await getProductsByCategory(category, toNumber(req.query.page, 1), toNumber(req.query.limit, 10));
      return { ...result, category };
    });

    fastify.get(`/categories/${category.toLowerCase()}/stats`, {
      schema: { tags: [tagName], summary: `Get ${category} statistics` },
    }, async () => {
      const result = await getProducts({ category, limit: 10000 });
      if (result.data.length === 0) return { category, totalProducts: 0, avgPrice: 0, minPrice: 0, maxPrice: 0, avgRating: 0, totalStock: 0 };
      const stats = result.data.reduce((acc, p) => {
        acc.avgPrice += p.price || 0;
        acc.minPrice = Math.min(acc.minPrice, p.price || 0);
        acc.maxPrice = Math.max(acc.maxPrice, p.price || 0);
        acc.avgRating += p.rating || 0;
        acc.totalStock += p.stock || 0;
        return acc;
      }, { avgPrice: 0, minPrice: Infinity, maxPrice: 0, avgRating: 0, totalStock: 0 });
      return {
        category,
        totalProducts: result.data.length,
        avgPrice: +(stats.avgPrice / result.data.length).toFixed(2),
        minPrice: stats.minPrice,
        maxPrice: stats.maxPrice,
        avgRating: +(stats.avgRating / result.data.length).toFixed(2),
        totalStock: stats.totalStock,
      };
    });

    fastify.post(`/categories/${category.toLowerCase()}/products`, {
      schema: { tags: [tagName], summary: `Create ${category} product`, body: productRequestSchema },
    }, async (req, reply) => {
      const newProduct = await createProduct({ ...req.body, category });
      reply.code(201);
      return { message: `${category} product created successfully`, data: newProduct };
    });
  }

  fastify.get("/statistics", {
    schema: { tags: ["Statistics"], summary: "Get API statistics" },
  }, async () => getStatistics());

  fastify.get("/health", {
    schema: { tags: ["Statistics"], summary: "Health check" },
  }, async () => ({ status: "ok", timestamp: new Date().toISOString() }));
}

const start = async () => {
  try {
    await initializeDatabase();

    // await fastify.register(cors, { origin: "*" });
    await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
});
    fastify.log.info("✓ Database initialized");
    await registerPlugins();
    fastify.log.info("✓ Swagger registered");
    registerRoutes();
    fastify.log.info("✓ Routes registered");
    await fastify.listen({ port: 3001, host: "0.0.0.0" });
    console.log("\n========================================");
    console.log("✨ Server running successfully!");
    console.log("========================================");
    console.log("API:      http://localhost:3001");
    console.log("Docs:     http://localhost:3001/docs");
    console.log("Health:   http://localhost:3001/health");
    console.log("Stats:    http://localhost:3001/statistics");
    console.log("========================================\n");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

};
start();

