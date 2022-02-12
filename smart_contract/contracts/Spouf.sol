// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Spouf {

    mapping(address => uint) balances;

    constructor() {
        console.log("Smart contract deployed.");
    }

    function sendMoney() external payable {
        require(
            msg.value > 0 wei,
            "The user sent an incorrect amount of money."
        );
        balances[msg.sender] += msg.value;
    }

    function withdrawMoney(uint _amount) external  {
        require(
            _amount <= address(this).balance,
            "Trying to withdraw more money than the contract has."
        );
        require(
            _amount <= balances[msg.sender],
            "Trying to withdraw more money than the user has."
        );
        (bool success, ) = (msg.sender).call{value: _amount}("");
        require(success, "Failed to withdraw money from contract.");

        balances[msg.sender] -= _amount;
    }

    function showBalance() external view returns (uint) {
        return balances[msg.sender];
    }

}
