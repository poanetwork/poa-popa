pragma solidity 0.4.24;

import "./KeyHolder.sol";


contract ProofOfPhysicalAddressKeyHolder is KeyHolder {
    address public owner;
    address public signer;

    constructor() public {
        owner = msg.sender;
        signer = owner;
    }

    // Events:
    event LogSignerChanged(address newSigner);

    // Modifiers:
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // Methods:
    // set address that is used on server-side to calculate signatures
    // and on contract-side to verify them
    function setSigner(address newSigner) public onlyOwner {
        signer = newSigner;
        LogSignerChanged(newSigner);
    }

}
