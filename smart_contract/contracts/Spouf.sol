// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract Spouf is KeeperCompatibleInterface {

    using SafeMath for uint;

    uint globalBalance;
    mapping(address => uint) balances;

    event UpdateBalance(uint balance);
    event UpdateGlobalBalance(uint globalBalance);

    struct Goal {
        string goal;
        uint deadline;
        uint amount;
    }

    address[] usersCommitted;
    mapping(address => Goal[]) individualGoals;

    struct GoalOOD {
        address addr;
        uint index;
    }

    constructor() {
        console.log("Smart contract deployed.");
    }

    fallback() external payable {
        sendMoney();
    }

    receive() external payable {
        sendMoney();
    }

    function showGlobalBalance() external view returns (uint) {
        return globalBalance;
    }

    function sendMoney() public payable {
        require(
            msg.value >= 1 gwei,
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

    function setGoal(string memory _goal, uint _duration, uint _amount) external {        
        // require

        // check if the user already has goals in order to not distort usersCommitted value
        if (individualGoals[msg.sender].length == 0) {
            usersCommitted.push(msg.sender);
        }
        
        individualGoals[msg.sender].push(Goal(
            _goal,
            block.timestamp + _duration,
            _amount
        ));
    }

    function getGoal() external view returns (Goal[] memory) {
        //require
        return individualGoals[msg.sender];
    }

    function deleteGoal(uint _index) external {
        require(_index < individualGoals[msg.sender].length, "Index out of bound.");

        // extremely expensive lol, here we use a technique to shift all element after the _index to the left in order to squash the element wanted, and then we delete the last element (which is duplicated)
        for (uint i = _index; i < individualGoals[msg.sender].length - 1; i++) {
            individualGoals[msg.sender][i] = individualGoals[msg.sender][i + 1];
        }
        individualGoals[msg.sender].pop();

        // check if the user already has goals in order to not distort usersCommitted value
        if (individualGoals[msg.sender].length == 0) {
            // gas saving
            address[] memory m_usersCommitted = usersCommitted;
            
            // we loop over the array to pick the searched user
            for (uint j = 0; j < m_usersCommitted.length; j++) {
                if (m_usersCommitted[j] == msg.sender) {
                    // extremely expensive lol, same process as above, see : https://solidity-by-example.org/array/#examples-of-removing-array-element
                    for (uint k = j; k < m_usersCommitted.length - 1; k++) {
                        usersCommitted[k] = usersCommitted[k + 1];
                    }
                    usersCommitted.pop();
                }
            }
        }
    }

    // this function is used to check if a goal become out of date. We use ChainLink Keepers to execute that automatically.
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        // gas saving
        address[] memory m_usersCommitted = usersCommitted;

        upkeepNeeded = false;
        performData = bytes("");
        
        // we loop over all the users
        for (uint i = 0; i < m_usersCommitted.length; i++) {
            // we loop over every goals of every users
            for (uint j = 0; j < individualGoals[m_usersCommitted[i]].length; j++) {
                if (individualGoals[m_usersCommitted[i]][j].deadline < block.timestamp) {
                    upkeepNeeded = true;
                    performData = abi.encode(GoalOOD(m_usersCommitted[i], j));
                    // not necessary but gas efficient because you stop computation as soon as a first condition met
                    return (upkeepNeeded, performData);
                }
            }
        }
        return (upkeepNeeded, performData);
    }

    // this function is executed if a goal is out of date
    function performUpkeep(bytes calldata performData) external override {
        // gas saving
        address[] memory m_usersCommitted = usersCommitted;

        //* we revalidate the upkeep (as adviced in the doc)

        bool upkeepValidated = false;
        // we loop over all the users
        for (uint i = 0; i < m_usersCommitted.length; i++) {
            // we loop over every goals of every users
            for (uint j = 0; j < individualGoals[m_usersCommitted[i]].length; j++) {
                if (individualGoals[m_usersCommitted[i]][j].deadline < block.timestamp) {
                    upkeepValidated = true;
                }
            }
        }
        require(upkeepValidated, "There is a problem with Chainlink.");

        //*

        // OOD stands for "out-of-date"
        GoalOOD memory goalOOD = abi.decode(performData, (GoalOOD));
        
        // in the following parts, we have the possibility to reuse other function such as withdrawMoney() or deleteGoal(), why we don't do that is for the gas-efficiency, according to this response I got, it's better to copy paste code https://discord.com/channels/435685690936786944/447826495638077462/954099549142671381

        require(
            individualGoals[goalOOD.addr][goalOOD.index].amount <= address(this).balance,
            "Trying to withdraw more money than the contract has."
        );
        require(
            individualGoals[goalOOD.addr][goalOOD.index].amount <= balances[goalOOD.addr],
            "Trying to withdraw more money than the user has."
        );

        // as explicity said, the money lost goes 10% for the Spouf team, and 90% for charities. Here we donate to GiveDirectly, see : https://donate.givedirectly.org/
        // we can't use rational numbers like 0.1, so we dividide by 100 and then multiply by 10 to get 10%
        (bool successTeam, ) = (0xE4E6dC19efd564587C46dCa2ED787e45De17E7E1).call{value: individualGoals[goalOOD.addr][goalOOD.index].amount.div(100).mul(10)}("");
        (bool successCharities, ) = (0x750EF1D7a0b4Ab1c97B7A623D7917CcEb5ea779C).call{value: individualGoals[goalOOD.addr][goalOOD.index].amount.div(100).mul(90)}("");
        require(successTeam && successCharities, "Failed to withdraw money from contract.");

        // here we remove the amount lost from the balances array
        balances[goalOOD.addr] -= individualGoals[goalOOD.addr][goalOOD.index].amount;
        globalBalance -= individualGoals[goalOOD.addr][goalOOD.index].amount;

        // extremely expensive lol, here we use a technique to shift all element after the _index to the left in order to squash the element wanted, and then we delete the last element (which is duplicated)
        for (uint l = goalOOD.index; l < individualGoals[goalOOD.addr].length - 1; l++) {
            individualGoals[goalOOD.addr][l] = individualGoals[goalOOD.addr][l + 1];
        }
        individualGoals[goalOOD.addr].pop();

        // check if the user already has goals in order to not distort usersCommitted value
        if (individualGoals[goalOOD.addr].length == 0) {                
            // we loop over the array to pick the searched user
            for (uint m = 0; m < m_usersCommitted.length; m++) {
                if (m_usersCommitted[m] == goalOOD.addr) {
                    // extremely expensive lol, same process as above, see : https://solidity-by-example.org/array/#examples-of-removing-array-element
                    for (uint n = m; n < m_usersCommitted.length - 1; n++) {
                        usersCommitted[n] = usersCommitted[n + 1];
                    }
                    usersCommitted.pop();
                }
            }
        }

        // we update for the user
        emit UpdateBalance(balances[goalOOD.addr]);
        emit UpdateGlobalBalance(globalBalance);
    }

}
