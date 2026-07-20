// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/INoxCompute.sol";
import "./interfaces/IConfidentialERC20.sol";
import "./interfaces/ISwapRouter.sol";

/**
 * @title NoxSwapRouter
 * @notice Privacy-preserving DEX router using iExec Nox Protocol
 * @dev Wraps existing DEXes (Uniswap, Curve) with confidential token support
 *
 * Flow:
 * 1. User submits encrypted swap amount (via Nox Handle SDK)
 * 2. Contract decrypts amount in TEE
 * 3. Unwrap confidential token → plain token
 * 4. Execute swap on underlying DEX (unchanged protocol!)
 * 5. Wrap output → confidential token
 * 6. Return encrypted output to user
 *
 * Privacy: Only user can decrypt their swap amounts. Public sees encrypted handles only.
 */
contract NoxSwapRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Nox TEE precompile for encryption/decryption
    INoxCompute public immutable noxCompute;

    /// @notice Supported DEX router (Uniswap V2 compatible)
    ISwapRouter public dexRouter;

    /// @notice Mapping of confidential token → underlying token
    mapping(address => address) public underlyingTokens;

    /// @notice Swap execution events
    event ConfidentialSwap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        bytes32 encryptedAmountIn,
        bytes32 encryptedAmountOut,
        uint256 timestamp
    );

    event DEXRouterUpdated(address indexed oldRouter, address indexed newRouter);
    event UnderlyingTokenMapped(address indexed confidentialToken, address indexed underlyingToken);

    error ZeroAddress();
    error InvalidToken();
    error InsufficientOutput();
    error SwapFailed();

    /**
     * @param _noxCompute Address of Nox TEE precompile
     * @param _dexRouter Address of DEX router (Uniswap V2 compatible)
     */
    constructor(
        address _noxCompute,
        address _dexRouter
    ) Ownable(msg.sender) {
        if (_noxCompute == address(0) || _dexRouter == address(0)) revert ZeroAddress();

        noxCompute = INoxCompute(_noxCompute);
        dexRouter = ISwapRouter(_dexRouter);
    }

    /**
     * @notice Execute confidential swap
     * @param encryptedAmountIn Encrypted input amount (from Nox Handle SDK)
     * @param tokenIn Confidential input token (e.g., cUSDC)
     * @param tokenOut Confidential output token (e.g., cRLC)
     * @param minAmountOut Minimum output amount (slippage protection)
     * @param deadline Transaction deadline
     * @return encryptedAmountOut Encrypted output amount (only user can decrypt)
     */
    function confidentialSwap(
        bytes32 encryptedAmountIn,
        address tokenIn,
        address tokenOut,
        uint256 minAmountOut,
        uint256 deadline
    ) external nonReentrant returns (bytes32 encryptedAmountOut) {
        if (block.timestamp > deadline) revert SwapFailed();

        address underlyingIn = underlyingTokens[tokenIn];
        address underlyingOut = underlyingTokens[tokenOut];

        if (underlyingIn == address(0) || underlyingOut == address(0)) revert InvalidToken();

        // ═══════════════════════════════
        // NOX STEP 1: Decrypt in TEE
        // ═══════════════════════════════
        uint256 amountIn = noxCompute.decrypt(encryptedAmountIn);
        if (amountIn == 0) revert SwapFailed();

        // ═══════════════════════════════
        // NOX STEP 2: Unwrap confidential token
        // ═══════════════════════════════
        // Transfer confidential token from user to this contract
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Unwrap: cUSDC → USDC (plain)
        IConfidentialERC20(tokenIn).unwrap(address(this), amountIn);

        // ═══════════════════════════════
        // DEX: Execute swap on underlying protocol (UNCHANGED!)
        // ═══════════════════════════════
        IERC20(underlyingIn).safeIncreaseAllowance(address(dexRouter), amountIn);

        address[] memory path = new address[](2);
        path[0] = underlyingIn;
        path[1] = underlyingOut;

        uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
            amountIn,
            minAmountOut,
            path,
            address(this),
            deadline
        );

        uint256 amountOut = amounts[amounts.length - 1];
        if (amountOut < minAmountOut) revert InsufficientOutput();

        // ═══════════════════════════════
        // NOX STEP 3: Wrap output to confidential token
        // ═══════════════════════════════
        // Approve underlying token for confidential token contract
        IERC20(underlyingOut).safeIncreaseAllowance(tokenOut, amountOut);

        // Wrap: RLC (plain) → cRLC (encrypted)
        IConfidentialERC20(tokenOut).wrap(msg.sender, amountOut);

        // ═══════════════════════════════
        // NOX STEP 4: Encrypt output
        // ═══════════════════════════════
        encryptedAmountOut = noxCompute.encrypt(amountOut);

        emit ConfidentialSwap(
            msg.sender,
            tokenIn,
            tokenOut,
            encryptedAmountIn,
            encryptedAmountOut,
            block.timestamp
        );
    }

    /**
     * @notice Get quote for confidential swap (view function)
     * @param amountIn Input amount (plaintext for quote)
     * @param tokenIn Confidential input token
     * @param tokenOut Confidential output token
     * @return amountOut Expected output amount
     */
    function getQuote(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    ) external view returns (uint256 amountOut) {
        address underlyingIn = underlyingTokens[tokenIn];
        address underlyingOut = underlyingTokens[tokenOut];

        if (underlyingIn == address(0) || underlyingOut == address(0)) revert InvalidToken();

        address[] memory path = new address[](2);
        path[0] = underlyingIn;
        path[1] = underlyingOut;

        uint256[] memory amounts = dexRouter.getAmountsOut(amountIn, path);
        amountOut = amounts[amounts.length - 1];
    }

    // ═══════════════════════════════
    // Admin Functions
    // ═══════════════════════════════

    /**
     * @notice Map confidential token to underlying token
     * @param confidentialToken Confidential token address (e.g., cUSDC)
     * @param underlyingToken Underlying token address (e.g., USDC)
     */
    function setUnderlyingToken(
        address confidentialToken,
        address underlyingToken
    ) external onlyOwner {
        if (confidentialToken == address(0) || underlyingToken == address(0)) revert ZeroAddress();
        underlyingTokens[confidentialToken] = underlyingToken;
        emit UnderlyingTokenMapped(confidentialToken, underlyingToken);
    }

    /**
     * @notice Update DEX router address
     * @param newRouter New DEX router address
     */
    function setDEXRouter(address newRouter) external onlyOwner {
        if (newRouter == address(0)) revert ZeroAddress();
        address oldRouter = address(dexRouter);
        dexRouter = ISwapRouter(newRouter);
        emit DEXRouterUpdated(oldRouter, newRouter);
    }

    /**
     * @notice Emergency token recovery (only owner)
     * @param token Token address to recover
     * @param amount Amount to recover
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
