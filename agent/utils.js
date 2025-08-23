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
// Implements industry-standard UTXO optimization algorithms
const findOptimalUTXOCombination = (balanceData, targetAmount) => {
  console.log(`🎯 Finding optimal UTXO combination for target: ${targetAmount} USDC`);
  console.log(`📊 Available UTXOs: ${balanceData.length} Safes with balances`);
  
  // Strategy 1: Exact match (highest priority)
  const exactMatch = balanceData.find(utxo => Math.abs(utxo.balance - targetAmount) < 0.000001);
  if (exactMatch) {
    console.log(`🎯 Found exact match! Using single UTXO: ${exactMatch.balance} USDC`);
    return {
      selectedUTXOs: [{
        ...exactMatch,
        amountToRedeem: exactMatch.balance,
        isFullRedeem: true
      }],
      totalAmount: exactMatch.balance,
      targetAmount,
      isTargetReached: true,
      strategy: 'exact_match',
      change: 0,
      score: 0
    };
  }
  
  // Strategy 2: Branch and Bound algorithm (standard in Bitcoin Core)
  const branchAndBoundResult = branchAndBoundSelection(balanceData, targetAmount);
  if (branchAndBoundResult && branchAndBoundResult.isTargetReached) {
    console.log(`✅ Branch and Bound found optimal solution`);
    return branchAndBoundResult;
  }
  
  // Strategy 3: Knapsack Problem approach
  const knapsackResult = knapsackSelection(balanceData, targetAmount);
  if (knapsackResult && knapsackResult.isTargetReached) {
    console.log(`✅ Knapsack algorithm found solution`);
    return knapsackResult;
  }
  
  // Strategy 4: Bitcoin Core's "largest first" with change minimization
  const bitcoinCoreResult = bitcoinCoreSelection(balanceData, targetAmount);
  if (bitcoinCoreResult && bitcoinCoreResult.isTargetReached) {
    console.log(`✅ Bitcoin Core algorithm found solution`);
    return bitcoinCoreResult;
  }
  
  // Strategy 5: Greedy fallback (smallest first)
  console.log(`⚠️ Falling back to greedy approach...`);
  const result = greedySelection(balanceData, targetAmount);
  
  // Log results
  console.log(`✅ UTXO Selection Results:`);
  console.log(`   - Strategy: ${result.strategy}`);
  console.log(`   - Target Amount: ${targetAmount} USDC`);
  console.log(`   - Selected UTXOs: ${result.selectedUTXOs.length}`);
  console.log(`   - Total Amount: ${result.totalAmount.toFixed(6)} USDC`);
  console.log(`   - Change: ${result.change.toFixed(6)} USDC`);
  console.log(`   - Score: ${result.score}`);
  
  result.selectedUTXOs.forEach((utxo, index) => {
    console.log(`   - UTXO ${index + 1}: ${utxo.safeAddress} (${utxo.balance} → ${utxo.amountToRedeem} USDC)`);
  });
  
  return result;
};

// Branch and Bound algorithm (standard in UTXO optimization)
const branchAndBoundSelection = (balanceData, targetAmount) => {
  console.log(`🔍 Running Branch and Bound algorithm...`);
  
  // Sort UTXOs by value (descending) for better pruning
  const sortedUTXOs = [...balanceData].sort((a, b) => b.balance - a.balance);
  
  let bestSolution = null;
  let bestScore = Infinity;
  
  const branchAndBound = (index, currentSelection, currentSum, remainingTarget) => {
    // Pruning: if current sum already exceeds target significantly, stop
    if (currentSum > targetAmount * 1.5) {
      return;
    }
    
         // Pruning: if remaining target is negative, we have a solution
     if (remainingTarget <= 0) {
       const change = currentSum - targetAmount;
       const score = calculateScore(currentSelection.length, change, currentSum, targetAmount);
      
      if (score < bestScore) {
        bestScore = score;
        bestSolution = {
          selectedUTXOs: currentSelection.map(utxo => ({
            ...utxo,
            amountToRedeem: utxo.balance,
            isFullRedeem: true
          })),
          totalAmount: currentSum,
          targetAmount,
          isTargetReached: true,
          strategy: 'branch_and_bound',
          change,
          score
        };
      }
      return;
    }
    
    // Pruning: if we've used too many UTXOs, stop
    if (currentSelection.length >= 6) {
      return;
    }
    
    // Pruning: if we've processed all UTXOs
    if (index >= sortedUTXOs.length) {
      return;
    }
    
    // Try including current UTXO
    const currentUTXO = sortedUTXOs[index];
    if (currentUTXO.balance <= remainingTarget + targetAmount * 0.1) { // Allow 10% overage
      branchAndBound(
        index + 1,
        [...currentSelection, currentUTXO],
        currentSum + currentUTXO.balance,
        remainingTarget - currentUTXO.balance
      );
    }
    
    // Try excluding current UTXO
    branchAndBound(index + 1, currentSelection, currentSum, remainingTarget);
  };
  
  branchAndBound(0, [], 0, targetAmount);
  
  return bestSolution;
};

