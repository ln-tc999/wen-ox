// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IConfidentialERC20
 * @notice Interface for ERC-7984 confidential tokens (cUSDC, cRLC)
 * @dev Extends ERC20 with wrap/unwrap functionality for confidential tokens
 */
interface IConfidentialERC20 is IERC20 {
    /**
     * @notice Wrap underlying token to confidential token
     * @param to Recipient address
     * @param amount Amount of underlying token to wrap
     */
    function wrap(address to, uint256 amount) external;

    /**
     * @notice Unwrap confidential token to underlying token
     * @param from Address to unwrap from
     * @param amount Amount of confidential token to unwrap
     */
    function unwrap(address from, uint256 amount) external;

    /**
     * @notice Get underlying token address
     * @return Address of the underlying ERC20 token
     */
    function underlying() external view returns (address);
}
