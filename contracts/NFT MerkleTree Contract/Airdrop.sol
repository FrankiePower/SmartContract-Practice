// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract MerkleAirdrop is Ownable {

    bytes32 public merkleRoot;
    IERC20 public tokenAddress;
    address public constant BAYC_ADDRESS = 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D;

    
    constructor(IERC20 _tokenAddress, bytes32 _merkleRoot)Ownable(msg.sender) {
        tokenAddress = _tokenAddress;
        merkleRoot = _merkleRoot;
    }
    
    mapping(address => bool) public hasClaimed;
    event AirdropClaimed(address indexed claimedAccount, uint256 amount);


    function claim(uint256 _amount, bytes32[] calldata merkleProof) external {

        require(!hasClaimed[msg.sender], "Airdrop already claimed");

        require(IERC721(BAYC_ADDRESS).balanceOf(msg.sender) > 0, "Must own a BAYC NFT");

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, _amount))));

        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid proof");

        hasClaimed[msg.sender] = true; // Mark address as having claimed

        IERC20(tokenAddress).transfer(msg.sender, _amount);

        emit AirdropClaimed(msg.sender, _amount);

    }

    // This function is userd to update the merkleRoot of the contract, callable only by the owner
    function updateMerkleRoot(bytes32 newRoot) external {
        merkleRoot = newRoot;
    }

    // Function to withdraw remaining airdrop tokens. callable only by owner.
    function withdrawTokens(uint256 _amount) external  {
        // uint256 balance = IERC20(token).balanceOf(address(this));
        require(IERC20(tokenAddress).transfer(msg.sender, _amount), "Withdraw failed.");
    }

    function getContractBalance() external view onlyOwner returns(uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

}