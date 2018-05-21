import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import * as log from 'loglevel';

import Header from './Header';
import Footer from './Footer';
import RegisterAddressPage from './RegisterAddressPage';
import ConfirmationPage from './ConfirmationPage';
import MyAddressesPage from './MyAddressesPage';

import '../assets/javascripts/init-my-web3.js';
import '../assets/javascripts/show-alert.js';
import IndexPage from "./IndexPage";

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

            const popaContract = require('../ProofOfPhysicalAddress.json')

            const cconf = {
              address: process.env.REACT_APP_POPA_CONTRACT_ADDRESS,
              abi: popaContract.abi
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
                    <div className="container-fluid">
                        <div className="row">
                            <div className="sidebar d-sm-none d-md-block">
                                <div className="image"></div>
                            </div>
                            <div className="offset-md-5 offset-lg-6 offset-xl-6 col-md-7 col-lg-6 col-lg-5 col-xl-5">
                                <div className="row">
                                    <Header/>
                                    <Route exact path="/" component={() => <IndexPage />}/>
                                    <Route path="/register" component={() => <RegisterAddressPage my_web3={this.state.my_web3}
                                                                                                contract={this.state.contract}/>}/>
                                    <Route path="/confirm" component={() => <ConfirmationPage my_web3={this.state.my_web3}
                                                                                              contract={this.state.contract}/>}/>
                                    <Route path="/my-addresses" component={() => <MyAddressesPage my_web3={this.state.my_web3}
                                                                                              contract={this.state.contract}/>}/>
                                    <Footer/>
                                </div>
                            </div>
                        </div>
                    </div>
                </BrowserRouter>
            );
        }
        else if (this.state.my_web3 && !this.state.contract) {
            return (
                <BrowserRouter>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="sidebar d-sm-none d-md-block">
                                <div className="image"></div>
                            </div>
                            <div className="offset-md-5 offset-lg-6 offset-xl-6 col-md-7 col-lg-6 col-lg-5 col-xl-5">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="content-preloader d-flex">
                                            <div className="wrap-mask">
                                                <div className="mask-img">
                                                    <img src={require('../assets/images/warning.svg')} alt="companyName" />
                                                </div>
                                                <div className="title-mask">
                                                    Contract is not deployed
                                                </div>
                                                <div className="text-mask">
                                                    PoPA contract is not deployed on this network, please switch network in metamask
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </BrowserRouter>
            );
        }
        else if (this.state.web3CheckerDur > 1000) {
            return (
                <BrowserRouter>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="sidebar d-sm-none d-md-block">
                                <div className="image"></div>
                            </div>
                            <div className="offset-md-5 offset-lg-6 offset-xl-6 col-md-7 col-lg-6 col-lg-5 col-xl-5">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="content-preloader d-flex">
                                            <div className="wrap-mask">
                                                <div className="mask-img">
                                                    <img src={require('../assets/images/warning.svg')} alt="companyName" />
                                                </div>
                                                <div className="title-mask">
                                                    No MetaMask found
                                                </div>
                                                <div className="text-mask">
                                                    This application requires MetaMask extension for Google Chrome.
                                                    Please make sure you are running the <a href={GOOGLE_CHROME_URL} target="_blank" rel="noopener noreferrer">latest version of
                                                    Google Chrome</a> and follow this <a href={META_MASK_URL} target="_blank" rel="noopener noreferrer">link</a> to install
                                                    MetaMask.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </BrowserRouter>
            );
        }
        else {
            return (
                <BrowserRouter>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="sidebar d-sm-none d-md-none d-md-block">
                                <div className="image"></div>
                            </div>
                            <div className="offset-md-5 offset-lg-6 offset-xl-6 col-md-7 col-lg-6 col-lg-5 col-xl-5">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="content-preloader d-flex">
                                            <div className="l-preload">
                                                <img src={require('../assets/images/logo/logo-top-2.svg')} alt="companyName" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </BrowserRouter>
            );
        }
    }
}

export default App;
