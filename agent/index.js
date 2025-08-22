import { config } from "dotenv";
import express from "express";
import { paymentMiddleware } from "x402-express";

config();

const facilitatorUrl = process.env.FACILITATOR_URL;
const payTo = process.env.ADDRESS;

if (!facilitatorUrl || !payTo) {
  console.error("Missing required environment variables: FACILITATOR_URL, ADDRESS");
  process.exit(1);
}

const app = express();

// FIXED: Use route path without HTTP method prefix
app.use(
  paymentMiddleware(
    payTo,
    {
      "/weather": {
        price: "$0.0001",
        network: "sei-testnet",
        config: {
          description: "Weather data access",
          mimeType: "application/json"
        }
      }
    },
    {
      url: facilitatorUrl,
    },
  ),
);

app.get("/weather", (req, res) => {
  console.log('🌤️ Serving weather data to paid user');
  
  res.json({
    report: {
      weather: "sunny",
      temperature: 70,
      location: "Test City",
      timestamp: new Date().toISOString()
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
  console.log(`Payment recipient: ${payTo}`);
  console.log(`Available endpoints:`);
  console.log(`  • GET /health (free)`);
  console.log(`  • GET /weather (paid: $0.0001 USDC)`);
});