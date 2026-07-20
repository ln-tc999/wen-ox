// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "./NoxLendingPool.sol";
import "./MockAavePool.sol";

/**
 * @title DeployNoxLending
 * @notice Deployment script for NoxLendingPool on Arbitrum Sepolia
 */
contract DeployNoxLending is Script {
    // Arbitrum Sepolia addresses
    address constant NOX_COMPUTE = 0xd464B198f06756a1d00be223634b85E0a731c229;
    address constant C_USDC = 0x1CCeC6bC60dB15E4055D43Dc2531BB7D4E5B808e;
    address constant C_RLC = 0x92B23f4A59175415ced5CB37e64a1FC6A9D79af4;
    address constant USDC = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;
    address constant RLC = 0x9923eD3cbd90CD78b910c475f9A731A6e0b8C963;

    // TODO: Replace with actual Aave V3 on Arbitrum Sepolia (if exists)
    // For testing, deploy mock
    bool constant DEPLOY_MOCK = true;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        address aavePool;
        address aaveDataProvider;

        if (DEPLOY_MOCK) {
            console.log("Deploying Mock Aave Pool...");
            MockAavePool mockPool = new MockAavePool();
            MockAaveDataProvider mockDataProvider = new MockAaveDataProvider(address(mockPool));

            aavePool = address(mockPool);
            aaveDataProvider = address(mockDataProvider);

            console.log("Mock Aave Pool deployed at:", aavePool);
            console.log("Mock Aave Data Provider deployed at:", aaveDataProvider);
        } else {
            // Use real Aave V3 addresses (if available on Arbitrum Sepolia)
            // aavePool = 0x...; // Update with real address
            // aaveDataProvider = 0x...; // Update with real address
            revert("Real Aave addresses not configured");
        }

        console.log("==============================================");
        console.log("Deploying NoxLendingPool...");
        console.log("==============================================");

        // Deploy NoxLendingPool
        NoxLendingPool lendingPool = new NoxLendingPool(
            NOX_COMPUTE,
            aavePool,
            aaveDataProvider
        );

        console.log("NoxLendingPool deployed at:", address(lendingPool));
        console.log("==============================================");

        // Configure token mappings
        lendingPool.setUnderlyingToken(C_USDC, USDC);
        console.log("Mapped cUSDC to USDC");

        lendingPool.setUnderlyingToken(C_RLC, RLC);
        console.log("Mapped cRLC to RLC");

        console.log("==============================================");
        console.log("Deployment Summary:");
        console.log("==============================================");
        console.log("Nox Compute:", NOX_COMPUTE);
        console.log("Aave Pool:", aavePool);
        console.log("Aave Data Provider:", aaveDataProvider);
        console.log("Nox Lending Pool:", address(lendingPool));
        console.log("==============================================");

        vm.stopBroadcast();
    }
}
