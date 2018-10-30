'use strict';

const config = require('../server-config');
const sign = require('../server-lib/sign');
const web3 = config.web3;

const SIGNER_PRIVATE_KEY = config.signerPrivateKey;
// Number "7" zero-padded-uint256-representation
const CLAIM_TYPE_KYC_UINT256 = '0x0000000000000000000000000000000000000000000000000000000000000007';

const getErc725Signature = (physicalAddress, destinationClaimHolderAddress) => {
    let physicalAddressSha3 = web3.sha3(getAllTextDetailsFromPhysicalAddress(physicalAddress));

    let dataToHash = Buffer.concat([
        Buffer.from(destinationClaimHolderAddress.substr(2), 'hex'),
        Buffer.from(CLAIM_TYPE_KYC_UINT256.substr(2), 'hex'),
        Buffer.from(physicalAddressSha3.substr(2), 'hex'),
    ]).toString('hex');

    const { sig } = sign(dataToHash, SIGNER_PRIVATE_KEY);
    const signature = '0x' + sig;

    return {signature, physicalAddressSha3};
};

const getAllTextDetailsFromPhysicalAddress = (physicalAddressDetails) => {
    const physicalAddressKeys = Object.keys(physicalAddressDetails);
    let physicalAddressValues = [];
    for (let i = 0; i < physicalAddressKeys.length; i++) {
        physicalAddressValues.push(physicalAddressDetails[physicalAddressKeys[i]]);
    }
    return physicalAddressValues.join(',');
};

module.exports = getErc725Signature;
