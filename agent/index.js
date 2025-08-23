import { config } from "dotenv";
import express from "express";
import cors from "cors";
import { paymentMiddleware } from "x402-express";

config();

const facilitatorUrl = process.env.FACILITATOR_URL;
const payTo = process.env.ADDRESS;

if (!facilitatorUrl || !payTo) {
  console.error(
    "Missing required environment variables: FACILITATOR_URL, ADDRESS"
  );
  process.exit(1);
}

const app = express();

// Enable CORS for all origins
app.use(
  cors({
    origin: "*",
  })
);

async function getSafeAddress() {
  try {
    const data = await fetch(
      `${process.env.AGENT_QUERY_URL}/api/user/${process.env.AGENT_USERNAME}/stealth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chainId: 1328,
          tokenAddress: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
          tokenAmount: "1",
        }),
      }
    );

    const json = await data.json();
    console.log("Server response:", json);

    if (!json.success) {
      throw new Error(`Server error: ${json.error || "Unknown error"}`);
    }

    // Try to get Safe address first, fallback to stealth address if Safe prediction failed
    const safeAddress = json.data?.safeAddress?.address;

    if (safeAddress && safeAddress !== "") {
      console.log("Using Safe address:", safeAddress);
      return safeAddress;
    } else {
      throw new Error("No valid address found in response");
    }
  } catch (error) {
    console.error("Failed to get payment address:", error.message);
    throw error;
  }
}

// Create a dynamic payment middleware that gets fresh address on each request
const dynamicPaymentMiddleware = async (req, res, next) => {
  try {
    const paymentAddress = await getSafeAddress();

    // Create payment middleware with the fresh address
    const middleware = paymentMiddleware(
      paymentAddress,
      {
        "/weather": {
          price: "$0.01",
          network: "sei-testnet",
          config: {
            description: "Weather data access",
            mimeType: "application/json",
          },
        },
      },
      {
        url: facilitatorUrl,
      }
    );

    // Apply the middleware
    middleware(req, res, next);
  } catch (error) {
    console.error("Failed to setup payment middleware:", error.message);
    res.status(500).json({
      error: "Payment service unavailable",
      message: error.message,
    });
  }
};

// Apply dynamic payment middleware
app.use(dynamicPaymentMiddleware);

app.get("/weather", (req, res) => {
  console.log("🌤️ Serving weather data to paid user");

  res.json({
    report: {
      weather: "sunny",
      temperature: 70,
      location: "Test City",
      timestamp: new Date().toISOString(),
    },
  });
});

// Add health endpoint for testing
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:4021`);
  console.log(`Network: Sei Testnet`);
  console.log(`Facilitator: ${facilitatorUrl}`);
  console.log(`Available endpoints:`);
  console.log(`  • GET /health (free)`);
  console.log(`  • GET /weather (paid: $0.01 USDC)`);
});