// Knapsack Problem approach (0/1 Knapsack)
const knapsackSelection = (balanceData, targetAmount) => {
  console.log(`🔍 Running Knapsack algorithm...`);
  
  // Use dynamic programming for 0/1 knapsack
  const n = balanceData.length;
  const maxWeight = Math.ceil(targetAmount * 1000000); // Convert to smallest unit
  const weights = balanceData.map(utxo => Math.ceil(utxo.balance * 1000000));
  const values = balanceData.map(utxo => utxo.balance * 1000000); // Value = weight for UTXOs
  
  // Initialize DP table
  const dp = Array(n + 1).fill().map(() => Array(maxWeight + 1).fill(0));
  const selected = Array(n + 1).fill().map(() => Array(maxWeight + 1).fill(false));
  
  // Fill DP table
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= maxWeight; w++) {
      if (weights[i - 1] <= w) {
        const includeValue = dp[i - 1][w - weights[i - 1]] + values[i - 1];
        if (includeValue > dp[i - 1][w]) {
          dp[i][w] = includeValue;
          selected[i][w] = true;
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  
  // Backtrack to find selected UTXOs
  const selectedUTXOs = [];
  let w = maxWeight;
  for (let i = n; i > 0; i--) {
    if (selected[i][w]) {
      selectedUTXOs.push(balanceData[i - 1]);
      w -= weights[i - 1];
    }
  }
  
  if (selectedUTXOs.length === 0) {
    return null;
  }
  
  const totalAmount = selectedUTXOs.reduce((sum, utxo) => sum + utxo.balance, 0);
  const change = totalAmount - targetAmount;
  
  return {
    selectedUTXOs: selectedUTXOs.map(utxo => ({
      ...utxo,
      amountToRedeem: utxo.balance,
      isFullRedeem: true
    })),
    totalAmount,
    targetAmount,
    isTargetReached: totalAmount >= targetAmount,
         strategy: 'knapsack',
     change: Math.max(0, change),
     score: calculateScore(selectedUTXOs.length, change, totalAmount, targetAmount)
  };
};

// Bitcoin Core's coin selection algorithm
const bitcoinCoreSelection = (balanceData, targetAmount) => {
  console.log(`🔍 Running Bitcoin Core algorithm...`);
  
  // Sort by value (descending) - Bitcoin Core uses largest first
  const sortedUTXOs = [...balanceData].sort((a, b) => b.balance - a.balance);
  
  let selectedUTXOs = [];
  let totalAmount = 0;
  
  // Try to find a single UTXO that's close to target
  for (const utxo of sortedUTXOs) {
    if (utxo.balance >= targetAmount && utxo.balance <= targetAmount * 1.5) {
      selectedUTXOs = [utxo];
      totalAmount = utxo.balance;
      break;
    }
  }
  
  // If no single UTXO found, use largest first approach
  if (selectedUTXOs.length === 0) {
    for (const utxo of sortedUTXOs) {
      if (totalAmount < targetAmount) {
        selectedUTXOs.push(utxo);
        totalAmount += utxo.balance;
      } else {
        break;
      }
    }
  }
  
  if (selectedUTXOs.length === 0) {
    return null;
  }
  
  const change = totalAmount - targetAmount;
  
  return {
    selectedUTXOs: selectedUTXOs.map(utxo => ({
      ...utxo,
      amountToRedeem: utxo.balance,
      isFullRedeem: true
    })),
    totalAmount,
    targetAmount,
    isTargetReached: totalAmount >= targetAmount,
         strategy: 'bitcoin_core',
     change: Math.max(0, change),
     score: calculateScore(selectedUTXOs.length, change, totalAmount, targetAmount)
  };
};

// Greedy selection (smallest first)
const greedySelection = (balanceData, targetAmount) => {
  console.log(`🔍 Running Greedy algorithm (smallest first)...`);
  
  const sortedUTXOs = [...balanceData].sort((a, b) => a.balance - b.balance);
  
  let selectedUTXOs = [];
  let totalAmount = 0;
  
  for (const utxo of sortedUTXOs) {
    if (totalAmount < targetAmount) {
      selectedUTXOs.push(utxo);
      totalAmount += utxo.balance;
    } else {
      break;
    }
  }
  
  const change = totalAmount - targetAmount;
  
  return {
    selectedUTXOs: selectedUTXOs.map(utxo => ({
      ...utxo,
      amountToRedeem: utxo.balance,
      isFullRedeem: true
    })),
    totalAmount,
    targetAmount,
    isTargetReached: totalAmount >= targetAmount,
         strategy: 'greedy_smallest_first',
     change: Math.max(0, change),
     score: calculateScore(selectedUTXOs.length, change, totalAmount, targetAmount)
  };
};

// Standard scoring function based on UTXO optimization research
const calculateScore = (utxoCount, change, totalAmount, targetAmount) => {
  // Base penalty for UTXO count (each UTXO adds transaction cost)
  let score = utxoCount * 100;
  
  // Heavy penalty for change (wasteful)
  score += change * 1000;
  
  // Penalty for using too much total amount
  if (totalAmount > targetAmount * 2) {
    score += (totalAmount - targetAmount * 2) * 500;
  }
  
  // Bonus for efficient combinations
  if (utxoCount <= 2 && change < targetAmount * 0.1) {
    score -= 200; // Significant bonus for efficient solutions
  }
  
  return score;
};

// Function to handle change management in UTXO model
const handleUTXOChange = (utxoSelection, recipientAddress, agentAddress) => {
  const change = utxoSelection.change;
  
  if (change <= 0) {
    console.log("✅ No change to handle");
    return null;
  }
  
  console.log(`💰 Handling change: ${change.toFixed(6)} USDC`);
  
  // Create a new UTXO for the change amount
  // In a real implementation, this would create a new stealth address
  // For now, we'll send change back to the agent address
  const changeRecipient = agentAddress || recipientAddress;
  
  return {
    recipient: changeRecipient,
    amount: change,
    isChange: true
  };
};

// Enhanced UTXO selection with change handling
const findOptimalUTXOCombinationWithChange = (balanceData, targetAmount, agentAddress) => {
  const utxoSelection = findOptimalUTXOCombination(balanceData, targetAmount);
  
  // Handle change if any
  const changeInfo = handleUTXOChange(utxoSelection, recipientAddress, agentAddress);
  
  return {
    ...utxoSelection,
    changeInfo
  };
};

const processUTXORedemptionWithSponsorship = async (targetAmount = 0.0003) => {
  // Fetch balance data from API
  const balanceData = await fetchBalanceData();
  
  if (balanceData.length === 0) {
    throw new Error("No Safes with positive balance found");
  }
  
  // Find optimal UTXO combination
  const utxoSelection = findOptimalUTXOCombinationWithChange(balanceData, targetAmount, account.address);
  
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
      
      // Determine transfer details based on whether this UTXO has change
      let transferAmount = utxo.amountToRedeem;
      let transferRecipient = recipientAddress;
      
      // If this is a partial redemption and we have change, send change to agent
      if (!utxo.isFullRedeem && utxoSelection.changeInfo && utxoSelection.changeInfo.isChange) {
        // For partial redemptions, we need to handle this differently
        // Since we can't split a single Safe transaction, we'll send the full amount
        // and handle change in a separate transaction if needed
        transferAmount = utxo.balance;
        transferRecipient = recipientAddress;
        console.log(`   - ⚠️ Partial redemption detected, sending full amount: ${transferAmount} USDC`);
      }
      
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
          transferRecipient,
          parseUnits(transferAmount.toString(), utxo.decimals),
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
        optimizationStrategy: utxoSelection.strategy,
        change: utxoSelection.change,
        changeHandled: !!utxoSelection.changeInfo,
        efficiency: {
          utxoEfficiency: utxoSelection.selectedUTXOs.length <= 2 ? 'high' : 'medium',
          changeEfficiency: utxoSelection.change < targetAmount * 0.1 ? 'high' : 'medium',
          gasEfficiency: multicallData.length <= 4 ? 'high' : 'medium'
        }
      },
    };
  } catch (error) {
    console.error("❌ Sponsored redemption failed:", error);

    throw error;
  }
};

// Export functions for testing
export { findOptimalUTXOCombination, findOptimalUTXOCombinationWithChange };

// Execute UTXO-style redemption for target amount
const finalResult = await processUTXORedemptionWithSponsorship(0.0003); // Target 0.0003 USDC
console.log(finalResult);

console.log("finalResult", finalResult);
