module.exports = {
  networks: {
    test: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas: '5000000'
    },
    coverage: {
      host: '127.0.0.1',
      port: 8555,
      network_id: '*',
      gas: '0xfffffffffff',
      gasPrice: 0x01
    }
  }
};
