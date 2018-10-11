window.addEventListener('load', function () {
    let { ethereum, web3 } = window;

    if (ethereum) {
        ethereum
            .enable()
            .then(() => window.my_web3 = new window.Web3(ethereum))
            .catch(error => console.error(error));
    } else if (typeof web3 !== 'undefined') {
        window.my_web3 = new window.Web3(web3.currentProvider);
    } else {
        console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});
