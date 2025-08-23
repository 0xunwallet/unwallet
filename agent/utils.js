import { privateKeyToAccount } from "viem/accounts";
import {
  generateEphemeralPrivateKey,
  extractViewingPrivateKeyNode,
  generateKeysFromSignature,
  generateStealthPrivateKey,
} from "@fluidkey/stealth-account-kit";

import { seiTestnet } from "viem/chains";
import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
  parseUnits,
} from "viem";
import { getContractNetworks } from "./safe/safe-contracts.js";
import {
  buildSafeTransaction,
  predictSafeAddress,
  SAFE_ABI,
  USDC_ABI,
  safeSignTypedData,
} from "./safe/safe-utils.js";
import Safe from "@safe-global/protocol-kit";
import dotenv from "dotenv";
dotenv.config();

const BACKEND_URL = "https://unwall-production.up.railway.app";

const recipientAddress = "0xc6377415Ee98A7b71161Ee963603eE52fF7750FC";
const username = "agent1";
const balanceData = [
  {
    address: "0xAF9fC206261DF20a7f2Be9B379B101FAFd983117",
    balance: 0.01,
    symbol: "USDC",
    rawBalance: "10000",
    nonce: 48,
    decimals: 6,
    tokenAddress: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
    transactionHash:
      "0xd49df3695eef20ec51d3e6576caabdcb3f971ba80f9d02fa7a166935103d95eb",
    stealthAddress: "0xaf5ab6e55bf9151707b6d9951be6929ed667343e",
    safeAddress: "0xF8115536C3c629841FA92F5086C362Cd44E9cF41",
    isFunded: true,
  },
  {
    address: "0xAF9fC206261DF20a7f2Be9B379B101FAFd983117",
    balance: 0.01,
    symbol: "USDC",
    rawBalance: "10000",
    nonce: 47,
    decimals: 6,
    tokenAddress: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
    transactionHash:
      "0x78fa8c321c2bccf5b8e25c8d21626135625e3cfa28e605aeedeabef1982d8eb9",
    stealthAddress: "0xab825c26254b307879579e132910b2c0915cf455",
    safeAddress: "0xa0DaAC90ea81Bc8920C591573faacd265661262D",
    isFunded: true,
  },
  {
    address: "0xAF9fC206261DF20a7f2Be9B379B101FAFd983117",
    balance: 0.0001,
    symbol: "USDC",
    rawBalance: "100",
    nonce: 46,
    decimals: 6,
    tokenAddress: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
    transactionHash:
      "0xc04e70dcec0a6753282fe472dc692e44da24b4771ccec5698f222d940c7d6fdb",
    stealthAddress: "0x6fdadff32941f5a42f19e1c5aa8d8f2b7f0bf8e6",
    safeAddress: "0x68f01d0Ec730E9C29Adafaf5d8Ee5BddE106297b",
    isFunded: true,
  },
  {
    address: "0xAF9fC206261DF20a7f2Be9B379B101FAFd983117",
    balance: 0.0001,
    symbol: "USDC",
    rawBalance: "100",
    nonce: 45,
    decimals: 6,
    tokenAddress: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
    transactionHash:
      "0xb8e2979019eeae16b9b9ef8a640e09ec641a8cb4b2ed9487d155e752009d7de3",
    stealthAddress: "0xe3d26846eb729da2e3bedc2aa9faeec9ba9006bd",
    safeAddress: "0x72f6D7b33cB12460F6BFAD99848a3E60a52f1e42",
    isFunded: true,
  },
  {
    address: "0xAF9fC206261DF20a7f2Be9B379B101FAFd983117",
    balance: 0.0001,
    symbol: "USDC",
    rawBalance: "100",
    nonce: 44,
    decimals: 6,
    tokenAddress: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
    transactionHash:
      "0x8724eca0560195b7fc928bb3656715198846346b467bcb14b09bc72ee93a4b65",
    stealthAddress: "0x51aceee8d75b011882d2e915d4d5046be458f5d9",
    safeAddress: "0xF10bA8BbD0A45151A1a7CF4BF80A27FCC249F044",
    isFunded: true,
  },
  {
    address: "0xAF9fC206261DF20a7f2Be9B379B101FAFd983117",
    balance: 0.0001,
    symbol: "USDC",
    rawBalance: "100",
    nonce: 43,
    decimals: 6,
    tokenAddress: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
    transactionHash:
      "0x587da1f15169731f6d205e9dd2a555a63c16a58042c3167212a401e089a1ec3c",
    stealthAddress: "0xac514b3e56ce0eafb5311e738201c685a78ad3bc",
    safeAddress: "0x7c429182822a70B897e205f4Ba13937D1b3B2d07",
    isFunded: true,
  },
  {
    address: "0xAF9fC206261DF20a7f2Be9B379B101FAFd983117",
    balance: 0.0005,
    symbol: "USDC",
    rawBalance: "500",
    nonce: 42,
    decimals: 6,
    tokenAddress: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
    transactionHash:
      "0xbf9285d9e8d0fe073fb66d9aa59d8e9fe1405fadfbce8a9f899e97b7132cdbf5",
    stealthAddress: "0xc99ded2e32c1fd01e8492fb02ba5d4e819189f0c",
    safeAddress: "0xB1C5D706Ad1F73E2e50D82bF43b55a2c26809104",
    isFunded: true,
  },
];

