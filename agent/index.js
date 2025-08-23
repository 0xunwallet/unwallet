import { config } from "dotenv";
import express from "express";
import cors from "cors";
import { paymentMiddleware } from "x402-express";
import { 
  findOptimalUTXOCombination,
  handleUTXOChange,
  executeTransactionWithGasSponsorship
} from "./utxo/index.js";
import {
  fetchBalanceData,
  generateInitialKeysOnClient
} from './utils.js';
import {
  predictSafeAddress,
  buildSafeTransaction,
  safeSignTypedData,
  SAFE_ABI
} from './safe/safe-utils.js';
import {
  encodeFunctionData,
  parseUnits,
  createWalletClient,
  http
} from 'viem';

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

// Apply dynamic payment middleware to specific routes only
app.use("/weather", dynamicPaymentMiddleware);

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
    
    const { toAddress, amount, tokenAddress } = req.body;
    
    // Validate required parameters
    if (!toAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: toAddress"
      });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid amount. Must be greater than 0"
      });
    }
    
    const targetTokenAddress = tokenAddress || "0x4fCF1784B31630811181f670Aea7A7bEF803eaED"; // USDC on Sei Testnet
    
    console.log("📋 Payment parameters:");
    console.log(`   To: ${toAddress}`);
    console.log(`   Amount: ${amount} USDC`);
    console.log(`   Token: ${targetTokenAddress}`);
    
    // Fetch balance data using existing function
    console.log("📡 Fetching balance data...");
    let fundedAddresses;
    
    try {
      fundedAddresses = await fetchBalanceData();
      console.log(`📊 Found ${fundedAddresses.length} UTXOs with positive balance`);
      
      if (fundedAddresses.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No UTXOs with positive balance found"
        });
      }
    } catch (fetchError) {
      console.error("❌ Failed to fetch balance data:", fetchError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch balance data",
        message: fetchError.message
      });
    }
    
    // Find optimal UTXO combination
    console.log("🎯 Finding optimal UTXO combination...");
    const utxoSelection = findOptimalUTXOCombination(fundedAddresses, amount);
    
    if (!utxoSelection.isTargetReached) {
      return res.status(400).json({
        success: false,
        error: "Insufficient funds",
        details: {
          requested: amount,
          available: utxoSelection.totalAmount,
          shortfall: amount - utxoSelection.totalAmount
        }
      });
    }
    
    // Handle change
    const changeInfo = handleUTXOChange(utxoSelection, toAddress, null);
    
    console.log("✅ UTXO selection completed:");
    console.log(`   Strategy: ${utxoSelection.strategy}`);
    console.log(`   UTXOs used: ${utxoSelection.selectedUTXOs.length}`);
    console.log(`   Total amount: ${utxoSelection.totalAmount}`);
    console.log(`   Change: ${utxoSelection.change}`);
    
    // Use imported functions directly (no dynamic imports needed)
    const { seiTestnet } = await import("viem/chains");
    const { privateKeyToAccount } = await import("viem/accounts");
    const { getContractNetworks } = await import("./safe/safe-contracts.js");
    const Safe = await import("@safe-global/protocol-kit");
    
    // Prepare multicall data for transaction
    console.log("🔧 Preparing transaction data...");
    const multicallData = [];
    
    // Generate stealth keys for all selected UTXOs
    const allNonces = utxoSelection.selectedUTXOs.map(utxo => utxo.nonce);
    const allKeys = await generateInitialKeysOnClient(allNonces);
    
    console.log(`🔐 Generated ${allKeys.length} stealth keys for UTXOs`);
    
    // Process each UTXO to prepare transaction data
    for (let i = 0; i < utxoSelection.selectedUTXOs.length; i++) {
      const utxo = utxoSelection.selectedUTXOs[i];
      const spendingPrivateKey = allKeys[i];
      const stealthAddress = privateKeyToAccount(spendingPrivateKey).address;
      
      console.log(`🔍 Processing UTXO ${i + 1}/${utxoSelection.selectedUTXOs.length}:`);
      console.log(`   - Nonce: ${utxo.nonce}`);
      console.log(`   - Stealth Address: ${stealthAddress}`);
      console.log(`   - Safe Address: ${utxo.safeAddress}`);
      
      // Predict Safe address
      const predictedSafeAddress = await predictSafeAddress(
        stealthAddress,
        seiTestnet.rpcUrls.default.http[0]
      );
      
      // Check if Safe is deployed
      const predictedSafe = {
        safeAccountConfig: {
          owners: [stealthAddress],
          threshold: 1,
        },
        safeDeploymentConfig: {
          saltNonce: "0",
        },
      };

      const RPC_URL = seiTestnet.rpcUrls.default.http[0];
      const contractNetworks = getContractNetworks(seiTestnet.id);

      const protocolKit = await Safe.default.init({
        provider: RPC_URL,
        signer: stealthAddress,
        predictedSafe,
        contractNetworks,
      });

      // Check if Safe is already deployed
      let isSafeDeployed = false;
      let deploymentTransaction = null;
      let safeNonce = 0;
      
      try {
        isSafeDeployed = await protocolKit.isSafeDeployed();
      } catch (error) {
        console.log(`   - Safe not deployed yet, will create deployment transaction`);
        isSafeDeployed = false;
      }

      if (isSafeDeployed) {
        const publicClient = createPublicClient({
          chain: seiTestnet,
          transport: http(RPC_URL),
        });
        
        safeNonce = await publicClient.readContract({
          address: predictedSafeAddress,
          abi: SAFE_ABI,
          functionName: "nonce",
        });
        console.log(`   - Safe nonce: ${safeNonce}`);
      }
      
      if (!isSafeDeployed) {
        try {
          deploymentTransaction = await protocolKit.createSafeDeploymentTransaction();
          console.log(`   - ✅ Safe deployment transaction created`);
        } catch (error) {
          console.error(`   - ❌ Failed to create Safe deployment transaction:`, error);
          throw error;
        }
      } else {
        console.log(`   - ℹ️ Safe is already deployed, skipping deployment`);
      }
      
      // Create USDC transfer transaction
      const spendingWalletClient = createWalletClient({
        account: privateKeyToAccount(spendingPrivateKey),
        chain: seiTestnet,
        transport: http(RPC_URL),
      });
      
      // Encode USDC transfer function data
      const transferData = encodeFunctionData({
        abi: [
          {
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            name: "transfer",
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "transfer",
        args: [
          toAddress,
          parseUnits(utxo.amountToRedeem.toString(), 6), // USDC has 6 decimals
        ],
      });

      // Build Safe transaction
      const safeTransaction = buildSafeTransaction({
        to: targetTokenAddress,
        value: "0",
        data: transferData,
        operation: 0,
        safeTxGas: "0",
        nonce: safeNonce,
      });

      // Sign the Safe transaction
      const account = privateKeyToAccount(spendingPrivateKey);
      const signature = await safeSignTypedData(
        spendingWalletClient,
        account,
        predictedSafeAddress,
        safeTransaction,
        seiTestnet.id
      );

      console.log(`   - ✅ Safe transaction signed successfully`);

      // Encode execTransaction call
      const execTransactionData = encodeFunctionData({
        abi: SAFE_ABI,
        functionName: "execTransaction",
        args: [
          safeTransaction.to,
          BigInt(safeTransaction.value || "0"),
          safeTransaction.data,
          safeTransaction.operation,
          BigInt(safeTransaction.safeTxGas || "0"),
          BigInt(safeTransaction.baseGas || "0"),
          BigInt(safeTransaction.gasPrice || "0"),
          safeTransaction.gasToken ||
            "0x0000000000000000000000000000000000000000",
          safeTransaction.refundReceiver ||
            "0x0000000000000000000000000000000000000000",
          signature,
        ],
      });

      // Add deployment transaction if Safe is not deployed
      if (!isSafeDeployed && deploymentTransaction) {
        multicallData.push({
          target: deploymentTransaction.to,
          allowFailure: false,
          callData: deploymentTransaction.data,
        });
        console.log(`   - Added deployment for UTXO ${i + 1}: ${predictedSafeAddress}`);
      }
      
      // Add transfer transaction
      multicallData.push({
        target: predictedSafeAddress,
        allowFailure: false,
        callData: execTransactionData,
      });
      console.log(`   - Added transfer for UTXO ${i + 1}: ${utxo.amountToRedeem} USDC`);
    }
    
    // Execute transaction with gas sponsorship
    console.log("🚀 Executing transaction with gas sponsorship...");
    const sponsorshipResult = await executeTransactionWithGasSponsorship(
      multicallData,
      {
        operationType: "payment",
        toAddress: toAddress,
        amount: amount,
        tokenAddress: targetTokenAddress,
        utxoCount: utxoSelection.selectedUTXOs.length,
        strategy: utxoSelection.strategy
      },
      agentQueryUrl,
      agentUsername
    );
    
    console.log("✅ Payment completed successfully!");
    
    // Return success response
    res.json({
      success: true,
      message: "Payment processed successfully",
      data: {
        transactionHash: sponsorshipResult.txHash,
        amount: amount,
        toAddress: toAddress,
        gasUsed: sponsorshipResult.gasUsed,
        gasCost: sponsorshipResult.gasCost,
        explorerUrl: sponsorshipResult.explorerUrl,
        sponsorAddress: sponsorshipResult.sponsorDetails.sponsorAddress,
        utxoOptimization: {
          strategy: utxoSelection.strategy,
          utxosUsed: utxoSelection.selectedUTXOs.length,
          totalAmount: utxoSelection.totalAmount,
          change: utxoSelection.change,
          efficiency: {
            utxoEfficiency: utxoSelection.selectedUTXOs.length <= 2 ? 'high' : 'medium',
            changeEfficiency: utxoSelection.change < amount * 0.1 ? 'high' : 'medium',
            gasEfficiency: multicallData.length <= 4 ? 'high' : 'medium'
          }
        },
        timestamp: new Date().toISOString()
      }
    });
    
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
