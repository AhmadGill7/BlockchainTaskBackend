const { ethers } = require("ethers");

class Web3Helper {
  constructor() {
    this.provider = null;
    this.initProvider();
  }

  initProvider() {
    try {
      // Use Infura, Alchemy, or another provider
      const rpcUrl =
        process.env.ETH_RPC_URL ||
        "https://mainnet.infura.io/v3/YOUR_PROJECT_ID";
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    } catch (error) {
      console.error("Failed to initialize Web3 provider:", error);
    }
  }

  // Validate Ethereum address
  isValidAddress(address) {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  // Validate transaction hash
  isValidTxHash(hash) {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }

  // Get transaction details
  // async getTransaction(txHash) {
  //   try {
  //     if (!this.provider) {
  //       throw new Error("Web3 provider not initialized");
  //     }

  //     const tx = await this.provider.getTransaction(txHash);
  //     return tx;
  //   } catch (error) {
  //     console.error("Error getting transaction:", error);
  //     throw error;
  //   }
  // }

  // // Get transaction receipt
  // async getTransactionReceipt(txHash) {
  //   try {
  //     if (!this.provider) {
  //       throw new Error("Web3 provider not initialized");
  //     }

  //     const receipt = await this.provider.getTransactionReceipt(txHash);
  //     return receipt;
  //   } catch (error) {
  //     console.error("Error getting transaction receipt:", error);
  //     throw error;
  //   }
  // }

  // Convert ETH to Wei
  parseEther(value) {
    return ethers.parseEther(value.toString());
  }

  // Convert Wei to ETH
  formatEther(value) {
    return ethers.formatEther(value);
  }

  // Convert ETH to USD
  async convertETHToUSD(ethAmount) {
    const ethPrice = await this.getEthPriceInUSD();
    return ethAmount * ethPrice;
  }
}

module.exports = new Web3Helper();
