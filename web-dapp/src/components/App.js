import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import * as log from 'loglevel';

import Header from './Header';
import Footer from './Footer';
import RegisterAddressPage from './RegisterAddressPage';
import ConfirmationPage from './ConfirmationPage';

import '../assets/javascripts/init-my-web3.js';
import '../assets/javascripts/show-alert.js';

const WEB3_CHECKER_INTERV_MS = 500;
const GOOGLE_CHROME_URL = 'https://www.google.com/chrome/browser';
const META_MASK_URL = 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn';

const logger = log.getLogger('App');

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            my_web3: null,
            web3Checker: null,
            web3CheckerDur: 0,
            contract: null,
        };
        this.check_web3 = this.check_web3.bind(this);
        this.check_contract = this.check_contract.bind(this);
    }

    check_contract(cconf, callback) {
        logger.debug('checking contract');

        const contract = window.my_web3.eth.contract(cconf.abi).at(cconf.address);
        window.megaContract = contract;

        window.my_web3.eth.getCode(cconf.address, function (err, code) {
            if (err) {
                logger.debug('error fetching code from address: ' + cconf.address + ', err: ' + err);
                return callback();
            }

            // code here starts with 0x prefix in contrast with cconf.bytecode
            if (code.length <= 2) {
                logger.debug('code at address: ' + cconf.address + ' is empty: ' + code);
                return callback();
            }

            contract.owner(function (err, owner) {
                if (err) {
                    logger.debug('error fetching owner: ' + err);
                    return callback();
                }

                if (!owner || owner.length <= 2) {
                    logger.debug('owner is empty: ' + owner);
                    return callback();
                }

                return callback(contract);
            });
        });
    };

    check_web3() {
        logger.debug('check_web3');

        if (window.my_web3) {
            logger.debug('web3 found, getting contract');

            clearInterval(this.state.web3Checker);

            const cconf = {
              address: process.env.REACT_APP_POPA_CONTRACT_ADDRESS,
              abi: JSON.parse(process.env.REACT_APP_POPA_CONTRACT_ABI)
            }

            this.check_contract(cconf, (contract) => {
                if (contract) {
                    logger.debug('contract is ok, saving to state');
                    this.setState({
                        contract: contract,
                        my_web3: window.my_web3,
                        web3Checker: null,
                        web3CheckerDur: 0,
                    });
                } else {
                    logger.debug('contract is not ok');
                    this.setState({
                        contract: null,
                        my_web3: window.my_web3,
                        web3Checker: null,
                        web3CheckerDur: 0,
                    });
                }
            });
        } else {
            this.setState((prevState, props) => { prevState.web3CheckerDur += WEB3_CHECKER_INTERV_MS; }, () => {
                logger.debug('no web3 yet, web3CheckerDur = ' + this.state.web3CheckerDur);
            });
        }
    };

    componentDidMount() {
        logger.debug('App.componentDidMount');

        logger.debug('Starting web3Checker');
        this.setState({ web3Checker: setInterval(this.check_web3, WEB3_CHECKER_INTERV_MS) });
    }

    render() {
        if (this.state.my_web3 && this.state.contract) {
            return (
                <BrowserRouter>
                    <div>
                        <Header/>
                        <Route exact path="/" component={() => <RegisterAddressPage my_web3={this.state.my_web3}
                                                                                    contract={this.state.contract}/>}/>
                        <Route path="/confirm" component={() => <ConfirmationPage my_web3={this.state.my_web3}
                                                                                  contract={this.state.contract}/>}/>
                        <Footer/>
                    </div>
                </BrowserRouter>
            );
        }
        else if (this.state.my_web3 && !this.state.contract) {
            window.show_alert('error', 'Contract not deployed', 'PoPA contract is not deployed on this network');

            return (
                <BrowserRouter>
                    <div>
                        <Header/>
                        <div className="page container">
                            <h2>Contract is not deployed</h2>
                            PoPA contract is not deployed on this network, please switch network in metamask<br/>
                            <br/>
                        </div>
                        <Footer/>
                    </div>
                </BrowserRouter>
            );
        }
        else if (this.state.web3CheckerDur > 1000) {
            const googleChromeLink = (
                <a href={GOOGLE_CHROME_URL} target="_blank" rel="noopener noreferrer">
                    the latest version of Google Chrome
                </a>
            );

            const metaMaskLink = (
                <a href={META_MASK_URL} target="_blank" rel="noopener noreferrer">this link</a>
            );

            return (
                <BrowserRouter>
                    <div>
                        <Header/>
                        <div className="page container">
                            <h2>No MetaMask found!</h2>
                            This application requires MetaMask extension for Google Chrome.<br/>
                            <br/>
                            Please make sure you are running {googleChromeLink}<br/>
                            and follow {metaMaskLink} to install MetaMask.
                        </div>
                        <Footer/>
                    </div>
                </BrowserRouter>
            );
        }
        else {
            return (
                <BrowserRouter>
                    <div>
                        <Header/>
                        <div className="page container">
                            <h2>Loading, please wait</h2>
                        </div>
                        <Footer/>
                    </div>
                </BrowserRouter>
            );
        }
    }
}

export default App;
