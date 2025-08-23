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
const username = process.env.AGENT_USERNAME || "agent1";

// Function to fetch balance data from API
const fetchBalanceData = async () => {
  try {
    console.log("📡 Fetching balance data from API...");
    console.log("🔗 URL:", `${BACKEND_URL}/api/user/${username}/funding-stats`);
    
    const response = await fetch(
      `${BACKEND_URL}/api/user/${username}/funding-stats`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📄 Raw API response structure:", {
      success: data.success,
      hasData: !!data.data,
      hasFundedAddresses: !!(data.data && data.data.fundedAddresses),
      fundedAddressesCount: data.data?.fundedAddresses?.length || 0
    });
    
    // Extract funded addresses from the response
    if (!data.success || !data.data || !data.data.fundedAddresses) {
      throw new Error("API response does not contain funded addresses");
    }
    
    const fundedAddresses = data.data.fundedAddresses;
    
    console.log("🔍 Checking actual USDC balance for each Safe...");
    
    // Check actual balance for each Safe and filter out zero balances
    const balanceDataWithActualBalance = [];
    
    for (const item of fundedAddresses) {
      try {
        console.log(`🔍 Checking balance for Safe: ${item.safeAddress} (nonce: ${item.nonce})`);
        
        // Check USDC balance of the Safe
        const balanceData = encodeFunctionData({
          abi: USDC_ABI,
          functionName: "balanceOf",
          args: [item.safeAddress],
        });

        const balanceResult = await publicClient.call({
          to: item.tokenAddress,
          data: balanceData,
        });

        const actualBalance = BigInt(balanceResult.data || "0x0");
        const actualBalanceFormatted = Number(actualBalance) / Math.pow(10, 6); // USDC has 6 decimals
        
        console.log(`💰 Safe ${item.safeAddress} has ${actualBalanceFormatted} USDC`);
        
        // Only include Safes with positive balance
        if (actualBalance > 0) {
          balanceDataWithActualBalance.push({
            address: item.fromAddress,
            balance: actualBalanceFormatted,
            symbol: "USDC",
            rawBalance: actualBalance.toString(),
            nonce: item.nonce,
            decimals: 6,
            tokenAddress: item.tokenAddress,
            transactionHash: item.transactionHash,
            stealthAddress: item.stealthAddress,
            safeAddress: item.safeAddress,
            isFunded: true,
            id: item.id,
            chainId: item.chainId,
            chainName: item.chainName,
            generatedAt: item.generatedAt,
            lastCheckedAt: item.lastCheckedAt
          });
        } else {
          console.log(`❌ Safe ${item.safeAddress} has zero balance, skipping`);
        }
      } catch (error) {
        console.error(`❌ Error checking balance for Safe ${item.safeAddress}:`, error);
        // Continue with other Safes even if one fails
      }
    }

    console.log("✅ Balance data fetched and filtered successfully:", {
      totalSafes: fundedAddresses.length,
      safesWithBalance: balanceDataWithActualBalance.length,
      safesWithZeroBalance: fundedAddresses.length - balanceDataWithActualBalance.length,
      firstItem: balanceDataWithActualBalance[0] ? { 
        nonce: balanceDataWithActualBalance[0].nonce, 
        balance: balanceDataWithActualBalance[0].balance, 
        symbol: balanceDataWithActualBalance[0].symbol,
        stealthAddress: balanceDataWithActualBalance[0].stealthAddress,
        safeAddress: balanceDataWithActualBalance[0].safeAddress
      } : null
    });

    return balanceDataWithActualBalance;
  } catch (error) {
    console.error("❌ Failed to fetch balance data:", error);
    throw error;
  }
};

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

