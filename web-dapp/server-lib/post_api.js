'use strict';
const config = require('../server-config');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const uuidv4 = require('uuid/v4');

var prelog = '[post_api] ';
logger.log(prelog + 'loading Lob');
const Lob = require('lob')(config.lobApiKey, { apiVersion: config.lobApiVersion || '2017-06-16' });

logger.log(prelog + 'reading postcard templates');
const pcFront = fs.readFileSync(path.join(__dirname, '../postcard/front.html'), 'utf8');
const pcBack = fs.readFileSync(path.join(__dirname, '../postcard/back.html'), 'utf8');

function new_idempotency_key() {
    return uuidv4();
}

function verify_address(address) {
    return new Promise((resolve, reject) => {
        Lob.usVerifications.verify({
            state: address.state.toUpperCase(),
            city: address.city.toUpperCase(),
            primary_line: address.location,
            zip_code: address.zip.toUpperCase(),
        }, function (err, result) {
            if (err || !result || !result.deliverability || result.deliverability.trim().toLowerCase() !== 'deliverable') {
                return reject({ok: false, msg: 'address is invalid', log: 'address is invalid'});
            }
            return resolve(address);
        });
    });
}

function create_postcard(wallet, address_details, txId, confirmationCodePlain, done) {
    Lob.postcards.create({
        description: 'Postcard for ' + wallet,
        to: {
            name: address_details.name.toUpperCase(),
            address_country: address_details.country.toUpperCase(),
            address_state: address_details.state.toUpperCase(),
            address_city: address_details.city.toUpperCase(),
            address_line1: address_details.location.toUpperCase(),
            address_zip: address_details.zip.toUpperCase(),
        },
        metadata: {
            wallet,
            txId,
            generationTime: (new Date).toISOString(),
        },
        front: pcFront,
        back: pcBack,
        merge_variables: {
            code: confirmationCodePlain.toUpperCase(),
            confirmationPageUrl: config.confirmationPageUrl,
            name: address_details.name.toUpperCase(),
            address: address_details.location.toUpperCase(),
            city: address_details.city.toUpperCase(),
            state: address_details.state.toUpperCase(),
            zip: address_details.zip.toUpperCase(),
        },
    }, {
        'idempotency-key': new_idempotency_key(),
    },function (err, result) {
        done(err, result);
    });
}

module.exports = {
    Lob,
    verify_address,
    create_postcard,
    lists: {},
};
