// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/INoxCompute.sol";

contract MockNoxCompute is INoxCompute {
    function decrypt(bytes32 encryptedValue) external pure override returns (uint256) {
        return uint256(encryptedValue);
    }

    function encrypt(uint256 value) external pure override returns (bytes32) {
        return bytes32(value);
    }

    function allowPublicDecryption(bytes32) external override {
        // No-op in mock
    }
}
