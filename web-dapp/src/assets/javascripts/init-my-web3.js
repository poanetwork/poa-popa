window.addEventListener('load', function () {
    if (typeof window.web3 !== 'undefined') {
        window.my_web3 = new window.Web3(window.web3.currentProvider);
    }
});
