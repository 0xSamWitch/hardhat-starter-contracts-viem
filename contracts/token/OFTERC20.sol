// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {OFTV2, Context} from "../lz/token/oft/v2/OFTV2.sol";
import {ERC20Votes, ERC20} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title OFTERC20
 *
 * OFTERC20 is an omnichain ERC20 token contract. EIP2612 compliant for permit functionality.
 *
 * This is a LayerZero Cross chain compatible contract and is permitted to burn on the source chain and mint on another
 */
contract OFTERC20 is OFTV2, ERC20Votes, ERC20Permit {
  uint8 constant SHARED_DECIMALS = 8;
  string constant NAME = "Omnichain ERC20 Token";

  using SafeERC20 for IERC20;

  /**
   * @notice OFTERC20 contract constructor
   */
  constructor() OFTV2(NAME, "OFT", SHARED_DECIMALS) ERC20Permit(NAME) {
    // Only mint initial supply on main chain or dev chains for testing
    if (
      block.chainid == 1 || // ethereum
      block.chainid == 31337 // hardhat
    ) {
      _mint(_msgSender(), 1000 ether); // Mint 1000 tokens to the contract deployer
    }
  }

  function initialize(address _lzEndpoint) external initializer {
    __OFTV2_init(_lzEndpoint);
  }

  /**
   * @notice Burns OFTERC20
   * @param _amount The amount to burn
   */
  function burn(uint256 _amount) external {
    _burn(_msgSender(), _amount);
  }

  /**
   * @notice Burns OFTERC20 from a specific address which has given the sender an allowance
   * @param _account The account to burn from
   * @param _amount The amount to burn
   */
  function burnFrom(address _account, uint256 _amount) external {
    _spendAllowance(_account, _msgSender(), _amount);
    _burn(_account, _amount);
  }

  function _msgSender() internal view override(OFTV2, Context) returns (address) {
    return super._msgSender();
  }

  function _msgData() internal view override(OFTV2, Context) returns (bytes calldata) {
    return super._msgData();
  }

  function _update(address _from, address _to, uint256 _value) internal override(ERC20Votes, ERC20) {
    super._update(_from, _to, _value);
  }

  function nonces(address _owner) public view override(Nonces, ERC20Permit) returns (uint256) {
    return super.nonces(_owner);
  }

  function supportsInterface(bytes4 _interfaceId) public view override returns (bool) {
    return super.supportsInterface(_interfaceId);
  }

  /**
   * @notice Recover tokens sent to this contract by accident
   * @param _token The token to recover
   * @param _amount The amount to recover
   * @dev Only callable by the owner
   */
  function recoverToken(IERC20 _token, uint _amount) external onlyOwner {
    _token.safeTransfer(owner(), _amount);
  }
}