// Function to find optimal UTXO combination for target amount
const findOptimalUTXOCombination = (balanceData, targetAmount) => {
  console.log(`🎯 Finding optimal UTXO combination for target: ${targetAmount} USDC`);
  console.log(`📊 Available UTXOs: ${balanceData.length} Safes with balances`);
  
  // Sort balances in descending order for greedy approach
  const sortedBalances = [...balanceData].sort((a, b) => b.balance - a.balance);
  
  let selectedUTXOs = [];
  let cumulativeAmount = 0;
  let remainingAmount = targetAmount;
  
  // Greedy algorithm: pick largest UTXOs first
  for (const utxo of sortedBalances) {
    if (cumulativeAmount >= targetAmount) {
      break; // We've reached our target
    }
    
    if (utxo.balance <= remainingAmount) {
      // This UTXO can be fully used
      selectedUTXOs.push({
        ...utxo,
        amountToRedeem: utxo.balance,
        isFullRedeem: true
      });
      cumulativeAmount += utxo.balance;
      remainingAmount -= utxo.balance;
    } else if (utxo.balance > remainingAmount && remainingAmount > 0) {
      // This UTXO is larger than needed, but we can use it
      selectedUTXOs.push({
        ...utxo,
        amountToRedeem: remainingAmount,
        isFullRedeem: false
      });
      cumulativeAmount += remainingAmount;
      remainingAmount = 0;
    }
  }
  
  console.log(`✅ UTXO Selection Results:`);
  console.log(`   - Target Amount: ${targetAmount} USDC`);
  console.log(`   - Selected UTXOs: ${selectedUTXOs.length}`);
  console.log(`   - Total Amount: ${cumulativeAmount.toFixed(6)} USDC`);
  console.log(`   - Remaining Target: ${remainingAmount.toFixed(6)} USDC`);
  
  selectedUTXOs.forEach((utxo, index) => {
    console.log(`   - UTXO ${index + 1}: ${utxo.safeAddress} (${utxo.balance} → ${utxo.amountToRedeem} USDC)`);
  });
  
  return {
    selectedUTXOs,
    totalAmount: cumulativeAmount,
    targetAmount,
    isTargetReached: cumulativeAmount >= targetAmount
  };
};

