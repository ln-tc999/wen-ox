// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IAaveV3.sol";

/**
 * @title MockAavePool
 * @notice Mock Aave V3 Pool for testing NoxLendingPool on testnets
 * @dev Simplified implementation for testing - NOT FOR PRODUCTION
 *
 * WARNING: This is a mock! Real Aave has:
 * - Complex interest rate calculations
 * - Liquidation mechanisms
 * - Oracle price feeds
 * - aTokens (ERC20 representing deposits)
 */
contract MockAavePool is IPool {
    using SafeERC20 for IERC20;

    /// @notice Mock collateral tracking
    mapping(address => mapping(address => uint256)) public userCollateral;

    /// @notice Mock debt tracking
    mapping(address => mapping(address => uint256)) public userDebt;

    /// @notice Mock liquidity (reserve balance)
    mapping(address => uint256) public reserves;

    /// @notice Mock LTV ratio (70% = 7000)
    uint256 public constant LTV_BPS = 7000;
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Mock liquidation threshold (80% = 8000)
    uint256 public constant LIQUIDATION_THRESHOLD_BPS = 8000;

    event Supply(address indexed user, address indexed asset, uint256 amount);
    event Withdraw(address indexed user, address indexed asset, uint256 amount);
    event Borrow(address indexed user, address indexed asset, uint256 amount);
    event Repay(address indexed user, address indexed asset, uint256 amount);

    /**
     * @notice Supply asset as collateral
     */
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 /* referralCode */
    ) external override {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        userCollateral[onBehalfOf][asset] += amount;
        reserves[asset] += amount;
        emit Supply(onBehalfOf, asset, amount);
    }

    /**
     * @notice Withdraw supplied asset
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external override returns (uint256) {
        uint256 maxWithdraw = userCollateral[msg.sender][asset];

        // Handle max withdrawal
        if (amount == type(uint256).max) {
            amount = maxWithdraw;
        }

        require(amount <= maxWithdraw, "Insufficient collateral");
        require(amount <= reserves[asset], "Insufficient liquidity");

        userCollateral[msg.sender][asset] -= amount;
        reserves[asset] -= amount;

        IERC20(asset).safeTransfer(to, amount);
        emit Withdraw(msg.sender, asset, amount);

        return amount;
    }

    /**
     * @notice Borrow asset (requires collateral)
     */
    function borrow(
        address asset,
        uint256 amount,
        uint256 /* interestRateMode */,
        uint16 /* referralCode */,
        address onBehalfOf
    ) external override {
        require(amount <= reserves[asset], "Insufficient liquidity");

        // Simple health factor check (mock)
        uint256 totalCollateralValue = _getTotalCollateralValue(onBehalfOf);
        uint256 totalDebtValue = _getTotalDebtValue(onBehalfOf) + amount;

        uint256 maxBorrow = (totalCollateralValue * LTV_BPS) / BPS_DENOMINATOR;
        require(totalDebtValue <= maxBorrow, "Insufficient collateral for borrow");

        userDebt[onBehalfOf][asset] += amount;
        reserves[asset] -= amount;

        IERC20(asset).safeTransfer(onBehalfOf, amount);
        emit Borrow(onBehalfOf, asset, amount);
    }

    /**
     * @notice Repay borrowed asset
     */
    function repay(
        address asset,
        uint256 amount,
        uint256 /* interestRateMode */,
        address onBehalfOf
    ) external override returns (uint256) {
        uint256 debt = userDebt[onBehalfOf][asset];

        // Handle max repayment
        if (amount == type(uint256).max) {
            amount = debt;
        }

        require(amount <= debt, "Repay amount exceeds debt");

        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);

        userDebt[onBehalfOf][asset] -= amount;
        reserves[asset] += amount;

        emit Repay(onBehalfOf, asset, amount);
        return amount;
    }

    /**
     * @notice Get user account data
     */
    function getUserAccountData(address user)
        external
        view
        override
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        totalCollateralBase = _getTotalCollateralValue(user);
        totalDebtBase = _getTotalDebtValue(user);

        availableBorrowsBase = (totalCollateralBase * LTV_BPS) / BPS_DENOMINATOR;
        if (availableBorrowsBase > totalDebtBase) {
            availableBorrowsBase -= totalDebtBase;
        } else {
            availableBorrowsBase = 0;
        }

        currentLiquidationThreshold = LIQUIDATION_THRESHOLD_BPS;
        ltv = LTV_BPS;

        // Health factor calculation
        if (totalDebtBase == 0) {
            healthFactor = type(uint256).max;
        } else {
            uint256 collateralWithThreshold = (totalCollateralBase * LIQUIDATION_THRESHOLD_BPS) / BPS_DENOMINATOR;
            healthFactor = (collateralWithThreshold * 1e18) / totalDebtBase;
        }
    }

    // ═══════════════════════════════
    // Internal Helpers
    // ═══════════════════════════════

    function _getTotalCollateralValue(address user) internal view returns (uint256 total) {
        // Simplified: assume all assets = $1
        // In real Aave, this uses Chainlink oracles
        // For our mock, just sum up collateral amounts
        // (This is very simplified - production would need price feeds!)
        return userCollateral[user][address(0)] * 1e18; // Placeholder
    }

    function _getTotalDebtValue(address user) internal view returns (uint256 total) {
        // Simplified: assume all assets = $1
        return userDebt[user][address(0)] * 1e18; // Placeholder
    }

    // ═══════════════════════════════
    // Admin Functions (for testing)
    // ═══════════════════════════════

    /**
     * @notice Fund pool with liquidity for testing
     */
    function fundPool(address asset, uint256 amount) external {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        reserves[asset] += amount;
    }

    /**
     * @notice Get user collateral balance
     */
    function getUserCollateral(address user, address asset) external view returns (uint256) {
        return userCollateral[user][asset];
    }

    /**
     * @notice Get user debt balance
     */
    function getUserDebt(address user, address asset) external view returns (uint256) {
        return userDebt[user][asset];
    }
}

/**
 * @title MockAaveDataProvider
 * @notice Mock data provider for testing
 */
contract MockAaveDataProvider is IPoolDataProvider {
    MockAavePool public pool;

    constructor(address _pool) {
        pool = MockAavePool(_pool);
    }

    function getUserReserveData(address asset, address user)
        external
        view
        override
        returns (
            uint256 currentATokenBalance,
            uint256 currentStableDebt,
            uint256 currentVariableDebt,
            uint256 principalStableDebt,
            uint256 scaledVariableDebt,
            uint256 stableBorrowRate,
            uint256 liquidityRate,
            uint40 stableRateLastUpdated,
            bool usageAsCollateralEnabled
        )
    {
        currentATokenBalance = pool.getUserCollateral(user, asset);
        currentVariableDebt = pool.getUserDebt(user, asset);
        usageAsCollateralEnabled = true;
        // Other fields defaulted to 0/false
    }

    function getReserveData(address asset)
        external
        view
        override
        returns (
            uint256 availableLiquidity,
            uint256 totalStableDebt,
            uint256 totalVariableDebt,
            uint256 liquidityRate,
            uint256 variableBorrowRate,
            uint256 stableBorrowRate,
            uint256 averageStableBorrowRate,
            uint256 liquidityIndex,
            uint256 variableBorrowIndex,
            uint40 lastUpdateTimestamp
        )
    {
        availableLiquidity = pool.reserves(asset);
        // Other fields mocked as 0
    }
}
