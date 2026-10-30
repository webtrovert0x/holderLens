const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying HolderLens on network:", hre.network.name);
  console.log("----------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account found! Please make sure PRIVATE_KEY is set in .env.local"
    );
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer Address:", deployer.address);
  console.log("Deployer Balance:", hre.ethers.formatEther(balance), "BOT");

  // Get current network gas price for optimal small gas fee
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || 20000000000n;
  console.log(
    `Network Gas Price: ${gasPrice.toString()} wei (${hre.ethers.formatUnits(
      gasPrice,
      "gwei"
    )} Gwei)`
  );

  const HolderLens = await hre.ethers.getContractFactory("HolderLens");
  console.log("Broadcasting deployment transaction with minimal gas fee...");
  const holderLens = await HolderLens.deploy({
    gasPrice: gasPrice,
  });

  const deploymentTx = holderLens.deploymentTransaction();
  console.log("Transaction Hash:", deploymentTx.hash);
  console.log("Waiting for block confirmations on BOT Chain...");

  // Wait for 3 confirmations to ensure the block is indexed on Blockscout
  await deploymentTx.wait(3);

  const contractAddress = await holderLens.getAddress();
  console.log("====================================================");
  console.log("🎉 HolderLens successfully deployed to:", contractAddress);
  console.log("====================================================");

  // Update .env.local automatically
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log("✅ Updated NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local");
  }

  // Also export ABI and address to a frontend helper json
  const deploymentMetadata = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
    txHash: deploymentTx.hash,
    explorerUrl: `https://scan.botchain.ai/address/${contractAddress}`,
  };

  const artifactsDir = path.join(__dirname, "..", "src", "contract");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(artifactsDir, "deployedAddress.json"),
    JSON.stringify(deploymentMetadata, null, 2)
  );
  console.log("✅ Exported deployment metadata to deployedAddress.json");

  // Attempt automated verification on BOT Chain Blockscout explorer
  console.log("\nAttempting contract source verification on scan.botchain.ai...");
  // Sleep 5 seconds to let blockscout index the contract
  await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("🎉 Contract verification succeeded!");
  } catch (verifyError) {
    console.warn("⚠️ Automated verification notice:", verifyError.message || verifyError);
    console.log(
      `You can also verify manually using: npm run verify -- ${contractAddress}`
    );
  }

  console.log("\nDeployment completed successfully.");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
