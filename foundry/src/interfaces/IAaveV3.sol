// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IPool
 * @notice Interface for Aave V3 Pool (main lending protocol)
 * @dev Simplified interface for supply, borrow, repay, withdraw
 */
interface IPool {
    /**
     * @notice Supply asset to Aave as collateral
     * @param asset Address of the asset to supply
     * @param amount Amount to supply
     * @param onBehalfOf Address that will receive aTokens
     * @param referralCode Referral code (0 if none)
     */
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    /**
     * @notice Withdraw supplied asset from Aave
     * @param asset Address of the asset to withdraw
     * @param amount Amount to withdraw (type(uint256).max for all)
     * @param to Address that will receive the asset
     * @return Amount withdrawn
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);

    /**
     * @notice Borrow asset from Aave
     * @param asset Address of the asset to borrow
     * @param amount Amount to borrow
     * @param interestRateMode Interest rate mode (1 = stable, 2 = variable)
     * @param referralCode Referral code (0 if none)
     * @param onBehalfOf Address that will incur the debt
     */
    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) external;

    /**
     * @notice Repay borrowed asset to Aave
     * @param asset Address of the asset to repay
     * @param amount Amount to repay (type(uint256).max for all debt)
     * @param interestRateMode Interest rate mode (1 = stable, 2 = variable)
     * @param onBehalfOf Address whose debt will be repaid
     * @return Amount repaid
     */
    function repay(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        address onBehalfOf
    ) external returns (uint256);

    /**
     * @notice Get user account data
     * @param user Address of the user
     * @return totalCollateralBase Total collateral in base currency
     * @return totalDebtBase Total debt in base currency
     * @return availableBorrowsBase Available borrows in base currency
     * @return currentLiquidationThreshold Current liquidation threshold
     * @return ltv Loan to value
     * @return healthFactor Health factor (< 1e18 = liquidatable)
     */
    function getUserAccountData(address user)
        external
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );
}

/**
 * @title IPoolDataProvider
 * @notice Interface for Aave V3 Pool Data Provider (view functions)
 */
interface IPoolDataProvider {
    /**
     * @notice Get user reserve data
     * @param asset Address of the asset
     * @param user Address of the user
     * @return currentATokenBalance aToken balance
     * @return currentStableDebt Stable debt balance
     * @return currentVariableDebt Variable debt balance
     * @return principalStableDebt Principal stable debt
     * @return scaledVariableDebt Scaled variable debt
     * @return stableBorrowRate Stable borrow rate
     * @return liquidityRate Liquidity rate
     * @return stableRateLastUpdated Last update timestamp for stable rate
     * @return usageAsCollateralEnabled Whether asset is used as collateral
     */
    function getUserReserveData(address asset, address user)
        external
        view
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
        );

    /**
     * @notice Get reserve data
     * @param asset Address of the asset
     * @return availableLiquidity Available liquidity
     * @return totalStableDebt Total stable debt
     * @return totalVariableDebt Total variable debt
     * @return liquidityRate Current liquidity rate
     * @return variableBorrowRate Current variable borrow rate
     * @return stableBorrowRate Current stable borrow rate
     * @return averageStableBorrowRate Average stable borrow rate
     * @return liquidityIndex Liquidity index
     * @return variableBorrowIndex Variable borrow index
     * @return lastUpdateTimestamp Last update timestamp
     */
    function getReserveData(address asset)
        external
        view
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
        );
}
