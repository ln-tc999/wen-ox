// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "./NoxSwapRouter.sol";

/**
 * @title DeployNoxSwapRouter
 * @notice Deployment script for NoxSwapRouter on Arbitrum Sepolia
 */
contract DeployNoxSwapRouter is Script {
    // Arbitrum Sepolia addresses
    address constant NOX_COMPUTE = 0xd464B198f06756a1d00be223634b85E0a731c229;
    address constant C_USDC = 0x1CCeC6bC60dB15E4055D43Dc2531BB7D4E5B808e;
    address constant C_RLC = 0x92B23f4A59175415ced5CB37e64a1FC6A9D79af4;
    address constant USDC = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;
    address constant RLC = 0x9923eD3cbd90CD78b910c475f9A731A6e0b8C963;

    // TODO: Replace with actual Uniswap V2 router on Arbitrum Sepolia
    // For testing, we'll need to deploy a mock router or use existing DEX
    address constant DEX_ROUTER = address(0); // MUST UPDATE!

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // Deploy NoxSwapRouter
        NoxSwapRouter swapRouter = new NoxSwapRouter(
            NOX_COMPUTE,
            DEX_ROUTER // TODO: Update with actual DEX router
        );

        console.log("==============================================");
        console.log("NoxSwapRouter deployed at:", address(swapRouter));
        console.log("==============================================");

        // Configure token mappings
        swapRouter.setUnderlyingToken(C_USDC, USDC);
        console.log("Mapped cUSDC to USDC");

        swapRouter.setUnderlyingToken(C_RLC, RLC);
        console.log("Mapped cRLC to RLC");

        console.log("==============================================");
        console.log("Configuration complete!");
        console.log("==============================================");

        vm.stopBroadcast();
    }
}
