#!/usr/bin/node

'use strict';

var path = require('path');
var fs = require('fs');
var readline = require('readline');
var solc = require('solc');
var Web3 = require('web3');
var logger = console;
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var config = require('./utils-config')();

var web3 = new Web3(config.network);
var source = fs.readFileSync(config.source_file, 'utf8');
var owner = (config.owner === '$TEST' ? web3.eth.accounts[1] : config.owner);

function ask_pass(next) {
    logger.log('Please enter passphrase for your account:');

    process.stdin.setEncoding('utf8');
    process.stdin.once('data', function (val) {
        return next(val);
    }).resume();
}

logger.log('(1) Compiling contract');
var compiler_output = solc.compile(source);

if (compiler_output.errors) {
    logger.log('Compilation produced the following warnings/errors:');
    for (var e = 0; e < compiler_output.errors.length; e++) {
        logger.log('========== #' + (e+1) + ' ==========');
        logger.log(compiler_output.errors[e]);
        logger.log('');
    }
    if (!compiler_output.contracts[':' + config.contract_name]) {
        logger.log('Compilation failed!');
        return process.exit(1);
    }
    else {
        logger.log('Compilation completed with warnings/errors!');
    }
}
else {
    logger.log('Compilation completed successfully');
}

var compiled_contract = compiler_output.contracts[':' + config.contract_name];
var abi_def = JSON.parse(compiled_contract.interface);
var bytecode = compiled_contract.bytecode;

var web3_contract = web3.eth.contract(abi_def);
var tx_params = {
    from: owner,
    data: compiled_contract.bytecode
};

logger.log('(2) Estimating gas');
var egas = web3.eth.estimateGas(tx_params);
var ugas = Math.floor(1.1*egas);
var gprice = web3.eth.gasPrice;
tx_params.gas = ugas;

var confirm = function (next) {
    logger.log('(3) Confirmation');
    logger.log('\n==============================');
    logger.log('* This will deploy contract from ' + config.source_file + ' to network', config.network);
    logger.log('* Contract output will be saved to ' + config.contract_output);
    logger.log('* Contract owner is ' + (config.owner === '$TEST' ? 'TEST ' : '') + owner);
    logger.log('* Gas estimation: ' + egas + ' => ~' + gprice*egas/1e18 + ' ETH');
    logger.log('* Will set gas = ' + ugas + ' => ~' + gprice*ugas/1e18 + ' ETH');
    logger.log('==============================');
    /*
    process.stdout.write('Are you sure you want to proceed? (y/n) ');

    process.stdin.setEncoding('utf8');
    process.stdin.once('data', function (val) {
        var cleaned = val.trim().toLowerCase();
        if (cleaned === 'y' || cleaned === 'yes') {
            return next();
        }
        else {
            return process.exit(1);
        }
    }).resume();
    */
    rl.question('Are you sure you want to proceed? (y/n) ', function (val) {
        var cleaned = val.trim().toLowerCase();
        if (cleaned === 'y' || cleaned === 'yes') {
            logger.log('');
            return next();
        }
        else {
            return process.exit(1);
        }
    });
};

confirm(function () {
    logger.log('(4) Deploying contract');

    var contract;

    var should_ask_pass = false;
    var try_create_contract = function (password, proceed) {
        try {
            if (should_ask_pass) {
                web3.personal.unlockAccount(owner, password, 1000);
            }
            contract = web3_contract.new([], tx_params);
            return proceed();
        }
        catch (e) {
            if (e.message && e.message.toLowerCase().indexOf('could not unlock signer account') >= 0) {
                should_ask_pass = true;
            }
            else throw e;
        }

        if (should_ask_pass) {
            var query = 'Please enter account\'s password. Account will be unlocked for 1 second: ';
            var stdin = process.openStdin();
            var onDataHandler = function (char) {
                char = char + '';
                switch (char) {
                    case '\n':
                    case '\r':
                    case '\u0004':
                        stdin.removeListener('data', onDataHandler);
                        break;
                    default:
                        process.stdout.write("\x1B[2K\x1B[200D" + query + Array(rl.line.length + 1).join('*'));
                        break;
                }
            }
            process.stdin.on('data', onDataHandler);

            rl.question(query, function (value) {
                rl.history = rl.history.slice(1);
                return try_create_contract(value, proceed);
            });
        }
    };
    try_create_contract('', function () {
        process.stdout.write('Waiting for the tx to be mined');
        var wait_tx = function () {
            if (!contract.address) {
                process.stdout.write('.');
                return setTimeout(wait_tx, 500);
            }

            process.stdout.write('\n');
            var contract_address = contract.address;
            var tx = web3.eth.getTransactionReceipt(contract.transactionHash);
            logger.log('\n* Contract deployed to: ' + contract_address);
            logger.log('* Transaction hash: ' + tx.transactionHash);
            logger.log('* Block number: ' + tx.blockNumber);
            logger.log('* Block hash: ' + tx.blockHash);
            logger.log('* Gas used: ' + tx.gasUsed);
            logger.log('');

            var file_output = {};
            file_output[config.contract_name] = {
                address: contract_address,
                bytecode: bytecode,
                abi: abi_def,
            };
            logger.log('(5) Saving contract output to ' + config.contract_output);
            fs.writeFileSync(config.contract_output, JSON.stringify(file_output, null, 4));

            logger.log('\nDONE');
            return process.exit(0);
        };
        wait_tx();
    });
});
