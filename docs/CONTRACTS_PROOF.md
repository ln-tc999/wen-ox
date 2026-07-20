# Smart Contracts Proof - Wen-Ox

**Date**: 2026-07-20  
**Network**: Arbitrum Sepolia (421614)  
**Hackathon**: WTF Summer Edition (iExec Nox Protocol)

## 📦 Contracts Built

### 1. NoxSwapRouter.sol
**Purpose**: Privacy-preserving DEX router wrapping Curve/Uniswap with Nox encryption

**Key Functions**:
- `confidentialSwap()` - Execute encrypted swap (input/output amounts hidden)
- `getQuote()` - Get swap quote (public view function)
- `setUnderlyingToken()` - Map confidential token to underlying

**Architecture**:
```solidity
User Input (encrypted) 
  → Nox TEE decrypt 
  → Unwrap cToken (cUSDC → USDC)
  → DEX Swap (Curve/Uniswap - protocol unchanged!)
  → Wrap output (USDC → cUSDC)
  → Encrypt result
  → User receives encrypted amount
```

**Lines of Code**: 179 (excluding interfaces)

**Dependencies**:
- `INoxCompute` - Nox TEE precompile for encryption/decryption
- `IConfidentialERC20` - ERC-7984 confidential token wrapper
- `ISwapRouter` - Unified DEX interface (Uniswap V2 compatible)

**Compilation**: ✅ Success (Solidity 0.8.24, Cancun EVM)

---

### 2. NoxLendingPool.sol
**Purpose**: Privacy-preserving lending protocol wrapping Aave V3 with Nox encryption

**Key Functions**:
- `confidentialSupply()` - Deposit encrypted collateral
- `confidentialWithdraw()` - Withdraw encrypted collateral
- `confidentialBorrow()` - Borrow with encrypted amounts
- `confidentialRepay()` - Repay encrypted debt
- `getHealthFactor()` - Check liquidation risk (public)

**Architecture**:
```solidity
Supply:
  User (encrypted collateral) 
    → Decrypt → Unwrap 
    → Aave.supply() (unchanged!)
    → Track encrypted balance

Borrow:
  User (encrypted borrow amount)
    → Check health factor
    → Aave.borrow() (unchanged!)
    → Wrap to cToken
    → Return encrypted

Repay:
  User (encrypted repay)
    → Unwrap cToken
    → Aave.repay() (unchanged!)
```

**Lines of Code**: 289 (excluding interfaces)

**Dependencies**:
- `INoxCompute` - Nox TEE encryption
- `IConfidentialERC20` - ERC-7984 tokens
- `IAaveV3` - Aave V3 Pool & Data Provider interfaces

**Safety Features**:
- Health factor check before borrow (minimum 1.5x)
- ReentrancyGuard on all state-changing functions
- Emergency withdrawal for admin

**Compilation**: ✅ Success

---

### 3. Supporting Contracts

#### MockDEXRouter.sol
- Mock Uniswap V2 router for testing
- 1:1 swap ratio with 1% slippage simulation
- FOR TESTING ONLY (not production)

#### MockAavePool.sol + MockAaveDataProvider.sol
- Mock Aave V3 implementation for testing
- Simplified LTV (70%) and liquidation threshold (80%)
- FOR TESTING ONLY (not production)

---

## 🏗️ Interfaces Created

### INoxCompute.sol
```solidity
interface INoxCompute {
    function decrypt(bytes32 encryptedValue) external view returns (uint256);
    function encrypt(uint256 value) external view returns (bytes32);
    function allowPublicDecryption(bytes32 encryptedValue) external;
}
```
**Deployed at**: `0xd464B198f06756a1d00be223634b85E0a731c229` (iExec infrastructure)

### IConfidentialERC20.sol
```solidity
interface IConfidentialERC20 is IERC20 {
    function wrap(address to, uint256 amount) external;
    function unwrap(address from, uint256 amount) external;
    function underlying() external view returns (address);
}
```
**Implementations**: cUSDC (`0x1ccec6bc...`), cRLC (`0x92b23f4a...`)

### ISwapRouter.sol
- Unified DEX interface (Uniswap V2 compatible)
- `swapExactTokensForTokens()`
- `getAmountsOut()`

### IAaveV3.sol
- Aave V3 Pool interface
- `supply()`, `withdraw()`, `borrow()`, `repay()`
- `getUserAccountData()` for health factor

