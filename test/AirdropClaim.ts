import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import {
  setBalance,
  impersonateAccount,
} from "@nomicfoundation/hardhat-network-helpers";

describe("MerkleNFTAirdrop", function () {
  async function deployFixture() {
    const BAYCContractAddress = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
    const BAYC_NFT_HOLDER = "0x8481be8cf9d472ee513aaa850702ee37fe27c063";

    // Deploy SuperFranky token
    const SuperFranky = await ethers.getContractFactory("SuperFranky");
    const token = await SuperFranky.deploy();

    // Impersonate BAYC holder
    await impersonateAccount(BAYC_NFT_HOLDER);
    await setBalance(BAYC_NFT_HOLDER, ethers.parseEther("10000"));
    const impersonatedSigner = await ethers.getSigner(BAYC_NFT_HOLDER);

    // Get BAYC contract
    const NFT_Contract = await ethers.getContractAt(
      "IERC721",
      BAYCContractAddress
    );

    const [owner] = await ethers.getSigners();
    const addr1 = impersonatedSigner;
    const addr2 = await ethers.getSigner(
      "0x9a3a60f5aee7aef1fb0d4da8534452a2e2a89d46"
    );

    // Use the provided Merkle root
    const merkleRoot =
      "0xd3070a25dc8ae155aef69939f43d6c47781a7e4f26000f9427267d135e0a8ce8";

    // Deploy MerkleAirdrop contract
    const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
    const merkleAirdropContract = await MerkleAirdrop.deploy(
      await token.getAddress(),
      merkleRoot
    );

    const decimals = await token.decimals();

    const initialBalance = ethers.parseUnits("100000", decimals);

    return {
      token,
      merkleAirdropContract,
      merkleRoot,
      NFT_Contract,
      owner,
      addr1,
      addr2,
      decimals,
      initialBalance,
    };
  }

  describe("Deployment", function () {
    it("Should check if owner is correct", async function () {
      const { merkleAirdropContract, owner } = await loadFixture(deployFixture);

      expect(await merkleAirdropContract.owner()).to.equal(owner);
    });

    it("Should check if tokenAddress is correctly set", async function () {
      const { merkleAirdropContract, token } = await loadFixture(deployFixture);

      expect(await merkleAirdropContract.tokenAddress()).to.equal(token);
    });
    it("Should set the correct initial balance", async function () {
      const { owner, initialBalance } = await loadFixture(deployFixture);

      const contractBalance = await token.balanceOf(await owner.getAddress());
      expect(contractBalance).to.equal(initialBalance);
    });
  });

  describe("Claiming", function () {
    it("Should allow eligible users with BAYC to claim tokens", async function () {
      const { merkleAirdropContract, addr1, token } = await loadFixture(
        deployFixture
      );

      // You'll need to provide the correct proof for addr1
      const proof = [
        "0x3c5cfcff5fac8345ee13acb651500f3c1763dc86df5b6395f2da751f647e915b",
        "0xdcd6e91bd2a676a13d1a9559252ad02e543546781d520e3448dcf8ef3e95eb7f",
        "0x3a5a259574916793ff4139c5ecc779d0c6230f85529137dde643d0b2676a3f1e",
        "0xdc576899524f5267e18322b4bbae326ded48ff017a49cf06115c1624cdbceb06",
      ];

      await expect(
        merkleAirdropContract
          .connect(addr1)
          .claim(ethers.parseEther("31"), proof)
      )
        .to.emit(merkleAirdropContract, "Claimed")
        .withArgs(addr1.address, ethers.parseEther("100"));

      expect(await token.balanceOf(addr1.address)).to.equal(
        ethers.parseEther("31")
      );
    });

    it("Should not allow users without BAYC to claim tokens", async function () {
      const { merkleAirdropContract, NoNFTAddress } = await loadFixture(
        deployFixture
      );

      // You'll need to provide a proof for NoNFTAddress (even though it won't pass the BAYC check)
      const proof = [
        "0xabcd...", // Replace with actual proof values
        "0xefgh...",
        // ... more proof elements
      ];

      await expect(
        merkleAirdropContract
          .connect(NoNFTAddress)
          .claim(ethers.parseEther("100"), proof)
      ).to.be.revertedWith("Must own a BAYC NFT");
    });

    // Add more tests here...
  });
});
