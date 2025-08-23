/**
 * @fileoverview Middleware helper functions
 */

import { paymentMiddleware } from "x402-express";

/**
 * Gets Safe address for payment middleware
 * @returns {string} Safe address
 * @throws {Error} If failed to get address
 */
export async function getSafeAddress() {
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

/**
 * Creates dynamic payment middleware that gets fresh address on each request
 * @param {string} facilitatorUrl - Facilitator URL
 * @returns {Function} Express middleware function
 */
export function createDynamicPaymentMiddleware(facilitatorUrl) {
  return async (req, res, next) => {
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
}
