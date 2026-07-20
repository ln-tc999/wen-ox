// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ISwapRouter
 * @notice Unified interface for DEX routers (Uniswap V2, Curve, etc)
 */
interface ISwapRouter {
    /**
     * @notice Swap exact tokens for tokens
     * @param amountIn Amount of input token
     * @param amountOutMin Minimum amount of output token
     * @param path Array of token addresses for swap path
     * @param to Recipient address
     * @param deadline Transaction deadline
     * @return amounts Array of amounts for each step in path
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    /**
     * @notice Get amounts out for a swap
     * @param amountIn Amount of input token
     * @param path Array of token addresses for swap path
     * @return amounts Array of output amounts for each step
     */
    function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external view returns (uint256[] memory amounts);
}

/**
 * @title ICurvePool
 * @notice Interface for Curve stable swap pools
 */
interface ICurvePool {
    /**
     * @notice Exchange tokens in the pool
     * @param i Index of input token
     * @param j Index of output token
     * @param dx Amount of input token
     * @param min_dy Minimum amount of output token
     * @return Amount of output token received
     */
    function exchange(
        int128 i,
        int128 j,
        uint256 dx,
        uint256 min_dy
    ) external returns (uint256);

    /**
     * @notice Get exchange output amount
     * @param i Index of input token
     * @param j Index of output token
     * @param dx Amount of input token
     * @return Expected output amount
     */
    function get_dy(
        int128 i,
        int128 j,
        uint256 dx
    ) external view returns (uint256);

    /**
     * @notice Get token at index
     * @param index Token index in pool
     * @return Token address
     */
    function coins(uint256 index) external view returns (address);
}
