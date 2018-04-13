import React from 'react';
import * as log from 'loglevel';

import { Loading } from './Loading';

import '../assets/stylesheets/application.css';
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

        this.setState({ wallet })

        if (!wallet) {
            window.show_alert('warning', 'MetaMask account', 'Please unlock your account in MetaMask and refresh the page first');
        }

        this.getTotalUserAddresses(wallet, (err, result) => {
            const totalAddresses = parseInt(result.toFixed())
            this.setState({ totalAddresses })

            const whenAddresses = range(totalAddresses).map((index) => {
                return this.getAddress(wallet, index)
            })

            Promise.all(whenAddresses).then(addresses => {
                this.setState({ addresses })
            })
        })
    }

    getTotalUserAddresses = (wallet, callback) => {
        const contract = this.props.contract;

        logger.debug('calling contract.userAddressesCount');
        contract.userAddressesCount(wallet, (err, result) => {
            if (err) {
                logger.debug('Error calling contract.userAddressesCount:', err);
                return callback(err);
            }

            logger.debug('contract.userAddressesCount result =', result.toFixed());
            return callback(null, result);
        });
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
                <section>
                    <div>
                        <h2>My Addresses</h2>
                        <ul>
                            {
                                this.state.addresses.map(([country, state, city, location, zip], index) => (
                                  <li key={index}>
                                    Country: { country }<br/>
                                    State: { state }<br/>
                                    City: { city }<br/>
                                    Location: { location }<br/>
                                    Zip: { zip }<br/>
                                    <a
                                        href=""
                                        onClick={(e) => this.remove(e, country, state, city, location, zip)}
                                    >
                                        (Remove)
                                    </a>
                                  </li>
                                ))
                            }
                        </ul>
                        { this.state.addresses.length === 0 ? (
                            <p>There are no addresses registered for account <b>{this.state.wallet}</b></p>
                        ) : null }
                    </div>
                </section>
                <Loading show={this.state.loading}/>
            </div>
        );
    }
}

export default ConfirmationPage;