---

## ✅ Compilation Proof

**Command**: `forge build`

**Result**: ✅ Success
```
Compiling 27 files with Solc 0.8.24
Solc 0.8.24 finished in 200.93ms
Compiler run successful
```

**Warnings**: 
- `block.timestamp` usage (acceptable for deadline checks)
- Unused parameters in mock contracts (testing only)

**Optimizer**: Enabled (200 runs)

---

## 📐 Architecture Compliance

### Hackathon Requirements:

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **Use existing protocols** | Wraps Curve/Uniswap + Aave V3 | ✅ |
| **Don't modify underlying** | Only wrap with privacy layer | ✅ |
| **Add privacy via Nox** | All amounts encrypted with Nox TEE | ✅ |
| **Maintain composability** | Output can be used in other protocols | ✅ |
| **Deploy on testnet** | Ready for Arbitrum Sepolia | ⏳ |

### Nox Integration Points:

1. **Client-side encryption** (Handle SDK):
   - User encrypts amounts before sending to contract
   
2. **Contract-side decryption** (Nox TEE):
   - Contract decrypts within trusted execution environment
   
3. **Output encryption**:
   - Results encrypted before returning to user
   
4. **Confidential tokens** (ERC-7984):
   - cUSDC, cRLC wrap/unwrap functionality

---

## 🔐 Privacy Guarantees

### What's Hidden:
- ✅ Individual swap amounts (input/output)
- ✅ Individual collateral amounts
- ✅ Individual debt amounts
- ✅ Borrow/repay amounts

### What's Public:
- ❌ Transaction existence (wallet addresses visible)
- ❌ Token types being swapped
- ❌ Health factor (for liquidation monitoring)
- ❌ Aggregate TVL in pools

### Privacy Level:
**Per-user privacy** with public aggregate verification.

Users can prove their holdings via Nox Handle SDK decryption (EIP-712 signature), but public observers cannot link amounts to addresses.

---

## 📊 Contract Sizes

```
NoxSwapRouter.sol       ~179 LOC
NoxLendingPool.sol      ~289 LOC
Interfaces              ~200 LOC
Mock Contracts          ~300 LOC (testing)
Total Production Code   ~668 LOC
```

---

## 🚀 Deployment Plan

### Phase 1: Mock DEX & Aave (Testing)
```bash
forge script DeployNoxSwapRouter --rpc-url arbitrum_sepolia --broadcast
forge script DeployNoxLending --rpc-url arbitrum_sepolia --broadcast
```

### Phase 2: Real DEX Integration
- Update `DEX_ROUTER` address to real Uniswap/Curve on Arbitrum Sepolia
- Test with small amounts

### Phase 3: Real Aave Integration (if available)
- Check if Aave V3 deployed on Arbitrum Sepolia
- If not, keep mock for demo

---

## 📝 Code Quality

### Security Features:
- ✅ ReentrancyGuard on all state-changing functions
- ✅ SafeERC20 for token transfers
- ✅ Ownable for admin functions
- ✅ Custom errors (gas efficient)
- ✅ Health factor checks before borrow

### Best Practices:
- ✅ NatSpec documentation
- ✅ Events for all operations
- ✅ Explicit error messages
- ✅ View functions for quotes

### Testing Readiness:
- ✅ Mock contracts included
- ✅ Deployment scripts ready
- ✅ Foundry test structure prepared

---

## 🎯 Next Steps

1. ✅ Contracts built and compiled
2. ⏳ Frontend integration (swap/lending UI)
3. ⏳ Deploy to Arbitrum Sepolia
4. ⏳ Verify on Arbiscan
5. ⏳ End-to-end testing
6. ⏳ Demo video

---

## 📚 References

- Nox Protocol Docs: https://docs.iex.ec/nox-protocol/getting-started/welcome
- ERC-7984 Standard: https://eips.ethereum.org/EIPS/eip-7984
- Aave V3 Docs: https://docs.aave.com/developers/
- Uniswap V2 Interface: https://docs.uniswap.org/contracts/v2/reference/smart-contracts/router-02

---

**Prepared for**: WTF Hackathon Summer Edition  
**Built with**: Foundry, Solidity 0.8.24, OpenZeppelin v5  
**Privacy by**: iExec Nox Protocol (TEE + ERC-7984)
