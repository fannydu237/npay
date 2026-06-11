import axios from "axios";

const API_URL = "https://api.notchpay.co";

const getApiKey = () => process.env.NOTCHPAY_PUBLIC_KEY;

// 🔥 instance axios propre
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000 // 🔥 augmenté (30s)
});

// =========================
// CREATE PAYMENT
// =========================
export const createPaymentService = async (payload) => {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      throw new Error("NOTCHPAY_PUBLIC_KEY non défini");
    }

    const response = await api.post(
      "/payments",
      payload,
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error("❌ Create Payment Error:", error.response?.data || error.message);

    // 🔥 retry UNE FOIS si timeout
    if (error.code === "ECONNABORTED") {
      try {
        console.log("🔁 Retry create payment...");
        const retry = await api.post("/payments", payload, {
          headers: {
            Authorization: getApiKey(),
            "Content-Type": "application/json"
          }
        });
        return retry.data;
      } catch (err) {
        throw err.response?.data || err;
      }
    }

    throw error.response?.data || error;
  }
};

// =========================
// PROCESS PAYMENT
// =========================
export const processPaymentService = async (reference, phone, channel) => {
  try {
    const apiKey = getApiKey();

    if (!reference) {
      throw new Error("Reference manquante");
    }

    const response = await api.post(
      `/payments/${reference}`,
      {
        channel: channel,
        data: {
          account_number: phone
        }
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error("❌ Process Payment Error:", error.response?.data || error.message);

    // 🔥 retry UNE FOIS si timeout
    if (error.code === "ECONNABORTED") {
      try {
        console.log("🔁 Retry process payment...");
        const retry = await api.post(
          `/payments/${reference}`,
          {
            channel: channel,
            data: {
              account_number: phone
            }
          },
          {
            headers: {
              Authorization: getApiKey(),
              "Content-Type": "application/json"
            }
          }
        );
        return retry.data;
      } catch (err) {
        throw err.response?.data || err;
      }
    }

    throw error.response?.data || error;
  }
};

// =========================
// VERIFY PAYMENT
// =========================
export const verifyPaymentService = async (reference) => {
  try {
    const apiKey = getApiKey();

    const response = await api.get(
      `/payments/${reference}`,
      {
        headers: {
          Authorization: apiKey
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error("❌ Verify Payment Error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};