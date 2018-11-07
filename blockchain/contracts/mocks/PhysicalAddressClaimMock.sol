pragma solidity 0.4.24;

import "../PhysicalAddressClaim.sol";


/**
 * PhysicalAddressClaim "library mock contract", needed to make coverage work:
 * https://github.com/sc-forks/solidity-coverage/issues/234
 * Essentialy this is used only on tests, and JS tests files will use this
 * contracts' methods instead of the ones from the library.
 */
contract PhysicalAddressClaimMock {

    function encode(uint256 _confirmationBlockNumber) public pure returns(bytes32) {
        return PhysicalAddressClaim.encode(_confirmationBlockNumber);
    }

    function decode(bytes32 _claim) public pure returns(
        uint256 version,
        uint256 confirmation
    ) {
        return PhysicalAddressClaim.decode(_claim);
    }

    function decodeVersion(bytes32 _claim) public pure returns(uint256 version) {
        return PhysicalAddressClaim.decodeVersion(_claim);
    }

    function decodeConfirmation(bytes32 _claim) public pure returns(uint256 confirmation) {
        return PhysicalAddressClaim.decodeConfirmation(_claim);
    }
}
