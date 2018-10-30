'use strict';

const logger = require('../server-lib/logger');
const config = require('../server-config');
const sendResponse = require('../server-lib/send_response');
const sign = require('../server-lib/sign');
const validations = require('../server-lib/validations');
const isAddressConfirmed = require('../server-lib/is_address_confirmed');
const getAddressDetails = require('../server-lib/get_address_details');

const web3 = config.web3;
const SIGNER_PRIVATE_KEY = config.signerPrivateKey;
const POPA_ERC725_CONTRACT_ADDRESS = config.cconf.popaErc725ContractAddress;
const POPA_URI = 'http://popa.poa.network';
// Number "7" zero-padded-uint256-representation
const CLAIM_TYPE_KYC_UINT256 = '0x0000000000000000000000000000000000000000000000000000000000000007';

function issueErc725Claim(req, res) {
    const logPrfx = req.logPrfx;
    const prelog = `[issueErc725Claim] (${logPrfx})`;

    // Store options/params sent in req.bod, after validation
    let opts = null;

    return validateData(req.body)
        .then(data => {
            opts = data;
            return isAddressConfirmed({ wallet: opts.wallet, addressIndex: opts.addressIndex});
        })
        .then(isConfirmed => {
            if (!isConfirmed) {
                throw new Error('the address specified by addressIndex is not confirmed');
            }
            // Store opts.addressIndex as the 2nd elem of an array because getAddressDetails interface
            return getAddressDetails([null, opts.addressIndex], opts.wallet);
        })
        .then(physicalAddress => {
            const {signature, physicalAddressSha3} = getErc725Signature(physicalAddress, opts.destinationClaimHolderAddress);
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
    const physicalAddressKeys = Object.keys(physicalAddress);
    let physicalAddressValues = [];
    for (let i = 0; i < physicalAddressKeys.length; i++) {
        physicalAddressValues.push(physicalAddress[physicalAddressKeys[i]]);
    }
    let physicalAddressSha3 = web3.sha3(physicalAddressValues.join(','));

    let dataToHash = Buffer.concat([
        Buffer.from(destinationClaimHolderAddress.substr(2), 'hex'),
        Buffer.from(CLAIM_TYPE_KYC_UINT256.substr(2), 'hex'),
        Buffer.from(physicalAddressSha3.substr(2), 'hex'),
    ]).toString('hex');

    const { sig } = sign(dataToHash, SIGNER_PRIVATE_KEY);
    const signature = '0x' + sig;

    return {signature, physicalAddressSha3};
};

const validateData = (body = {}) => {
    return new Promise((resolve, reject) => {
        if (!body || !Object.keys(body).length) {
            return reject({ok: false, log: 'request body empty', msg: 'request body empty'});
        } else {
            return resolve(body);
        }
    })
        .then(body => validateParams(body, 'wallet'))
        .then(body => validateParams(body, 'addressIndex'))
        .then(body => validateParams(body, 'destinationClaimHolderAddress'));
};
const validateParams = (body, param) => {
    return new Promise((resolve, reject) => {
        const result = (param === 'wallet' || param === 'destinationClaimHolderAddress')
            ? validations.validate.wallet(body[param])
            : validations.validate.string(body[param]);
        if (!result.ok) {
            const log = `validation error on ${param}: ${body[param]}, err: ${result.msg}`;
            return reject({...result, log, msg: log});
        }
        return resolve(body);
    });
};


module.exports = {
    issueErc725Claim,
};