const privateKey = process.env.AGENT_PRIVATE_KEY;

export const account = privateKeyToAccount(privateKey);
export const walletClient = createWalletClient({
  account,
  chain: seiTestnet,
  transport: http(seiTestnet.rpcUrls.default.http[0]),
});
export const publicClient = createPublicClient({
  chain: seiTestnet,
  transport: http(seiTestnet.rpcUrls.default.http[0]),
});

const STEALTH_ADDRESS_GENERATION_MESSAGE =
  "STEALTH_ADDRESS_GENERATION_ZZZZZ_SEI_TESTNET";

const generateInitialKeysOnClient = async (uniqueNonces) => {
  // STEP 1: Create a deterministic message for signing
  const message = STEALTH_ADDRESS_GENERATION_MESSAGE;

  const signature = await walletClient.signMessage({ message });

  const keys = generateKeysFromSignature(signature);

  // STEP 5: Extract the viewing key node (used for address generation)
  const viewKeyNodeNumber = 0; // Use the first node
  const viewingPrivateKeyNode = extractViewingPrivateKeyNode(
    keys.viewingPrivateKey,
    viewKeyNodeNumber
  );

  const processedKeys = uniqueNonces.map((nonce) => {
    const ephemeralPrivateKey = generateEphemeralPrivateKey({
      viewingPrivateKeyNode: viewingPrivateKeyNode,
      nonce: BigInt(nonce.toString()), // convert to bigint
      chainId: seiTestnet.id,
    });

    const ephemeralPrivateKeyRaw =
      ephemeralPrivateKey.ephemeralPrivateKey || ephemeralPrivateKey;

    let ephemeralPrivateKeyHex;
    if (
      (typeof ephemeralPrivateKeyRaw === "object" &&
        "byteLength" in ephemeralPrivateKeyRaw) ||
      (typeof Buffer !== "undefined" && Buffer.isBuffer(ephemeralPrivateKeyRaw))
    ) {
      ephemeralPrivateKeyHex = Array.from(ephemeralPrivateKeyRaw)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } else if (typeof ephemeralPrivateKeyRaw === "string") {
      ephemeralPrivateKeyHex = ephemeralPrivateKeyRaw.replace("0x", ""); // Remove 0x if present
    } else {
      // Handle other possible formats
      ephemeralPrivateKeyHex = String(ephemeralPrivateKeyRaw);
    }

    // Ensure it's in the correct format (0x prefixed hex string)
    const formattedEphemeralPrivateKey = `0x${ephemeralPrivateKeyHex}`;
    // Generate the ephemeral public key
    const ephemeralPublicKey = privateKeyToAccount(
      formattedEphemeralPrivateKey
    ).publicKey;

    // Generate spending private key for this nonce
    const spendingPrivateKey = generateStealthPrivateKey({
      spendingPrivateKey: keys.spendingPrivateKey,
      ephemeralPublicKey: ephemeralPublicKey,
    });

    // Handle the case where spendingPrivateKey might be an object, Uint8Array, or string
    const spendingPrivateKeyRaw =
      spendingPrivateKey.stealthPrivateKey ||
      spendingPrivateKey.privateKey ||
      spendingPrivateKey.spendingPrivateKey ||
      spendingPrivateKey.key ||
      spendingPrivateKey.value ||
      spendingPrivateKey;

    let formattedSpendingPrivateKey;
    if (
      (typeof spendingPrivateKeyRaw === "object" &&
        "byteLength" in spendingPrivateKeyRaw) ||
      (typeof Buffer !== "undefined" && Buffer.isBuffer(spendingPrivateKeyRaw))
    ) {
      const spendingPrivateKeyHex = Array.from(spendingPrivateKeyRaw)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      formattedSpendingPrivateKey = `0x${spendingPrivateKeyHex}`;
    } else if (typeof spendingPrivateKeyRaw === "string") {
      const cleanHex = spendingPrivateKeyRaw.replace("0x", "");
      formattedSpendingPrivateKey = `0x${cleanHex}`;
    } else {
      // If we still have an object, try to find the actual key
      console.error(
        "Unable to extract private key from:",
        spendingPrivateKeyRaw
      );
      throw new Error(
        "Cannot extract private key from spendingPrivateKey object"
      );
    }

    return formattedSpendingPrivateKey;
  });

  return processedKeys;
};

