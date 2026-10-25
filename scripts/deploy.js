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

  const HolderLens = await hre.ethers.getContractFactory("HolderLens");
  const holderLens = await HolderLens.deploy();
  await holderLens.waitForDeployment();

  const contractAddress = await holderLens.getAddress();
  console.log("====================================================");
  console.log("🎉 HolderLens successfully deployed to:", contractAddress);
  console.log("====================================================");

  // Update .env.local automatically if it exists
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
  };

  const artifactsDir = path.join(__dirname, "..", "src", "contract");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(artifactsDir, "deployedAddress.json"),
    JSON.stringify(deploymentMetadata, null, 2)
  );

  console.log("Deployment completed successfully.");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
