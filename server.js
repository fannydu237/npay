import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

// 🔥 FIX PATH (__dirname en ES MODULE)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());

// =========================
// API ROUTES
// =========================
app.use("/api", paymentRoutes);

// =========================
// 🔥 SERVE FRONTEND (IMPORTANT)
// =========================
app.use(express.static(path.join(__dirname, "public")));

// 🔥 PAGE PRINCIPALE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =========================
// WEBHOOK (OPTIONNEL)
// =========================
app.post("/webhook/notchpay", (req, res) => {
  console.log("Webhook reçu:", req.body);
  res.status(200).send("OK");
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

console.log("ENV CHECK:", process.env.NOTCHPAY_PUBLIC_KEY);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});