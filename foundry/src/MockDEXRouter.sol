// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ISwapRouter.sol";

/**
 * @title MockDEXRouter
 * @notice Mock DEX router for testing NoxSwapRouter on testnets
 * @dev Simulates Uniswap V2 router interface with 1:1 swap ratio for testing
 *
 * WARNING: For testing only! Uses simplified 1:1 swap rate.
 * In production, use real DEX (Uniswap, Curve, etc.)
 */
contract MockDEXRouter is ISwapRouter {
    using SafeERC20 for IERC20;

    /// @notice Simulated swap rate (1e18 = 1:1)
    uint256 public constant SWAP_RATE = 1e18;

    /// @notice Simulated slippage (1% = 10000 = 0.01 * 1e6)
    uint256 public constant SLIPPAGE_BPS = 100; // 1%
    uint256 public constant BPS_DENOMINATOR = 10000;

    event MockSwap(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address indexed to
    );

    /**
     * @notice Mock swap: transfers tokens 1:1 with simulated slippage
     * @param amountIn Amount of input token
     * @param amountOutMin Minimum output amount
     * @param path Swap path [tokenIn, tokenOut]
     * @param to Recipient
     * @param deadline Deadline (unused in mock)
     * @return amounts Array of amounts [amountIn, amountOut]
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override returns (uint256[] memory amounts) {
        require(path.length >= 2, "Invalid path");
        require(block.timestamp <= deadline, "Expired");

        address tokenIn = path[0];
        address tokenOut = path[path.length - 1];

        // Calculate output with simulated slippage
        uint256 amountOut = (amountIn * (BPS_DENOMINATOR - SLIPPAGE_BPS)) / BPS_DENOMINATOR;
        require(amountOut >= amountOutMin, "Insufficient output");

        // Transfer tokens
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).safeTransfer(to, amountOut);

        // Build amounts array
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        amounts[path.length - 1] = amountOut;

        emit MockSwap(tokenIn, tokenOut, amountIn, amountOut, to);
    }

    /**
     * @notice Get quote for swap (with simulated slippage)
     * @param amountIn Input amount
     * @param path Swap path
     * @return amounts Array of output amounts
     */
    function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external pure override returns (uint256[] memory amounts) {
        require(path.length >= 2, "Invalid path");

        amounts = new uint256[](path.length);
        amounts[0] = amountIn;

        // Apply simulated slippage
        uint256 amountOut = (amountIn * (BPS_DENOMINATOR - SLIPPAGE_BPS)) / BPS_DENOMINATOR;
        amounts[path.length - 1] = amountOut;
    }

    /**
     * @notice Fund router with tokens for testing
     * @param token Token address
     * @param amount Amount to fund
     */
    function fundRouter(address token, uint256 amount) external {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }
}
