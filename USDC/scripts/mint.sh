#!/bin/bash

# USDC Minting Script for Base Appchain Testnet
# Usage: ./scripts/mint.sh [amount] [target_address]

set -e

# Contract addresses
PROXY_CONTRACT="0xD1DFf45486Ed0d172b40B54e0565276eE7936049"
MASTER_MINTER="0xAF9fC206261DF20a7f2Be9B379B101FAFd983117"
RPC_URL="https://horizen-rpc-testnet.appchain.base.org"

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found. Please create one with your private keys."
    exit 1
fi

# Check if private key is set
if [ -z "$INITIALIZER_PRIVATE_KEY" ]; then
    echo "Error: INITIALIZER_PRIVATE_KEY not set in .env file"
    exit 1
fi

# Function to convert USDC to wei (6 decimals)
usdc_to_wei() {
    local usdc_amount=$1
    echo $((usdc_amount * 1000000))
}

# Function to check balance
check_balance() {
    local address=$1
    echo "Checking balance for $address..."
    cast call $PROXY_CONTRACT "balanceOf(address)" $address --rpc-url $RPC_URL
}

# Function to check minter allowance
check_minter_allowance() {
    echo "Checking minter allowance..."
    cast call $PROXY_CONTRACT "minterAllowance(address)" $MASTER_MINTER --rpc-url $RPC_URL
}

# Function to mint tokens
mint_tokens() {
    local target_address=$1
    local amount_wei=$2
    
    echo "Minting $amount_wei wei to $target_address..."
    cast send $PROXY_CONTRACT "mint(address,uint256)" $target_address $amount_wei \
        --rpc-url $RPC_URL \
        --private-key $INITIALIZER_PRIVATE_KEY
}

# Main script logic
if [ $# -eq 0 ]; then
    echo "USDC Minting Script"
    echo "=================="
    echo ""
    echo "Usage:"
    echo "  $0 [amount_in_usdc] [target_address]"
    echo "  $0 check-balance [address]"
    echo "  $0 check-allowance"
    echo ""
    echo "Examples:"
    echo "  $0 100 $MASTER_MINTER"
    echo "  $0 50 0x1234567890123456789012345678901234567890"
    echo "  $0 check-balance $MASTER_MINTER"
    echo "  $0 check-allowance"
    exit 0
fi

case "$1" in
    "check-balance")
        if [ -z "$2" ]; then
            echo "Error: Please provide an address to check balance"
            exit 1
        fi
        check_balance $2
        ;;
    "check-allowance")
        check_minter_allowance
        ;;
    *)
        if [ $# -lt 2 ]; then
            echo "Error: Please provide both amount and target address"
            echo "Usage: $0 [amount_in_usdc] [target_address]"
            exit 1
        fi
        
        amount_usdc=$1
        target_address=$2
        
        # Convert USDC to wei
        amount_wei=$(usdc_to_wei $amount_usdc)
        
        echo "Minting $amount_usdc USDC ($amount_wei wei) to $target_address"
        echo "Press Enter to continue or Ctrl+C to cancel..."
        read
        
        mint_tokens $target_address $amount_wei
        
        echo ""
        echo "Minting completed! Checking new balance..."
        check_balance $target_address
        ;;
esac
