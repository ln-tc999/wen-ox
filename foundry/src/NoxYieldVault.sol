// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NoxYieldVault is ERC4626, Ownable {
    uint256 public yieldAccumulated;

    event YieldDeposited(address indexed by, uint256 amount);

    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) ERC4626(asset_) Ownable(msg.sender) {}

    function depositYield(uint256 amount) external onlyOwner {
        IERC20(asset()).transferFrom(msg.sender, address(this), amount);
        yieldAccumulated += amount;
        emit YieldDeposited(msg.sender, amount);
    }

    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }

    function estimatedAPY() external view returns (uint256) {
        if (totalSupply() == 0 || yieldAccumulated == 0) return 0;
        return (yieldAccumulated * 1e18 * 365 days) / (totalAssets() * 30 days);
    }
}
