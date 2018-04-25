import React from 'react';
import * as log from 'loglevel';

import {Loading} from './Loading';
import waitForTransaction from '../waitForTransaction';

import '../assets/javascripts/show-alert.js';

const logger = log.getLogger('ConfirmationPage');

const range = n => [...Array(n)].map((x, i) => i)

class ConfirmationPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            totalAddresses: 0,
            addresses: [],
            wallet: ''
        };
    }

    componentDidMount() {
        logger.debug('MyAddressPage.componentDidMount');

        const [wallet] = this.props.my_web3 && this.props.my_web3.eth.accounts
            ? this.props.my_web3.eth.accounts
            : [];

        this.setState({wallet})

        if (!wallet) {
            return window.show_alert('warning', 'MetaMask account', 'Please unlock your account in MetaMask and refresh the page first');
        }

        this.getTotalUserAddresses(wallet)
            .then((result) => {
                const totalAddresses = parseInt(result.toFixed())
                this.setState({totalAddresses})

                const whenAddresses = range(totalAddresses).map((index) => {
                    const whenAddressInfo = this.getAddress(wallet, index)
                        .then(([country, state, city, location, zip]) => {
                            return {
                                country, state, city, location, zip
                            }
                        })
                    const whenAddressConfirmed = this.isAddressConfirmed(wallet, index)

                    return Promise.all([whenAddressInfo, whenAddressConfirmed])
                        .then(([addressInfo, addressConfirmed]) => {
                            return {
                                ...addressInfo,
                                confirmed: addressConfirmed
                            }
                        })
                })

                Promise.all(whenAddresses).then(addresses => {
                    this.setState({addresses})
                })
            })
    }

    getTotalUserAddresses = (wallet) => {
        const contract = this.props.contract;

        return new Promise((resolve, reject) => {
            contract.userSubmittedAddressesCount(wallet, (err, result) => {
                if (err) {
                    return reject(err);
                }

                return resolve(result);
            });
        })
    }

    getAddress = (wallet, index) => {
        const contract = this.props.contract;

        return new Promise((resolve, reject) => {
            contract.userAddress(wallet, index, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        })
    }

    isAddressConfirmed = (wallet, index) => {
        const contract = this.props.contract;

        return new Promise((resolve, reject) => {
            contract.userAddressConfirmed(wallet, index, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        })
    }

    remove = (e, country, state, city, location, zip) => {
        e.preventDefault();

        const contract = this.props.contract;

        this.setState({ loading: true })
        contract.unregisterAddress(country, state, city, location, zip, {
            gas: '1000000'
        }, (err, txId) => {
            if (err) {
                logger.debug('Error calling contract.unregisterAddress:', err);
                return;
            }

            waitForTransaction(this.props.my_web3, txId)
                .then(() => {
                    window.location.reload();
                })
                .catch((e) => {
                    logger.error('Error waiting for transaction: ', e);
                    this.setState({ loading: false });
                });
        });
    }

    render() {
        return (
            <div className='my-addresses'>
                <section className="content address table">
                    <div className="table-cell">
                        <div className="container">
                            <h1 className="title">My Addresses</h1>
                        </div>
                        {this.state.addresses.length !== 0 ? (
                            <div className="wrapper">
                                {
                                    this.state.addresses.map(({country, state, city, location, zip, confirmed}, index) => (
                                    <div className="box">
                                        <p className="description">
                                            <strong>Country:</strong> {country} <br/>
                                            <strong>State:</strong> {state} <br/>
                                            <strong>City:</strong> {city} <br/>
                                            <strong>Locations:</strong> {location} <br/>
                                            <strong>Zip:</strong> {zip} <br/>
                                            <strong>Confirmed?:</strong> {confirmed ? 'yes' : 'no'} <br/>
                                            <a href="" className="remove-button" onClick={(e) => this.remove(e, country, state, city, location, zip)} title="Remove address">
                                                <i className="fa fa-trash"></i>
                                            </a>
                                        </p>
                                    </div>
                                    ))
                                }
                            </div>
                        ) : null}
                        {this.state.addresses.length === 0 ? (
                            <p className="description">There are no addresses registered for
                                account <b>{this.state.wallet}</b></p>
                        ) : null}
                    </div>
                </section>
                <Loading show={this.state.loading}/>
            </div>
        );
    }
}

export default ConfirmationPage;
