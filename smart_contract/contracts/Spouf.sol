// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Spouf {

    uint globalBalance;
    mapping(address => uint) balances;

    event UpdateBalance(uint balance);
    event UpdateGlobalBalance(uint globalBalance);

    constructor() {
        console.log("Smart contract deployed.");
    }

    function showGlobalBalance() external view returns (uint) {
        return globalBalance;
    }

    function sendMoney() external payable {
        require(
            msg.value > 0 wei,
            "The user sent an incorrect amount of money."
        );
        balances[msg.sender] += msg.value;
        globalBalance += msg.value;

        emit UpdateBalance(balances[msg.sender]);
        emit UpdateGlobalBalance(globalBalance);
    }

    function withdrawMoney(uint _amount) external {
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
        globalBalance -= _amount;

        emit UpdateBalance(balances[msg.sender]);
        emit UpdateGlobalBalance(globalBalance);
    }

    function showBalance() external view returns (uint) {
        return balances[msg.sender];
    }

}
