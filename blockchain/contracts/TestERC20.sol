pragma solidity 0.4.24;

import "./ERC20.sol";


// contract used in the tests for ProofOfPhysicalAddress
contract TestERC20 is ERC20 {
    uint256 public _totalSupply = 1000;

    mapping(address => uint256) balances;

    function TestERC20() public {
        balances[msg.sender] = _totalSupply;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address tokenOwner) public view returns (uint256) {
        return balances[tokenOwner];
    }

    function transfer(address to, uint256 tokens) public returns (bool success) {
        balances[msg.sender] = balances[msg.sender] - tokens;
        balances[to] = balances[to] + tokens;
        return true;
    }

    // not implemented
    // the bodies are just to avoid compiler warnings
    function allowance(address tokenOwner, address spender) public view returns (uint remaining) {
        tokenOwner; spender;
        return 0;
    }
    function approve(address spender, uint tokens) public returns (bool success) {
        spender; tokens;
        return false;
    }
    function transferFrom(address from, address to, uint tokens) public returns (bool success) {
        from; to; tokens;
        return false;
    }
}
