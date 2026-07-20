// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/INoxCompute.sol";
import "./interfaces/IConfidentialERC20.sol";
import "./interfaces/IAaveV3.sol";

/**
 * @title NoxLendingPool
 * @notice Privacy-preserving lending protocol using iExec Nox + Aave V3
 * @dev Wraps Aave V3 with confidential token support
 *
 * Flow:
 * 1. User submits encrypted amount (via Nox Handle SDK)
 * 2. Contract decrypts amount in TEE
 * 3. Unwrap confidential token → plain token
 * 4. Execute Aave operation (supply/borrow/repay/withdraw - unchanged protocol!)
 * 5. Wrap output → confidential token
 * 6. Return encrypted result to user
 *
 * Privacy: Only user can decrypt their collateral/debt amounts. Public sees encrypted handles only.
 */
contract NoxLendingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Nox TEE precompile for encryption/decryption
    INoxCompute public immutable noxCompute;

    /// @notice Aave V3 Pool (main lending protocol)
    IPool public aavePool;

    /// @notice Aave V3 Data Provider (view functions)
    IPoolDataProvider public aaveDataProvider;

    /// @notice Mapping of confidential token → underlying token
    mapping(address => address) public underlyingTokens;

    /// @notice Mapping of user → confidential collateral tracking
    mapping(address => mapping(address => bytes32)) public encryptedCollateral;

    /// @notice Mapping of user → confidential debt tracking
    mapping(address => mapping(address => bytes32)) public encryptedDebt;

    /// @notice Interest rate mode: 2 = variable (recommended)
    uint256 public constant INTEREST_RATE_MODE = 2;

    /// @notice Events
    event ConfidentialSupply(
        address indexed user,
        address indexed asset,
        bytes32 encryptedAmount,
        uint256 timestamp
    );

    event ConfidentialWithdraw(
        address indexed user,
        address indexed asset,
        bytes32 encryptedAmount,
        uint256 timestamp
    );

    event ConfidentialBorrow(
        address indexed user,
        address indexed asset,
        bytes32 encryptedAmount,
        uint256 timestamp
    );

    event ConfidentialRepay(
        address indexed user,
        address indexed asset,
        bytes32 encryptedAmount,
        uint256 timestamp
    );

    event AavePoolUpdated(address indexed oldPool, address indexed newPool);
    event UnderlyingTokenMapped(address indexed confidentialToken, address indexed underlyingToken);

    error ZeroAddress();
    error InvalidToken();
    error OperationFailed();
    error InsufficientCollateral();

    /**
     * @param _noxCompute Address of Nox TEE precompile
     * @param _aavePool Address of Aave V3 Pool
     * @param _aaveDataProvider Address of Aave V3 Data Provider
     */
    constructor(
        address _noxCompute,
        address _aavePool,
        address _aaveDataProvider
    ) Ownable(msg.sender) {
        if (_noxCompute == address(0) || _aavePool == address(0) || _aaveDataProvider == address(0)) {
            revert ZeroAddress();
        }

        noxCompute = INoxCompute(_noxCompute);
        aavePool = IPool(_aavePool);
        aaveDataProvider = IPoolDataProvider(_aaveDataProvider);
    }

    // ═══════════════════════════════
    // Supply (Deposit Collateral)
    // ═══════════════════════════════

    /**
     * @notice Supply confidential collateral to Aave
     * @param encryptedAmount Encrypted supply amount (from Nox Handle SDK)
     * @param asset Confidential asset (e.g., cUSDC)
     * @return encryptedReceipt Encrypted receipt (aToken balance)
     */
    function confidentialSupply(
        bytes32 encryptedAmount,
        address asset
    ) external nonReentrant returns (bytes32 encryptedReceipt) {
        address underlying = underlyingTokens[asset];
        if (underlying == address(0)) revert InvalidToken();

        // ═══════════════════════════════
        // NOX STEP 1: Decrypt in TEE
        // ═══════════════════════════════
        uint256 amount = noxCompute.decrypt(encryptedAmount);
        if (amount == 0) revert OperationFailed();

        // ═══════════════════════════════
        // NOX STEP 2: Unwrap confidential token
        // ═══════════════════════════════
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        IConfidentialERC20(asset).unwrap(address(this), amount);

        // ═══════════════════════════════
        // AAVE: Supply to protocol (UNCHANGED!)
        // ═══════════════════════════════
        IERC20(underlying).safeIncreaseAllowance(address(aavePool), amount);
        aavePool.supply(underlying, amount, msg.sender, 0);

        // Track encrypted collateral
        encryptedCollateral[msg.sender][asset] = noxCompute.encrypt(amount);

        // ═══════════════════════════════
        // NOX STEP 3: Encrypt receipt
        // ═══════════════════════════════
        encryptedReceipt = noxCompute.encrypt(amount);

        emit ConfidentialSupply(msg.sender, asset, encryptedAmount, block.timestamp);
    }

    // ═══════════════════════════════
    // Withdraw (Remove Collateral)
    // ═══════════════════════════════

    /**
     * @notice Withdraw confidential collateral from Aave
     * @param encryptedAmount Encrypted withdraw amount
     * @param asset Confidential asset (e.g., cUSDC)
     * @return encryptedAmountWithdrawn Encrypted amount withdrawn
     */
    function confidentialWithdraw(
        bytes32 encryptedAmount,
        address asset
    ) external nonReentrant returns (bytes32 encryptedAmountWithdrawn) {
        address underlying = underlyingTokens[asset];
        if (underlying == address(0)) revert InvalidToken();

        // ═══════════════════════════════
        // NOX: Decrypt amount
        // ═══════════════════════════════
        uint256 amount = noxCompute.decrypt(encryptedAmount);
        if (amount == 0) revert OperationFailed();

        // ═══════════════════════════════
        // AAVE: Withdraw from protocol (UNCHANGED!)
        // ═══════════════════════════════
        uint256 withdrawn = aavePool.withdraw(underlying, amount, address(this));

        // ═══════════════════════════════
        // NOX: Wrap to confidential token
        // ═══════════════════════════════
        IERC20(underlying).safeIncreaseAllowance(asset, withdrawn);
        IConfidentialERC20(asset).wrap(msg.sender, withdrawn);

        // ═══════════════════════════════
        // NOX: Encrypt output
        // ═══════════════════════════════
        encryptedAmountWithdrawn = noxCompute.encrypt(withdrawn);

        emit ConfidentialWithdraw(msg.sender, asset, encryptedAmount, block.timestamp);
    }

    // ═══════════════════════════════
    // Borrow
    // ═══════════════════════════════

    /**
     * @notice Borrow confidential asset from Aave (requires collateral)
     * @param encryptedAmount Encrypted borrow amount
     * @param asset Confidential asset to borrow (e.g., cUSDC)
     * @return encryptedBorrowed Encrypted amount borrowed
     */
    function confidentialBorrow(
        bytes32 encryptedAmount,
        address asset
    ) external nonReentrant returns (bytes32 encryptedBorrowed) {
        address underlying = underlyingTokens[asset];
        if (underlying == address(0)) revert InvalidToken();

        // ═══════════════════════════════
        // NOX: Decrypt amount
        // ═══════════════════════════════
        uint256 amount = noxCompute.decrypt(encryptedAmount);
        if (amount == 0) revert OperationFailed();

        // Check health factor before borrow (optional safety)
        (,,,,, uint256 healthFactor) = aavePool.getUserAccountData(msg.sender);
        if (healthFactor < 1.5e18) revert InsufficientCollateral(); // Require HF > 1.5

        // ═══════════════════════════════
        // AAVE: Borrow from protocol (UNCHANGED!)
        // ═══════════════════════════════
        aavePool.borrow(underlying, amount, INTEREST_RATE_MODE, 0, msg.sender);

        // Transfer borrowed tokens to this contract
        IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);

        // ═══════════════════════════════
        // NOX: Wrap to confidential token
        // ═══════════════════════════════
        IERC20(underlying).safeIncreaseAllowance(asset, amount);
        IConfidentialERC20(asset).wrap(msg.sender, amount);

        // Track encrypted debt
        encryptedDebt[msg.sender][asset] = noxCompute.encrypt(amount);

        // ═══════════════════════════════
        // NOX: Encrypt output
        // ═══════════════════════════════
        encryptedBorrowed = noxCompute.encrypt(amount);

        emit ConfidentialBorrow(msg.sender, asset, encryptedAmount, block.timestamp);
    }

    // ═══════════════════════════════
    // Repay
    // ═══════════════════════════════

    /**
     * @notice Repay confidential debt to Aave
     * @param encryptedAmount Encrypted repay amount
     * @param asset Confidential asset to repay (e.g., cUSDC)
     * @return encryptedRepaid Encrypted amount repaid
     */
    function confidentialRepay(
        bytes32 encryptedAmount,
        address asset
    ) external nonReentrant returns (bytes32 encryptedRepaid) {
        address underlying = underlyingTokens[asset];
        if (underlying == address(0)) revert InvalidToken();

        // ═══════════════════════════════
        // NOX: Decrypt amount
        // ═══════════════════════════════
        uint256 amount = noxCompute.decrypt(encryptedAmount);
        if (amount == 0) revert OperationFailed();

        // ═══════════════════════════════
        // NOX: Unwrap confidential token
        // ═══════════════════════════════
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        IConfidentialERC20(asset).unwrap(address(this), amount);

        // ═══════════════════════════════
        // AAVE: Repay debt (UNCHANGED!)
        // ═══════════════════════════════
        IERC20(underlying).safeIncreaseAllowance(address(aavePool), amount);
        uint256 repaid = aavePool.repay(underlying, amount, INTEREST_RATE_MODE, msg.sender);

        // ═══════════════════════════════
        // NOX: Encrypt output
        // ═══════════════════════════════
        encryptedRepaid = noxCompute.encrypt(repaid);

        emit ConfidentialRepay(msg.sender, asset, encryptedAmount, block.timestamp);
    }

    // ═══════════════════════════════
    // View Functions
    // ═══════════════════════════════

    /**
     * @notice Get user's encrypted collateral balance
     * @param user User address
     * @param asset Confidential asset
     * @return Encrypted collateral amount
     */
    function getEncryptedCollateral(
        address user,
        address asset
    ) external view returns (bytes32) {
        return encryptedCollateral[user][asset];
    }

    /**
     * @notice Get user's encrypted debt balance
     * @param user User address
     * @param asset Confidential asset
     * @return Encrypted debt amount
     */
    function getEncryptedDebt(
        address user,
        address asset
    ) external view returns (bytes32) {
        return encryptedDebt[user][asset];
    }

    /**
     * @notice Get user's health factor (public - for liquidation monitoring)
     * @param user User address
     * @return healthFactor Health factor (1e18 = 100%, < 1e18 = liquidatable)
     */
    function getHealthFactor(address user) external view returns (uint256 healthFactor) {
        (,,,,, healthFactor) = aavePool.getUserAccountData(user);
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
     * @notice Update Aave Pool address
     * @param newPool New Aave Pool address
     */
    function setAavePool(address newPool, address newDataProvider) external onlyOwner {
        if (newPool == address(0) || newDataProvider == address(0)) revert ZeroAddress();
        address oldPool = address(aavePool);
        aavePool = IPool(newPool);
        aaveDataProvider = IPoolDataProvider(newDataProvider);
        emit AavePoolUpdated(oldPool, newPool);
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
