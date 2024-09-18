import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTairdropModule = buildModule("NFTairdropModule", (m) => {
  // Define parameters with default values
  const tokenAddress = m.getParameter(
    "tokenAddress",
    "0x4c9b6c64664314d18c2cd05bf3fe31534c705c99"
  );
  const merkleRoot = m.getParameter(
    "merkleRoot",
    "0xd3070a25dc8ae155aef69939f43d6c47781a7e4f26000f9427267d135e0a8ce8"
  );

  // Deploy the contract with both arguments
  const NFTAirdrop = m.contract("MerkleAirdrop", [tokenAddress, merkleRoot]);

  return { NFTAirdrop };
});

export default NFTairdropModule;
