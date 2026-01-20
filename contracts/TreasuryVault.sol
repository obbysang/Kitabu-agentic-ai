// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TreasuryVault
 * @dev A simple vault that holds funds and allows whitelisted agents to withdraw/execute.
 * Note: This is a simplified version for the Kitabu backend integration demo.
 */

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TreasuryVault {
    address public owner;
    mapping(address => bool) public authorizedAgents;

    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);
    event WithdrawalERC20(address indexed token, address indexed recipient, uint256 amount);
    event AgentStatusChanged(address indexed agent, bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAgent() {
        require(authorizedAgents[msg.sender] || msg.sender == owner, "Not authorized agent");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function setAgent(address agent, bool status) external onlyOwner {
        authorizedAgents[agent] = status;
        emit AgentStatusChanged(agent, status);
    }

    function withdrawCRO(address payable recipient, uint256 amount) external onlyAgent {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
        emit Withdrawal(recipient, amount);
    }

    function withdrawERC20(address token, address recipient, uint256 amount) external onlyAgent {
        IERC20 erc20 = IERC20(token);
        require(erc20.balanceOf(address(this)) >= amount, "Insufficient ERC20 balance");
        bool success = erc20.transfer(recipient, amount);
        require(success, "ERC20 Transfer failed");
        emit WithdrawalERC20(token, recipient, amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
