// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "./MockERC20.sol";
import "./MockConfidentialERC20.sol";
import "./NoxYieldVault.sol";

contract DeployWETHVault is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // 1. Deploy Mock WETH (18 decimals)
        MockERC20 weth = new MockERC20("Wrapped Ether", "WETH", 18);
        console.log("WETH deployed at:", address(weth));

        // 2. Deploy cWETH (confidential wrapper)
        MockConfidentialERC20 cWeth = new MockConfidentialERC20(
            address(weth),
            "Confidential WETH",
            "cWETH"
        );
        console.log("cWETH deployed at:", address(cWeth));

        // 3. Deploy cWETH Vault
        NoxYieldVault cWethVault = new NoxYieldVault(
            IERC20(address(cWeth)),
            "Nox cWETH Vault",
            "nvWETH"
        );
        console.log("cWETH Vault deployed at:", address(cWethVault));

        // 4. Mint some WETH to deployer for testing
        weth.mint(msg.sender, 10 ether);
        console.log("Minted 10 WETH to deployer");

        vm.stopBroadcast();
    }
}
