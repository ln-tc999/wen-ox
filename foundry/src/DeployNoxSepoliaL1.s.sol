// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "./MockERC20.sol";
import "./MockConfidentialERC20.sol";
import "./MockNoxCompute.sol";
import "./MockDEXRouter.sol";
import "./NoxSwapRouter.sol";
import "./NoxYieldVault.sol";

contract DeployNoxSepoliaL1 is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // 1. Deploy mock underlying tokens
        MockERC20 usdc = new MockERC20("Mock USD Coin", "USDC", 6);
        console.log("Mock USDC deployed at:", address(usdc));

        MockERC20 rlc = new MockERC20("Mock iExec RLC", "RLC", 9);
        console.log("Mock RLC deployed at:", address(rlc));

        // 2. Deploy mock confidential wrapper tokens
        MockConfidentialERC20 cUsdc = new MockConfidentialERC20(
            address(usdc),
            "Confidential USDC",
            "cUSDC"
        );
        console.log("cUSDC Wrapper deployed at:", address(cUsdc));

        MockConfidentialERC20 cRlc = new MockConfidentialERC20(
            address(rlc),
            "Confidential RLC",
            "cRLC"
        );
        console.log("cRLC Wrapper deployed at:", address(cRlc));

        // 3. Deploy mock Nox precompile and DEX
        MockNoxCompute noxCompute = new MockNoxCompute();
        console.log("Mock NoxCompute deployed at:", address(noxCompute));

        MockDEXRouter dexRouter = new MockDEXRouter();
        console.log("Mock DEXRouter deployed at:", address(dexRouter));

        // 4. Deploy Nox DeFi swap router
        NoxSwapRouter swapRouter = new NoxSwapRouter(
            address(noxCompute),
            address(dexRouter)
        );
        console.log("NoxSwapRouter deployed at:", address(swapRouter));

        // Setup swap router mappings
        swapRouter.setUnderlyingToken(address(cUsdc), address(usdc));
        swapRouter.setUnderlyingToken(address(cRlc), address(rlc));
        console.log("Swap router token mappings configured.");

        // Fund DEX router mock with some tokens for swapping
        usdc.mint(address(dexRouter), 1000000 * 10**6);
        rlc.mint(address(dexRouter), 100000 * 10**9);
        console.log("Mock DEX router funded with liquidity.");

        // 5. Deploy vaults
        NoxYieldVault cUsdcVault = new NoxYieldVault(
            IERC20(address(cUsdc)),
            "Nox cUSDC Vault",
            "nvUSDC"
        );
        console.log("cUSDC Yield Vault deployed at:", address(cUsdcVault));

        NoxYieldVault cRlcVault = new NoxYieldVault(
            IERC20(address(cRlc)),
            "Nox cRLC Vault",
            "nvRLC"
        );
        console.log("cRLC Yield Vault deployed at:", address(cRlcVault));

        vm.stopBroadcast();
    }
}
