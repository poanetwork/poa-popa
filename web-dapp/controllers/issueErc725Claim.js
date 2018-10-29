'use strict';

const logger = require('../server-lib/logger');
const config = require('../server-config');
const sendResponse = require('../server-lib/send_response');
const sign = require('../server-lib/sign');

const web3 = config.web3;
const SIGNER_PRIVATE_KEY = config.signerPrivateKey;
const POPA_ERC725_CONTRACT_ADDRESS = config.cconf.popaErc725ContractAddress;
const POPA_URI = 'http://popa.poa.network';
// Number "7" zero-padded-uint256-representation
const CLAIM_TYPE_KYC_UINT256 = '0x0000000000000000000000000000000000000000000000000000000000000007';

function issueErc725Claim(req, res) {
    const logPrfx = req.logPrfx;
    const prelog = `[issueErc725Claim] (${logPrfx})`;

    const {wallet, addressIndex, destinationClaimHolderAddress} = req.body;

    return getConfirmedAddressByIndex(wallet, addressIndex)
        .then(physicalAddress => {
            const {signature, physicalAddressSha3} = getErc725Signature(physicalAddress, destinationClaimHolderAddress);
            return sendResponse(res, {
                ok: true,
                signature,
                data: physicalAddressSha3,
                issuerAddress: POPA_ERC725_CONTRACT_ADDRESS,
                uri: POPA_URI,
            });
        })
        .catch(error => {
            logger.error(`${prelog} ${error.msg}`);
            return sendResponse(res, { ok: false, err: error.msg });
        });
}

const getErc725Signature = (physicalAddress, destinationClaimHolderAddress) => {
    let physicalAddressText = [
        physicalAddress[0], // country
        physicalAddress[1], // state
        physicalAddress[2], // city
        physicalAddress[3], // location
        physicalAddress[4], // zip
    ].join(',');
    let physicalAddressSha3 = web3.sha3(physicalAddressText);

    let dataToHash = Buffer.concat([
        Buffer.from(destinationClaimHolderAddress.substr(2), 'hex'),
        Buffer.from(CLAIM_TYPE_KYC_UINT256.substr(2), 'hex'),
        Buffer.from(physicalAddressSha3.substr(2), 'hex'),
    ]).toString('hex');

    const { sig } = sign(dataToHash, SIGNER_PRIVATE_KEY);
    const signature = '0x' + sig;

    return {signature, physicalAddressSha3};
};

const getConfirmedAddressByIndex = (wallet, addressIndex) => {
    return isAddressConfirmed(wallet, addressIndex)
        .then(() => {
            return new Promise((resolve, reject) => {
                config.contract.userAddress(wallet, addressIndex, function (err, details) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(details);
                    }
                });
            });
        });
};

function isAddressConfirmed (wallet, index) {
    return new Promise((resolve, reject) => {
        config.contract.userAddressConfirmed(wallet, index, (err, isConfirmed) => {
            return err ? reject(err) : resolve(isConfirmed);
        });
    });
}

module.exports = {
    issueErc725Claim,
    getConfirmedAddressByIndex,
};