const executeTransactionWithGasSponsorship = async (
  multicallData,
  metadata = {}
) => {
  try {
    console.log("🌟 Requesting gas sponsorship for transaction...");
    console.log("📋 Multicall data:", {
      numberOfCalls: multicallData.length,
      calls: multicallData.map((call, index) => ({
        index: index + 1,
        target: call.target,
        allowFailure: call.allowFailure,
        dataLength: call.callData.length,
      })),
    });

    // Make request to gas sponsorship endpoint
    const response = await fetch(
      `${BACKEND_URL}/api/user/${username}/gas-sponsorship`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          multicallData,
          metadata: {
            ...metadata,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            requestId: `${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          },
        }),
      }
    );

    const result = await response.json();
    console.log("📄 Backend response:", result);

    if (!response.ok) {
      throw new Error(
        result.message || result.error || "Gas sponsorship request failed"
      );
    }

    if (!result.success) {
      throw new Error(
        result.message || "Gas sponsorship service returned failure"
      );
    }

    console.log("✅ Gas sponsored transaction completed successfully!");
    console.log("📊 Transaction details:", result);

    // Handle the backend response structure
    const txHash = result.data?.transactionHash || "pending";
    const explorerUrl =
      result.data?.executionDetails?.explorerUrl ||
      `${currentNetwork?.blockExplorer.url}/tx/${txHash}`;

    return {
      success: true,
      txHash: txHash,
      blockNumber: result.data?.blockNumber || 0,
      gasUsed: result.data?.gasUsed || "N/A",
      gasCost: result.data?.gasCost || "N/A",
      explorerUrl: explorerUrl,
      receipt: {
        status: "success",
        transactionHash: txHash,
        blockNumber: BigInt(result.data?.blockNumber || 0),
        gasUsed: BigInt(result.data?.gasUsed || 0),
      },
      sponsorDetails: {
        sponsorAddress: result.data?.sponsorAddress || "Unknown",
        chainName:
          result.data?.executionDetails?.chainName || currentNetwork?.name,
      },
    };
  } catch (error) {
    console.error("❌ Gas sponsorship request failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Gas sponsorship failed: ${errorMessage}`);
  }
};

const processSingleRedemptionWithSponsorship = async (
  index = 0,
  nonce = balanceData[index].nonce
) => {
  // Set this specific payment as redeeming
  const payment = balanceData[index];

  try {
    console.log("🚀 Starting sponsored redemption process...");
    console.log("📋 Payment details:", payment);
    console.log("🔢 Nonce:", nonce);

    // Generate stealth private key (same as before)
    const keys = await generateInitialKeysOnClient([nonce]);

    console.log("🔐 Keys:", keys);

    const spendingPrivateKey = keys[0];
    const stealthAddress = privateKeyToAccount(spendingPrivateKey).address;

    console.log("🔐 Stealth address derived:", stealthAddress);

    // Predict Safe address (same as before)
    const predictedSafeAddress = await predictSafeAddress(
      stealthAddress,
      seiTestnet.rpcUrls.default.http[0]
    );
    console.log("🏦 Predicted Safe address:", predictedSafeAddress);

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

    // Get custom contract networks configuration for the current network
    const contractNetworks = getContractNetworks(seiTestnet.id);

    console.log("🔧 Using custom contract networks for current network:", {
      chainId: seiTestnet.id,
      contractNetworks,
    });

    const protocolKit = await Safe.init({
      provider: RPC_URL,
      signer: stealthAddress,
      predictedSafe,
      contractNetworks,
    });

    const deploymentTransaction =
      await protocolKit.createSafeDeploymentTransaction();

    console.log(
      "✅ Safe deployment transaction created",
      deploymentTransaction
    );

    // Create USDC transfer transaction (same as before)
    console.log("💸 Creating USDT transfer transaction from Safe...");

    // Create wallet client with spending private key
    const spendingWalletClient = createWalletClient({
      account: privateKeyToAccount(spendingPrivateKey),
      chain: seiTestnet,
      transport: http(RPC_URL),
    });
    console.log("payment required", payment.balance);
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
        recipientAddress,
        parseUnits(payment.balance.toString(), payment.decimals),
      ],
    });

    // Build Safe transaction (same as before)
    const safeTransaction = buildSafeTransaction({
      to: payment.tokenAddress,
      value: "0",
      data: transferData,
      operation: 0,
      safeTxGas: "0",
      nonce: 0,
    });

    // Sign the Safe transaction with proper account type
    const account = privateKeyToAccount(spendingPrivateKey);
    const signature = await safeSignTypedData(
      spendingWalletClient,
      account,
      predictedSafeAddress,
      safeTransaction,
      seiTestnet.id
    );

    console.log("✅ Safe transaction signed successfully");

    // Encode execTransaction call (same as before)
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

    console.log("✅ execTransaction data encoded");

    // Prepare multicall data (same as before)
    const multicallData = [
      // Deploy Safe
      {
        target: deploymentTransaction.to,
        allowFailure: false,
        callData: deploymentTransaction.data,
      },
      // Execute USDC transfer from Safe
      {
        target: predictedSafeAddress,
        allowFailure: false,
        callData: execTransactionData,
      },
    ];

    // 🌟 NEW: Execute with gas sponsorship instead of direct wallet transaction
    console.log("🌟 Executing transaction with gas sponsorship...");

    const sponsorshipResult = await executeTransactionWithGasSponsorship(
      multicallData,
      {
        operationType: "payment_redemption",
        paymentIndex: index,
        nonce: nonce,
        stealthAddress: stealthAddress,
        safeAddress: predictedSafeAddress,
        recipientAddress: recipientAddress,
        tokenAddress: payment.tokenAddress,
        amount: payment.balance.toString(),
        symbol: payment.symbol,
      }
    );

    console.log("✅ Gas sponsored transaction completed successfully!");

    // Verify the transfer worked (enhanced with sponsorship details)
    console.log("🔍 Verifying USDT transfer results...");

    // Check recipient balance
    const recipientBalanceData = encodeFunctionData({
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [recipientAddress],
    });

    const recipientBalanceResult = await publicClient.call({
      to: payment.tokenAddress,
      data: recipientBalanceData,
    });

    const recipientBalance = BigInt(recipientBalanceResult.data || "0x0");
    const recipientBalanceFormatted = (
      Number(recipientBalance) / Math.pow(10, payment.decimals)
    ).toFixed(2);

    console.log("✅ Gas sponsored transfer verification:", {
      recipient: recipientAddress,
      receivedAmount: `${recipientBalanceFormatted} ${payment.symbol}`,
      transactionHash: sponsorshipResult.txHash,
      explorerUrl: sponsorshipResult.explorerUrl,
      sponsorAddress: sponsorshipResult.sponsorDetails.sponsorAddress,
      gasUsed: sponsorshipResult.gasUsed,
      gasCost: sponsorshipResult.gasCost,
    });

    return {
      success: true,
      multicallData,
      deploymentTransaction,
      safeTransaction,
      signature,
      txHash: sponsorshipResult.txHash,
      gasUsed: sponsorshipResult.gasUsed,
      gasCost: sponsorshipResult.gasCost,
      explorerUrl: sponsorshipResult.explorerUrl,
      sponsorDetails: sponsorshipResult.sponsorDetails,
      summary: {
        stealthAddress,
        safeAddress: predictedSafeAddress,
        recipient: recipientAddress,
        multicallCalls: multicallData.length,
        executed: true,
        txHash: sponsorshipResult.txHash,
        recipientBalance: `${recipientBalanceFormatted} ${payment.symbol}`,
        sponsoredBy: sponsorshipResult.sponsorDetails.sponsorAddress,
        gasUsed: sponsorshipResult.gasUsed,
        explorerUrl: sponsorshipResult.explorerUrl,
      },
    };
  } catch (error) {
    console.error("❌ Sponsored redemption failed:", error);

    throw error;
  }
};

const finalResult = await processSingleRedemptionWithSponsorship();
console.log(finalResult);

console.log("finalResult", finalResult);
