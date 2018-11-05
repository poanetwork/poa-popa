pragma solidity 0.4.24;

import "./KeyHolder.sol";


contract ProofOfPhysicalAddressKeyHolder is KeyHolder {
    address public owner;
    address public signer;

    constructor() public {
        owner = msg.sender;
        signer = owner;
    }

}