const processUTXORedemptionWithSponsorship = async (targetAmount = 0.0003) => {
  // Fetch balance data from API
  const balanceData = await fetchBalanceData();
  
  if (balanceData.length === 0) {
    throw new Error("No Safes with positive balance found");
  }
  
  // Find optimal UTXO combination
  const utxoSelection = findOptimalUTXOCombination(balanceData, targetAmount);
  
  if (!utxoSelection.isTargetReached) {
    console.log(`⚠️ Warning: Cannot reach target amount ${targetAmount} USDC`);
    console.log(`   Available: ${utxoSelection.totalAmount.toFixed(6)} USDC`);
    console.log(`   Shortfall: ${(targetAmount - utxoSelection.totalAmount).toFixed(6)} USDC`);
  }
  
  console.log("🚀 Starting UTXO-style redemption process...");

  try {
    // Process each UTXO to generate stealth keys and prepare transactions
    const utxoTransactions = [];
    const allNonces = utxoSelection.selectedUTXOs.map(utxo => utxo.nonce);
    
    console.log(`🔢 Processing ${utxoSelection.selectedUTXOs.length} UTXOs with nonces:`, allNonces);
    
    // Generate stealth keys for all nonces
    const allKeys = await generateInitialKeysOnClient(allNonces);
    console.log(`🔐 Generated ${allKeys.length} stealth keys`);
    
    // Process each UTXO
    for (let i = 0; i < utxoSelection.selectedUTXOs.length; i++) {
      const utxo = utxoSelection.selectedUTXOs[i];
      const spendingPrivateKey = allKeys[i];
      const stealthAddress = privateKeyToAccount(spendingPrivateKey).address;
      
      console.log(`\n🔍 Processing UTXO ${i + 1}/${utxoSelection.selectedUTXOs.length}:`);
      console.log(`   - Nonce: ${utxo.nonce}`);
      console.log(`   - Stealth Address: ${stealthAddress}`);
      console.log(`   - Safe Address: ${utxo.safeAddress}`);
      console.log(`   - Amount to Redeem: ${utxo.amountToRedeem} USDC`);
      
      // Predict Safe address
      const predictedSafeAddress = await predictSafeAddress(
        stealthAddress,
        seiTestnet.rpcUrls.default.http[0]
      );
      console.log(`   - Predicted Safe: ${predictedSafeAddress}`);
      
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

      const protocolKit = await Safe.init({
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

      if(isSafeDeployed) {
        safeNonce = await publicClient.readContract(
          {
            address: predictedSafeAddress,
            abi: SAFE_ABI,
            functionName: "nonce",
          }
        );
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
          recipientAddress,
          parseUnits(utxo.amountToRedeem.toString(), utxo.decimals),
        ],
      });

      // Build Safe transaction
      const safeTransaction = buildSafeTransaction({
        to: utxo.tokenAddress,
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

      // Store transaction data for multicall
      utxoTransactions.push({
        utxo,
        stealthAddress,
        predictedSafeAddress,
        isSafeDeployed,
        deploymentTransaction,
        execTransactionData,
        spendingPrivateKey
      });
    }

        // Build multicall data from all UTXO transactions
    console.log("\n📋 Building multicall data for all UTXOs...");
    const multicallData = [];
    
    for (let i = 0; i < utxoTransactions.length; i++) {
      const tx = utxoTransactions[i];
      
      // Add deployment transaction if Safe is not deployed
      if (!tx.isSafeDeployed && tx.deploymentTransaction) {
        multicallData.push({
          target: tx.deploymentTransaction.to,
          allowFailure: false,
          callData: tx.deploymentTransaction.data,
        });
        console.log(`   - Added deployment for UTXO ${i + 1}: ${tx.predictedSafeAddress}`);
      }
      
      // Add transfer transaction
      multicallData.push({
        target: tx.predictedSafeAddress,
        allowFailure: false,
        callData: tx.execTransactionData,
      });
      console.log(`   - Added transfer for UTXO ${i + 1}: ${tx.utxo.amountToRedeem} USDC`);
    }

    console.log("📋 Multicall data prepared:", {
      totalUTXOs: utxoTransactions.length,
      numberOfCalls: multicallData.length,
      calls: multicallData.map((call, index) => ({
        index: index + 1,
        target: call.target,
        allowFailure: call.allowFailure,
        dataLength: call.callData.length,
      })),
    });

    // Execute with gas sponsorship
    console.log("🌟 Executing UTXO redemption with gas sponsorship...");

    const sponsorshipResult = await executeTransactionWithGasSponsorship(
      multicallData,
      {
        operationType: "utxo_redemption",
        targetAmount: targetAmount,
        totalAmount: utxoSelection.totalAmount,
        utxoCount: utxoSelection.selectedUTXOs.length,
        nonces: allNonces,
        recipientAddress: recipientAddress,
        tokenAddress: utxoSelection.selectedUTXOs[0].tokenAddress, // All should be same token
        symbol: "USDC",
      }
    );

    console.log("✅ UTXO redemption completed successfully!");

    // Verify the transfer worked
    console.log("🔍 Verifying UTXO redemption results...");

    // Check recipient balance
    const recipientBalanceData = encodeFunctionData({
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [recipientAddress],
    });

    const recipientBalanceResult = await publicClient.call({
      to: utxoSelection.selectedUTXOs[0].tokenAddress,
      data: recipientBalanceData,
    });

    const recipientBalance = BigInt(recipientBalanceResult.data || "0x0");
    const recipientBalanceFormatted = (
      Number(recipientBalance) / Math.pow(10, 6)
    ).toFixed(6);

    console.log("✅ UTXO redemption verification:", {
      recipient: recipientAddress,
      receivedAmount: `${recipientBalanceFormatted} USDC`,
      transactionHash: sponsorshipResult.txHash,
      explorerUrl: sponsorshipResult.explorerUrl,
      sponsorAddress: sponsorshipResult.sponsorDetails.sponsorAddress,
      gasUsed: sponsorshipResult.gasUsed,
      gasCost: sponsorshipResult.gasCost,
    });

    return {
      success: true,
      utxoSelection,
      multicallData,
      txHash: sponsorshipResult.txHash,
      gasUsed: sponsorshipResult.gasUsed,
      gasCost: sponsorshipResult.gasCost,
      explorerUrl: sponsorshipResult.explorerUrl,
      sponsorDetails: sponsorshipResult.sponsorDetails,
      summary: {
        targetAmount,
        totalAmount: utxoSelection.totalAmount,
        utxoCount: utxoSelection.selectedUTXOs.length,
        recipient: recipientAddress,
        multicallCalls: multicallData.length,
        executed: true,
        txHash: sponsorshipResult.txHash,
        recipientBalance: `${recipientBalanceFormatted} USDC`,
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

// Execute UTXO-style redemption for target amount
const finalResult = await processUTXORedemptionWithSponsorship(0.0003); // Target 0.0003 USDC
console.log(finalResult);

console.log("finalResult", finalResult);
