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
            totalAddresses: 0,
            addresses: []
        };
        this.get_total_user_addresses = this.get_total_user_addresses.bind(this);
        this.get_addresses = this.get_addresses.bind(this);
    }

    componentDidMount() {
        logger.debug('MyAddressPage.componentDidMount');

        const [wallet] = this.props.my_web3 && this.props.my_web3.eth.accounts
            ? this.props.my_web3.eth.accounts
            : [];

        if (!wallet) {
            window.show_alert('warning', 'MetaMask account', 'Please unlock your account in MetaMask and refresh the page first');
        }
        
        this.get_total_user_addresses({wallet}, (err, result) => {
            this.state.totalAddresses = parseInt(result.toFixed());
            let addresses = [];
            for (let i=0; i<this.state.totalAddresses; i++) {
                this.get_addresses({wallet, index: i}, (err, result) => {
                    addresses.push(result);
                })
            }
            this.state.addresses = addresses;
        })
    }

    get_total_user_addresses(opts, callback) {
        const contract = this.props.contract;

        logger.debug('calling contract.userAddressesCount');
        contract.userAddressesCount(opts.wallet, (err, result) => {
            if (err) {
                logger.debug('Error calling contract.userAddressesCount:', err);
                return callback(err);
            }

            logger.debug('contract.userAddressesCount result =', result.toFixed());
            return callback(null, result);
        });
    }

  get_addresses(opts, callback) {
    const contract = this.props.contract;

    logger.debug('calling contract.userAddress');
    contract.userAddress(opts.wallet, opts.index, (err, result) => {
      if (err) {
        logger.debug('Error calling contract.userAddress:', err);
        return callback(err);
      }

      logger.debug('contract.userAddress result =', result);
      return callback(null, result);
    });
  }

    render() {
        return (
            <div className='confirmation-page'>
                <section className="content postcard-container table">
                    <div className="table-cell table-cell_left">
                        <h2>My Addresses</h2>
                        <ul>
                            {
                                this.state.addresses.map((address, index) => (
                                  <li key={index}>{address}</li>
                                ))
                            }
                        </ul>
                    </div>
                </section>
                <Loading show={this.state.loading}/>
            </div>
        );
    }
}

export default ConfirmationPage;