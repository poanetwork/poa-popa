const config = require('../server-config');
const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const uuidv4 = require('uuid/v4');
//const qrcode = require('qrcode');

logger.log('Loading Lob');
const Lob = require('lob')(config.lob_api_key, { apiVersion: '2017-06-16' });

logger.log('Reading postcard templates');
const pc_front = fs.readFileSync(path.join(__dirname, '../postcard/front.html'), 'utf8');
const pc_back = fs.readFileSync(path.join(__dirname, '../postcard/back.html'), 'utf8');
//const confirmation_page_url = 'http://localhost:3000';

function new_idempotency_key() {
    return uuidv4();
}

function create_postcard(wallet, address_details, tx_id, confirmation_code_plain, done) {
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
            wallet: wallet,
            tx_id: tx_id,
            generation_time: (new Date).toISOString(),
        },
        front: pc_front,
        back: pc_back,
        merge_variables: {
            code: confirmation_code_plain,
        },
    }, {
        'idempotency-key': new_idempotency_key(),
    },function (err, result) {
        done(err, result);
    });
}

module.exports = {
    Lob,
    create_postcard,
};
