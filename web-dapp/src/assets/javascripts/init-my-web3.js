window.addEventListener('load', function() {
    console.log('window.load event');
    if (typeof window.web3 !== 'undefined') {
        console.log('web3 defined');
        window.my_web3 = new window.Web3(window.web3.currentProvider);
    }
    else {
        console.log('web3 undefined');
    }
});
