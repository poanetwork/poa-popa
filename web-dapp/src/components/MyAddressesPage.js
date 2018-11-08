import React from 'react';
import { Link } from 'react-router-dom';

import * as log from 'loglevel';

import BackButton from './BackButton';
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
            <div className="col-md-12 my-addresses">
                <div className="content">
                    <h1 className="main-title">Manage your addresses</h1>
                    {this.state.addresses.length !== 0 ? (
                    <div className="mb-4">
                        { this.state.addresses.map(({country, state, city, location, zip, confirmed}, index) => (
                                <div className="card-item d-flex wait-to-verify mt-3 p-3 address" key={index}>
                                    <img className={confirmed ? 'image-verify d-flex done' : 'image-no-verify d-flex clock'} src={require('../assets/images/card-item/clock.png')}
                                         srcSet={confirmed ? `
                                            ${require('../assets/images/card-item/done@2x.png')} 2x,
                                            ${require('../assets/images/card-item/done@3x.png')} 3x
                                         ` : `
                                            ${require('../assets/images/card-item/clock@2x.png')} 2x,
                                            ${require('../assets/images/card-item/clock@3x.png')} 3x
                                         `} alt={confirmed ? 'Verified' : 'Registered'} />
                                    <div className="item-adress">
                                        <div>{location}, {zip}, {city}, {state}, {country}</div>
                                    </div>
                                    { !confirmed ? null : (
                                      <div className="wrap-btn">
                                        <Link to={`/add-claim-to-identity/${index}`} title="Add claim to identity">
                                          <i className="fa fa-id-card-o" />
                                        </Link>
                                      </div>
                                    ) }
                                    <div className="wrap-btn">
                                        <a href="" className="remove-button" onClick={(e) => this.remove(e, country, state, city, location, zip)} title="Remove address">
                                            <i className="remove-button__icon" />
                                        </a>
                                    </div>
                                </div>
                            )) }
                    </div>
                ) : null}
                {this.state.addresses.length === 0 ? (
                    <div className="mb-4">
                        <p>There are no addresses registered for account <b>{this.state.wallet}</b></p>
                    </div>
                ) : null}
                    <BackButton />
                </div>
            </div>
        );
    }
}

export default ConfirmationPage;
