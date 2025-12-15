// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RoyaltyVault
 * @notice Holds and distributes royalty funds for the Universal Matrix system
 */
contract RoyaltyVault is Ownable {
    address public universalMatrix;
    
    event RoyaltyReceived(uint256 amount);
    event RoyaltySent(address indexed to, uint256 amount);
    event UniversalMatrixUpdated(address indexed newAddress);

    constructor(address _owner) Ownable(_owner) {}

    /**
     * @notice Set the Universal Matrix contract address
     * @param _matrix Address of the Universal Matrix contract
     */
    function setUniversalMatrix(address _matrix) external onlyOwner {
        require(_matrix != address(0), "Invalid address");
        universalMatrix = _matrix;
        emit UniversalMatrixUpdated(_matrix);
    }

    /**
     * @notice Send royalty funds to a user
     * @param _amt Amount to send
     */
    function send(uint256 _amt) external payable {
        require(msg.sender == universalMatrix, "Only Universal Matrix");
        emit RoyaltySent(msg.sender, _amt);
    }

    /**
     * @notice Emergency withdrawal function
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @notice Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Receive BNB
     */
    receive() external payable {
        emit RoyaltyReceived(msg.value);
    }
}
