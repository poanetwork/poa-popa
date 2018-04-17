import React from 'react';
import * as log from 'loglevel';

import {Loading} from './Loading';

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

        contract.unregisterAddress(country, state, city, location, zip, {
            gas: '1000000'
        }, (err, result) => {
            if (err) {
                logger.debug('Error calling contract.unregisterAddress:', err);
                return;
            }

            window.location.reload();
        });
    }

    render() {
        return (
            <div className='confirmation-page'>
                <section className="content address table">
                    <div className="table-cell table-cell_left">
                        <div className="my-addresses">
                            <h1 className="title">My Addresses</h1>
                            {this.state.addresses.length !== 0 ? (
                                <table>
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Country</th>
                                        <th>State</th>
                                        <th>City</th>
                                        <th>Location</th>
                                        <th>Zip</th>
                                        <th>Confirmed</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.addresses.map(({country, state, city, location, zip, confirmed}, index) => (
                                            <tr key={index}>
                                                <td>{index}</td>
                                                <td>{country}<br/></td>
                                                <td>{state}<br/></td>
                                                <td>{city}<br/></td>
                                                <td>{location}<br/></td>
                                                <td>{zip}<br/></td>
                                                <td>{confirmed ? 'yes' : 'no'}<br/></td>
                                                <td><a
                                                    href=""
                                                    onClick={(e) => this.remove(e, country, state, city, location, zip)}
                                                    title="Remove address"
                                                ><i className="fa fa-trash"></i></a></td>
                                            </tr>
                                        ))
                                    }
                                    </tbody>
                                </table>
                            ) : null}
                            {this.state.addresses.length === 0 ? (
                                <p className="description">There are no addresses registered for
                                    account <b>{this.state.wallet}</b></p>
                            ) : null}
                        </div>
                    </div>
                    <div className="table-cell table-cell_rigth">&nbsp;</div>
                </section>
                <Loading show={this.state.loading}/>
            </div>
        );
    }
}

export default ConfirmationPage;
