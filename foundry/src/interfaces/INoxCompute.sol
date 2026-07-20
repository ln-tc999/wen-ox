// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title INoxCompute
 * @notice Interface for iExec Nox TEE precompile
 * @dev Deployed at 0xd464B198f06756a1d00be223634b85E0a731c229 on Arbitrum Sepolia
 */
interface INoxCompute {
    /**
     * @notice Decrypt an encrypted value within TEE
     * @param encryptedValue The encrypted bytes32 handle
     * @return Decrypted uint256 value
     */
    function decrypt(bytes32 encryptedValue) external view returns (uint256);

    /**
     * @notice Encrypt a value within TEE
     * @param value The plaintext uint256 value
     * @return Encrypted bytes32 handle
     */
    function encrypt(uint256 value) external view returns (bytes32);

    /**
     * @notice Allow public decryption of an encrypted value
     * @param encryptedValue The encrypted handle to make publicly decryptable
     */
    function allowPublicDecryption(bytes32 encryptedValue) external;
}
