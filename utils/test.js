var path = require('path');
var Web3 = require('web3');
var logger = console;

var config = require('./utils-config')();

var cout = require(config.contractOutput);
var web3 = new Web3(config.network);
var cconf = cout[config.contract_name];
var contract = web3.eth.contract(cconf.abi).at(cconf.address);
var pad_n_hash = require('./pad_n_hash')(web3);

contract.address;

var acc = web3.eth.accounts[1];
var ccode = 'abs';

/*
contract.create_user('jon', 'nowhere', pad_n_hash(ccode), { from: acc, gas: 500000 });
contract.users(acc);
contract.confirm_user(ccode+'1', { from: acc, gas: 500000 });
contract.confirm_user(ccode, { from: acc, gas: 500000 });
*/

function signString(text) {
    /*
    * Sign a string and return (hash, v, r, s) used by ecrecover to regenerate the coinbase address;
    */
    let sha = web3.sha3(text);
    console.log('coinbase = ' + web3.eth.coinbase);
    let sig = web3.eth.sign(web3.eth.coinbase, sha);
    console.log('sig = ' + sig);
    sig = sig.substr(2, sig.length);
    let r = '0x' + sig.substr(0, 64);
    let s = '0x' + sig.substr(64, 64);
    let v = web3.toDecimal(sig.substr(128, 2)) + 27;
    console.log('v = ' + v);
    console.log('r = ' + r);
    console.log('s = ' + s);
    return { sha, v, r, s };
}

//var s = signString('Hello');
//s;
//contract.test(s.sha, s.v, s.r, s.s);
