import { v4 as uuidv4 } from "uuid";
import {
  createPaymentService,
  verifyPaymentService,
  processPaymentService
} from "../services/notchpayService.js";

// =========================
// CREATE PAYMENT
// =========================
export const createPayment = async (req, res) => {
  try {
    const { phone, gateway } = req.body;

    if (!phone || !gateway) {
      return res.status(400).json({
        message: "Numéro ou mode de paiement manquant"
      });
    }

    // 🔥 format téléphone
    const formattedPhone = phone.startsWith("+237")
      ? phone
      : "+237" + phone;

    // 🔥 mapping gateway -> channel
    const channel =
      gateway === "CM_MTNMOMO"
        ? "cm.mtn"
        : "cm.orange";

    const reference = "order_" + uuidv4();

    const payload = {
      amount: 10000, // change ici si besoin
      currency: "XAF",
      customer: {
        name: "Client",
        phone: formattedPhone
      },
      reference,
      callback: `${process.env.BASE_URL}/api/callback`,
      description: "Paiement 10000 FCFA"
    };

    console.log("PAYLOAD SENT:", payload);

    // 1️⃣ CREATE
    const payment = await createPaymentService(payload);

    console.log("CREATE RESPONSE:", payment);

    const paymentReference = payment?.transaction?.reference;

    // 🔥 IMPORTANT → enlève +237 pour le process
    const cleanPhone = formattedPhone.replace("+237", "");

    // 2️⃣ PROCESS
    const processResponse = await processPaymentService(
      paymentReference,
      cleanPhone,
      channel
    );

    console.log("PROCESS RESPONSE:", processResponse);

    return res.json({
      message: "Paiement lancé",
      status: processResponse?.transaction?.status || "processing"
    });

  } catch (error) {
    console.error("CREATE PAYMENT ERROR:", error?.response?.data || error);

    return res.status(500).json({
      message: "Erreur paiement",
      error: error?.response?.data || error.message
    });
  }
};

// =========================
// CALLBACK
// =========================
export const handleCallback = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).send("Reference manquante");
    }

    const payment = await verifyPaymentService(reference);

    const status = payment?.transaction?.status;

    if (status === "complete") return res.send("✅ Paiement réussi");
    if (status === "processing" || status === "pending")
      return res.send("⏳ Paiement en cours");

    return res.send("❌ Paiement échoué");

  } catch (error) {
    console.error("CALLBACK ERROR:", error);
    res.status(500).send("Erreur serveur");
  }
};