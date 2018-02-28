import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Header from './Header';
import Footer from './Footer';
import RegisterAddressPage from './RegisterAddressPage';
import ConfirmationPage from './ConfirmationPage';

import ContractOutput from '../contract-output';

import '../assets/javascripts/init-my-web3.js';
import '../assets/javascripts/show-alert.js';

const WEB3_CHECKER_INTERV_MS = 500;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            my_web3: null,
            web3_checker: null,
            web3_checker_dur: 0,
            contract: null,
        };
        this.check_web3 = this.check_web3.bind(this);
        this.check_contract = this.check_contract.bind(this);
    }

    check_contract(cconf, callback) {
        console.log('checking contract');
        var contract = window.my_web3.eth.contract(cconf.abi).at(cconf.address);
        window.megaContract = contract;

        window.my_web3.eth.getCode(cconf.address, function (err, code) {
            if (err) {
                console.log('error fetching code from address: ' + cconf.address + ', err: ' + err);
                return callback();
            }

            // code here starts with 0x prefix in contrast with cconf.bytecode
            if (code.length <= 2) {
                console.log('code at address: ' + cconf.address + ' is empty: ' + code);
                return callback();
            }

            contract.owner(function (err, owner) {
                if (err) {
                    console.log('error fetching owner: ' + err);
                    return callback();
                }

                if (!owner || owner.length <= 2) {
                    console.log('owner is empty: ' + owner);
                    return callback();
                }

                return callback( contract );
            });
        });
    }

    check_web3() {
        console.log('check_web3');
        if (window.my_web3) {
            console.log('web3 found, getting contract');
            clearInterval(this.state.web3_checker);
            var cconf = ContractOutput.ProofOfPhysicalAddress;
            this.check_contract(cconf, (contract) => {
                if (contract) {
                    console.log('contract is ok, saving to state');
                    this.setState({
                        contract: contract,
                        my_web3: window.my_web3,
                        web3_checker: null,
                        web3_checker_dur: 0,
                    });
                }
                else {
                    console.log('contract is not ok');
                    this.setState({
                        contract: null,
                        my_web3: window.my_web3,
                        web3_checker: null,
                        web3_checker_dur: 0,
                    });
                }
            });
        }
        else {
            this.setState((prevState, props) => { prevState.web3_checker_dur += WEB3_CHECKER_INTERV_MS }, () => {
                console.log('no web3 yet, web3_checker_dur = ' + this.state.web3_checker_dur);
            });
        }
    }

    componentDidMount() {
        console.log('App.componentDidMount');
        if (!this.state.web3_checker) {
            console.log('Starting web3_checker');
            this.setState({ web3_checker: setInterval(this.check_web3, WEB3_CHECKER_INTERV_MS) });
        }
    }

    render() {
        if (this.state.my_web3 && this.state.contract) {
            return (
                <BrowserRouter>
                <div>
                    <Header/>
                    <Route exact path="/" component={() => <RegisterAddressPage my_web3={this.state.my_web3} contract={this.state.contract}/> } />
                    <Route path="/confirm" component={() => <ConfirmationPage my_web3={this.state.my_web3} contract={this.state.contract}/> } />
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
                    <h2>Contract is not deployed</h2>
                    PoPA contract is not deployed on this network, please switch network in metamask<br/>
                    <br/>
                <Footer/>
                </div>
                </BrowserRouter>
            );
        }
        else if (this.state.web3_checker_dur > 1000) {
            return (
                <BrowserRouter>
                <div>
                <Header/>
                    <h2>No MetaMask found!</h2>
                    This application requires MetaMask extension for Google Chrome.<br/>
                    <br/>
                    Please make sure you are running <a href="https://www.google.com/chrome/browser" target="_blank" rel="noopener noreferrer">the latest version of Google Chrome</a><br/>
                    and follow <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn" target="_blank" rel="noopener noreferrer">this link</a> to install MetaMask.
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
                    <h2>Loading, please wait</h2>
                <Footer/>
                </div>
                </BrowserRouter>
            );
        }
    }
};

export default App;
