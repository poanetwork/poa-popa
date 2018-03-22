import React from 'react';
import * as log from 'loglevel';

import { Loading } from './Loading';

import '../assets/stylesheets/application.css';
import '../assets/javascripts/show-alert.js';

const logger = log.getLogger('ConfirmationPage');

class ConfirmationPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmationCodePlain: '',
            confirmed_class: '',
            loading: false,
        };
        this.on_change = this.on_change.bind(this);
        this.check_wallet_same = this.check_wallet_same.bind(this);
        this.check_user_exists = this.check_user_exists.bind(this);
        this.find_address = this.find_address.bind(this);
        this.confirmAddress = this.confirmAddress.bind(this);
        this.confirm_clicked = this.confirm_clicked.bind(this);
    }

    componentDidMount() {
        logger.debug('ConfirmationPage.componentDidMount');

        const [wallet] = this.props.my_web3 && this.props.my_web3.eth.accounts
            ? this.props.my_web3.eth.accounts
            : [];

        if (!wallet) {
            window.show_alert('warning', 'MetaMask account', 'Please unlock your account in MetaMask and refresh the page first');
        }
    }

    on_change(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    check_wallet_same(currentWallet, initialWallet) {
        logger.debug('check_wallet_same, currentWallet: ' + currentWallet);
        logger.debug('check_wallet_same, initialWallet: ' + initialWallet);

        if (!currentWallet) {
            return 'MetaMask account should be unlocked';
        }

        if (currentWallet.trim().toLowerCase() !== initialWallet) {
            return 'MetaMask account was switched';
        }

        return '';
    }

    check_user_exists(opts, callback) {
        const contract = this.props.contract;
        const wsame = this.check_wallet_same(this.props.my_web3.eth.accounts[0], opts.wallet);

        if (wsame) {
            return callback(wsame);
        }

        logger.debug('calling contract.check_user_exists');

        contract.userExists(opts.wallet, { from: opts.wallet }, (err, result) => {
            if (err) {
                logger.debug('Error calling contract.check_user_exists:', err);
                return callback(err);
            }

            logger.debug('contract.check_user_exists result =', result);
            return callback(null, result);
        });
    }

    find_address(opts, callback) {
        const contract = this.props.contract;
        const wsame = this.check_wallet_same(this.props.my_web3.eth.accounts[0], opts.wallet);
        if (wsame) return callback(wsame);

        logger.debug('calling contract.userAddressByConfirmationCode');

        contract.userAddressByConfirmationCode(opts.wallet, this.props.my_web3.sha3(opts.params.confirmationCodePlain), (err, result) => {
            if (err) {
                logger.debug('Error calling contract.userAddressByConfirmationCode:', err);
                return callback(err);
            }

            logger.debug('contract.userAddressByConfirmationCode result =', result);
            const addressDetails = {};
            addressDetails.found = result[0];
            addressDetails.confirmed = result[2];
            if (!addressDetails.found) {
                return callback(null, addressDetails);
            }

            // TODO: check wallet here + handle possible errors
            logger.debug('calling contract.userAddress');
            contract.userAddress(opts.wallet, result[1], (err, result) => {
                if (err) {
                    logger.debug('Error calling contract.userAddress:', err);
                    return callback(err);
                }
                logger.debug('***** RESULT=', result);
                addressDetails.country = result[0];
                addressDetails.state = result[1];
                addressDetails.city = result[2];
                addressDetails.address = result[3];
                addressDetails.zip = result[4];
                return callback(null, addressDetails);
            });
        });
    }

    confirmAddress(opts, callback) {
        const contract = this.props.contract;

        contract.confirmAddress.estimateGas(opts.params.confirmationCodePlain, opts.v, opts.r, opts.s, { from: opts.wallet }, (err, result) => {
            if (err) {
                logger.debug('Estimate gas callback error:', err);
                return callback(err);
            }

            const egas = result;
            logger.debug('Estimated gas: ' + egas);
            const ugas = Math.floor(1.1 * egas);
            logger.debug('Will set gas = ' + ugas);

            const wsame = this.check_wallet_same(this.props.my_web3.eth.accounts[0], opts.wallet);

            if (wsame) {
                return callback(wsame);
            }

            logger.debug('calling contract.confirmAddress');

            contract.confirmAddress(opts.params.confirmationCodePlain, opts.v, opts.r, opts.s, {
                from: opts.wallet,
                gas: ugas
            }, (err, txId) => {
                if (err) {
                    logger.debug('Error calling contract.confirmAddress:', err);
                    return callback(err);
                }
                logger.debug('txId = ' + txId);

                return callback(null, txId);
            });
        });
    }

    confirm_clicked() {
        const confirmationCodePlain = this.state.confirmationCodePlain.trim();

        if (!confirmationCodePlain) {
            window.show_alert('warning', 'Verification', 'Please enter the confirmation code first');
            return;
        }

        const [wallet] = this.props.my_web3 && this.props.my_web3.eth.accounts
            ? this.props.my_web3.eth.accounts
            : [];

        if (!wallet) {
            window.show_alert('warning', 'MetaMask account', 'Please unlock your account in MetaMask and refresh the page first');
            return;
        }

        this.setState({ loading: true });

        logger.debug('Using account ' + wallet);

        this.check_user_exists({ wallet }, (err, exists) => {
            if (err) {
                this.setState({ loading: false });
                window.show_alert('error', 'Checking if user exists', [['Error', err.message]]);
                return;
            }

            if (!exists) {
                this.setState({ loading: false });
                window.show_alert('warning', 'Checking if user exists', 'There are no addresses registered under your current MetaMask account');
                return;
            }

            window.$.ajax({
                type: 'post',
                url: './api/prepareConTx',
                data: {
                    wallet,
                    confirmationCodePlain: this.state.confirmationCodePlain
                },
                success: (res) => {
                    if (!res) {
                        logger.debug('Empty response from server');
                        this.setState({ loading: false });
                        window.show_alert('error', 'Preparing confirmation transaction', [['Error', 'Empty response from server']]);
                        return;
                    }
                    logger.debug(res);

                    if (!res.ok) {
                        logger.debug('Error: ' + res.err);
                        this.setState({ loading: false });
                        window.show_alert('error', 'Preparing confirmation transaction', [['RequestID', res.x_id], ['Error', res.err]]);
                        return;
                    }

                    if (!res.result) {
                        logger.debug('Invalid response: missing result');
                        this.setState({ loading: false });
                        window.show_alert('error', 'Preparing confirmation transaction', [['RequestID', res.x_id], ['Error', 'Missing result field']]);
                        return;
                    }

                    logger.debug('calling find_address');

                    this.find_address(res.result, (err, address_details) => {
                        if (err) {
                            logger.debug('Error occured in find_address: ', err);
                            this.setState({ loading: false });
                            window.show_alert('error', 'Finding address to confirm', [['Error', err.message]]);
                            return;
                        }

                        if (!address_details.found) {
                            this.setState({
                                loading: false,
                                confirmed_class: 'postcard-form_error'
                            });
                            window.show_alert('error', 'Finding address to confirm', [
                                ['This confirmation code does not correspond to any of your registered addresses.'],
                                ['Please double check confirmation code and account selected in MetaMask']
                            ]);
                            return;
                        }

                        if (address_details.confirmed) {
                            this.setState({ loading: false });
                            window.show_alert('warning', 'Finding address to confirm', [
                                ['This confirmation code corresponds to address that is already confirmed'],
                                ['Country', address_details.country.toUpperCase()],
                                ['State', address_details.state.toUpperCase()],
                                ['City', address_details.city.toUpperCase()],
                                ['Address', address_details.address.toUpperCase()],
                                ['ZIP code', address_details.zip.toUpperCase()]
                            ]);
                            return;
                        }

                        logger.debug('calling confirmAddress');

                        this.confirmAddress(res.result, (err, txId) => {
                            this.setState({ loading: false });

                            if (err) {
                                logger.debug('Error occured in confirmAddress: ', err);
                                window.show_alert('error', 'Confirming address', [['Error', err.message]]);
                            } else if (txId) {
                                logger.debug('Transaction submitted: ' + txId);
                                window.show_alert('success', 'Address confirmed!', [
                                    ['Transaction to confirm address was submitted'],
                                    ['Transaction ID', txId],
                                    ['Country', address_details.country.toUpperCase()],
                                    ['State', address_details.state.toUpperCase()],
                                    ['City', address_details.city.toUpperCase()],
                                    ['Address', address_details.address.toUpperCase()],
                                    ['ZIP code', address_details.zip.toUpperCase()]
                                ]);
                            } else {
                                logger.debug('JSON RPC unexpected response: err is empty but txId is also empty');
                                window.show_alert('error', 'Confirming address', 'Error is empty but txId is also empty');
                            }
                        });
                    });
                },
                error: ({ statusText, status }) => {
                    logger.debug('Server returned error: ' + statusText + ' (' + status + ')');
                    this.setState({ loading: false });
                    window.show_alert('error', 'Preparing confirmation transaction', [['Error', statusText + ' (' + status + ')']]);
                }
            });
        });
    }

    render() {
        return (
            <div className='confirmation-page'>
                <section className="content postcard-container table">
                    <div className="table-cell">
                        <div className="postcard-inner">
                            <div className="postcard">
                                <p className="postcard-title">Enter your unique code here:</p>
                                <form action="" className="postcard-form">
                                    <input
                                        className={'postcard-input ' + this.state.confirmed_class}
                                        type="text"
                                        name="confirmationCodePlain"
                                        value={this.state.confirmationCodePlain}
                                        onChange={this.on_change}
                                    />
                                    <button type="button" className="postcard-button" onClick={this.confirm_clicked}/>
                                </form>
                                <p>
                                    Type code from the postcard. Letter case is irrelevant.
                                </p>
                            </div>
                            <h1 className="title">Verify your address</h1>
                            <p className="description">
                                Enter confirmation code from the postcard you received, sign the transaction and
                                finalize the verification process.
                            </p>
                        </div>
                    </div>
                </section>
                <Loading show={this.state.loading}/>
            </div>
        );
    }
}

export default ConfirmationPage;
