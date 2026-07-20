// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "./NoxYieldVault.sol";

contract DeployNoxVaults is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        address cUSDC = 0x1CCeC6bC60dB15E4055D43Dc2531BB7D4E5B808e;
        address cRLC = 0x92B23f4A59175415ced5CB37e64a1FC6A9D79af4;

        NoxYieldVault cUsdcVault = new NoxYieldVault(
            IERC20(cUSDC),
            "Nox cUSDC Vault",
            "nvUSDC"
        );
        console.log("cUSDC Vault deployed at:", address(cUsdcVault));

        NoxYieldVault cRlcVault = new NoxYieldVault(
            IERC20(cRLC),
            "Nox cRLC Vault",
            "nvRLC"
        );
        console.log("cRLC Vault deployed at:", address(cRlcVault));

        vm.stopBroadcast();
    }
}
