import { config } from "dotenv";
import express from "express";
import cors from "cors";
import {
  validatePaymentRequest,
  getFundedAddresses,
  selectOptimalUTXOs,
  prepareTransactionData,
  executePayment,
  formatPaymentResponse,
  createDynamicPaymentMiddleware
} from "./helpers/index.js";

config();

const facilitatorUrl = process.env.FACILITATOR_URL;
const payTo = process.env.ADDRESS;
const agentQueryUrl = process.env.AGENT_QUERY_URL;
const agentUsername = process.env.AGENT_USERNAME;

if (!facilitatorUrl || !payTo || !agentQueryUrl || !agentUsername) {
  console.error(
    "Missing required environment variables: FACILITATOR_URL, ADDRESS, AGENT_QUERY_URL, AGENT_USERNAME"
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

// Parse JSON requests
app.use(express.json());

// Apply dynamic payment middleware to specific routes only
app.use("/weather", createDynamicPaymentMiddleware(facilitatorUrl));

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

/**
 * @title Pay API Endpoint
 * @description Processes payments using UTXO optimization system
 * @route POST /pay
 * @body {string} toAddress - Recipient address (required)
 * @body {number} amount - Amount to send in USDC (required)
 * @body {string} tokenAddress - Token address (optional, defaults to USDC)
 * @returns {Object} Payment result with transaction details
 */
app.post("/pay", async (req, res) => {
  try {
    console.log("💰 Processing payment request:", req.body);
    
    // Step 1: Validate request
    const { toAddress, amount, tokenAddress } = await validatePaymentRequest(req);
    const targetTokenAddress = tokenAddress || "0x4fCF1784B31630811181f670Aea7A7bEF803eaED";
    
    console.log("📋 Payment parameters:");
    console.log(`   To: ${toAddress}`);
    console.log(`   Amount: ${amount} USDC`);
    console.log(`   Token: ${targetTokenAddress}`);
    
    // Step 2: Get funded addresses
    const fundedAddresses = await getFundedAddresses();
    
    // Step 3: Select optimal UTXOs
    const utxoSelection = await selectOptimalUTXOs(fundedAddresses, amount);
    
    // Step 4: Prepare transaction data
    const multicallData = await prepareTransactionData(utxoSelection, toAddress, targetTokenAddress, amount);
    
    // Step 5: Execute payment
    const sponsorshipResult = await executePayment(multicallData, utxoSelection, toAddress, amount, targetTokenAddress, agentQueryUrl, agentUsername);
    
    // Step 6: Return response
    const response = formatPaymentResponse(sponsorshipResult, utxoSelection, toAddress, amount, multicallData);
    res.json(response);
    
  } catch (error) {
    console.error("❌ Payment failed:", error);
    
    res.status(500).json({
      success: false,
      error: "Payment processing failed",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:4021`);
  console.log(`Network: Sei Testnet`);
  console.log(`Facilitator: ${facilitatorUrl}`);
  console.log(`Available endpoints:`);
  console.log(`  • GET /health (free)`);
  console.log(`  • GET /weather (paid: $0.01 USDC)`);
  console.log(`  • POST /pay (UTXO-optimized payments)`);
  console.log(`     Example: curl -X POST http://localhost:4021/pay \\`);
  console.log(`       -H "Content-Type: application/json" \\`);
  console.log(`       -d '{"toAddress": "0x...", "amount": 0.0001}'`);
});
