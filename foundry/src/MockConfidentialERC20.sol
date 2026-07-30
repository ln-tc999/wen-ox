// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IConfidentialERC20.sol";

contract MockConfidentialERC20 is ERC20, IConfidentialERC20 {
    address private immutable _underlying;

    constructor(
        address underlying_,
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {
        _underlying = underlying_;
    }

    function wrap(address to, uint256 amount) external override {
        IERC20(_underlying).transferFrom(msg.sender, address(this), amount);
        _mint(to, amount);
    }

    function unwrap(address from, uint256 amount) external override {
        _burn(from, amount);
        IERC20(_underlying).transfer(msg.sender, amount);
    }

    function underlying() external view override returns (address) {
        return _underlying;
    }
}
