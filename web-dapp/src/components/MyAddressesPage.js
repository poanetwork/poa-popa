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
            <div className="col-md-12">
                <div className="content mb-4">
                    <div className="card-item d-flex wait-to-verify mt-3 p-3">
                        <img className="image-no-verify d-flex" src={require('../assets/images/card-item/clock.png')}
                             srcSet={`
                                ${require('../assets/images/card-item/clock@2x.png')} 2x,
                                ${require('../assets/images/card-item/clock@3x.png')} 3x
                             `} className="clock" />
                            <div className="item-adress">
                                2883 Old House Drive Columbus, OH 43215, US
                            </div>
                            <div className="wrap-btn">
                                <button className="verify-btn">
                                    Verify
                                </button>
                            </div>
                            <div className="item-data">
                                23 Aptil 2018
                            </div>
                    </div>
                    <div className="card-item d-flex wait-to-verify mt-3 p-3">
                        <img className="image-no-verify d-flex" src={require('../assets/images/card-item/clock.png')}
                             srcSet={`
                                ${require('../assets/images/card-item/clock@2x.png')} 2x,
                                ${require('../assets/images/card-item/clock@3x.png')} 3x
                             `} className="clock" />
                            <div className="item-adress">
                                567 Emerson Road
                                Doyline, LA 71023
                            </div>
                            <div className="wrap-btn">
                                <button className="verify-btn">
                                    Verify
                                </button>
                            </div>
                            <div className="item-data">
                                23 Aptil 2018
                            </div>
                    </div>
                    <div className="card-item d-flex verify mt-3 p-3">
                        <img className="image-verify d-flex" src={require('../assets/images/card-item/done.png')}
                             srcSet={`
                                ${require('../assets/images/card-item/done@2x.png')} 2x,
                                ${require('../assets/images/card-item/done@3x.png')} 3x
                             `} className="done" />
                            <div className="item-adress">
                                567 Emerson Road
                                Doyline, LA 71023
                            </div>
                            <div className="item-data">
                                23 Aptil 2018
                            </div>
                    </div>
                    <div className="card-item d-flex verify mt-3 p-3">
                        <img className="image-verify d-flex" src={require('../assets/images/card-item/done.png')}
                             srcSet={`
                                ${require('../assets/images/card-item/done@2x.png')} 2x,
                                ${require('../assets/images/card-item/done@3x.png')} 3x
                             `} className="done" />
                            <div className="item-adress">
                                567 Emerson Road
                                Doyline, LA 71023
                            </div>
                            <div className="item-data">
                                23 Aptil 2018
                            </div>
                    </div>
                    <div className="card-item d-flex verify mt-3 p-3">
                        <img className="image-verify d-flex" src={require('../assets/images/card-item/done.png')}
                             srcSet={`
                                ${require('../assets/images/card-item/done@2x.png')} 2x,
                                ${require('../assets/images/card-item/done@3x.png')} 3x
                             `} className="done" />
                            <div className="item-adress">
                                567 Emerson Road
                                Doyline, LA 71023
                            </div>
                            <div className="item-data">
                                23 Aptil 2018
                            </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ConfirmationPage;
