import React from 'react';

import * as log from 'loglevel';

import { Loading } from './Loading';

import '../assets/javascripts/show-alert.js';

const logger = log.getLogger('RegisterAddressPage');

const listOfStates = [
  { code: 'AA', label: 'U.S. Armed Forces – Americas' },
  { code: 'AE', label: 'U.S. Armed Forces – Europe' },
  { code: 'AK', label: 'Alaska' },
  { code: 'AL', label: 'Alabama' },
  { code: 'AP', label: 'U.S. Armed Forces – Pacific' },
  { code: 'AR', label: 'Arkansas' },
  { code: 'AS', label: 'American Somoa' },
  { code: 'AZ', label: 'Arizona' },
  { code: 'CA', label: 'California' },
  { code: 'CT', label: 'Connecticut' },
  { code: 'CO', label: 'Colorado' },
  { code: 'DC', label: 'District Of Columbia' },
  { code: 'DE', label: 'Delaware' },
  { code: 'FL', label: 'Florida' },
  { code: 'FM', label: 'Federated States of Micronesia' },
  { code: 'GA', label: 'Georgia' },
  { code: 'GU', label: 'Guam' },
  { code: 'HI', label: 'Hawaii' },
  { code: 'IA', label: 'Iowa' },
  { code: 'ID', label: 'Idaho' },
  { code: 'IL', label: 'Illinois' },
  { code: 'IN', label: 'Indiana' },
  { code: 'KS', label: 'Kansas' },
  { code: 'KY', label: 'Kentucky' },
  { code: 'LA', label: 'Louisiana' },
  { code: 'MA', label: 'Massachusetts' },
  { code: 'MD', label: 'Maryland' },
  { code: 'ME', label: 'Maine' },
  { code: 'MH', label: 'Marshall Islands' },
  { code: 'MI', label: 'Michigan' },
  { code: 'MN', label: 'Minnesota' },
  { code: 'MO', label: 'Missouri' },
  { code: 'MP', label: 'Northern Mariana' },
  { code: 'MS', label: 'Mississippi' },
  { code: 'MT', label: 'Montana' },
  { code: 'NC', label: 'North Carolina' },
  { code: 'ND', label: 'North Dakota' },
  { code: 'NE', label: 'Nebraska' },
  { code: 'NH', label: 'New Hampshire' },
  { code: 'NJ', label: 'New Jersey' },
  { code: 'NM', label: 'New Mexico' },
  { code: 'NV', label: 'Nevada' },
  { code: 'NY', label: 'New York' },
  { code: 'OH', label: 'Ohio' },
  { code: 'OK', label: 'Oklahoma' },
  { code: 'OR', label: 'Oregon' },
  { code: 'PA', label: 'Pennsylvania' },
  { code: 'PW', label: 'Palau' },
  { code: 'PR', label: 'Puerto Rico' },
  { code: 'RI', label: 'Rhode Island' },
  { code: 'SC', label: 'South Carolina' },
  { code: 'SD', label: 'South Dakota' },
  { code: 'TN', label: 'Tennessee' },
  { code: 'TX', label: 'Texas' },
  { code: 'UT', label: 'Utah' },
  { code: 'VA', label: 'Virginia' },
  { code: 'WA', label: 'Washington' },
  { code: 'WV', label: 'West Virginia' },
  { code: 'WY', label: 'Wyoming' },
  { code: 'WI', label: 'Wisconsin' },
  { code: 'VI', label: 'Virgin Islands' },
  { code: 'VT', label: 'Vermont' },
]

class RegisterAddressPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            country: 'US',
            state: listOfStates[0].code,
            city: '',
            address: '',
            zip: '',
            loading: false,
        };
        this.on_change = this.on_change.bind(this);
        this.check_wallet_same = this.check_wallet_same.bind(this);
        this.check_user_exists = this.check_user_exists.bind(this);
        this.check_address_exists = this.check_address_exists.bind(this);
        this.registerAddress = this.registerAddress.bind(this);
        this.order_clicked = this.order_clicked.bind(this);
    }

    componentDidMount() {
        window.mySwipe = new window.Swipe(document.getElementById('slider'), {
            startSlide: 0,
            speed: 500,
            auto: 4000,
            disableScroll: true,
            callback: function (index, elem) {
                window.$('.how-to-navigation-i')
                    .removeClass('how-to-navigation-i_active')
                    .eq(index)
                    .addClass('how-to-navigation-i_active');
            }
        });

        window.$('.how-to-navigation-i').on('click', function () {
            const index = window.$(this).index();
            window.mySwipe.slide(index);
        });

        const [wallet] = this.props.my_web3 && this.props.my_web3.eth.accounts
            ? this.props.my_web3.eth.accounts
            : [];

        if (!wallet) {
            window.show_alert('warning', 'MetaMask account', 'Please unlock your account in MetaMask and refresh the page first');
        }
    }

    on_change(event) {
        logger.debug('on_change ' + event.target.name + ': ' + event.target.value);
        this.setState({ [event.target.name]: event.target.value });
    };

    check_wallet_same(current_wallet, initial_wallet) {
        logger.debug('check_wallet current_wallet: ' + current_wallet);
        logger.debug('check_wallet initial_wallet: ' + initial_wallet);

        if (!current_wallet) {
            return 'MetaMask account should be unlocked';
        }

        if (current_wallet.trim().toLowerCase() !== initial_wallet) {
            return 'MetaMask account was switched';
        }

        return '';
    };

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
    };

    check_address_exists(opts, callback) {
        const contract = this.props.contract;
        const wsame = this.check_wallet_same(this.props.my_web3.eth.accounts[0], opts.wallet);

        if (wsame) {
            return callback(wsame);
        }

        this.check_user_exists(opts, (err, exists) => {
            if (err) {
                window.show_alert('error', 'Checking if user exists: ', [['Error', err.message]]);
                return callback(err, false);
            }

            if (!exists) {
                logger.debug('No previously registered addresses found, continue');
                return callback(null, false);
            }

            logger.debug('call contract.userAddressByAddress');
            contract.userAddressByAddress(
                opts.wallet,
                opts.params.country,
                opts.params.state,
                opts.params.city,
                opts.params.address,
                opts.params.zip,
                { from: opts.wallet }, (err, result) => {
                    if (err) {
                        logger.debug('Error calling contract.userAddressByAddress:', err);
                        return callback(err);
                    }

                    logger.debug('contract.userAddressByAddress result =', result);
                    return callback(null, result[0]);
                });
        });
    };

    registerAddress(opts, callback) {
        const contract = this.props.contract;

        logger.debug('Calling contract.registerAddress.estimateGas');
        logger.debug('opts = ' + JSON.stringify(opts));

        opts.params.priceWei = new this.props.my_web3.BigNumber(opts.params.priceWei);
        logger.debug('Price for the postcard (in wei): ' + opts.params.priceWei);
        contract.registerAddress.estimateGas(
            opts.params.name,
            opts.params.country,
            opts.params.state,
            opts.params.city,
            opts.params.address,
            opts.params.zip,
            opts.params.priceWei,
            opts.confirmationCodeSha3,
            opts.v,
            opts.r,
            opts.s,
            { from: opts.wallet, value: opts.params.priceWei }, (err, result) => {

                if (err) {
                    logger.debug('Estimate gas callback error:', err);
                    return callback(err);
                }

                const egas = result;
                logger.debug('Estimated gas: ' + egas);

                const ugas = Math.floor(1.1 * egas);
                logger.debug('Will set gas = ' + ugas);

                const wallet = this.props.my_web3 && this.props.my_web3.eth.accounts[0];
                logger.debug('Current wallet: ' + wallet);

                if (!wallet) {
                    return callback('Account locked');
                }
                if (wallet.trim().toLowerCase() !== opts.wallet) {
                    return callback('Account was switched');
                }

                logger.debug('Calling contract.registerAddress');
                contract.registerAddress(
                    opts.params.name,
                    opts.params.country,
                    opts.params.state,
                    opts.params.city,
                    opts.params.address,
                    opts.params.zip,
                    opts.params.priceWei,
                    opts.confirmationCodeSha3,
                    opts.v,
                    opts.r,
                    opts.s,
                    { from: opts.wallet, value: opts.params.priceWei, gas: ugas }, (err, txId) => {

                        if (err) {
                            logger.debug('Error calling contract.registerAddress:', err);
                            return callback(err);
                        }
                        logger.debug('contract.registerAddress, txId = ' + txId);

                        return callback(null, txId);
                    });
            });
    };

    order_clicked() {
        logger.debug('Form data:');
        logger.debug('name = ' + this.state.name);
        logger.debug('country = ' + this.state.country);
        logger.debug('state = ' + this.state.state);
        logger.debug('city = ' + this.state.city);
        logger.debug('address = ' + this.state.address);
        logger.debug('zip = ' + this.state.zip);

        const [wallet] = this.props.my_web3 && this.props.my_web3.eth.accounts
            ? this.props.my_web3.eth.accounts
            : [];

        if (!wallet) {
            window.show_alert('warning', 'MetaMask account', 'Please unlock your account in MetaMask and refresh the page first');
            return;
        }

        logger.debug('Using account ' + wallet);

        if (!this.state.name) {
            window.show_alert('warning', 'Verification', 'Please provide NAME');
            return;
        }

        if (!this.state.country) {
            window.show_alert('warning', 'Verification', 'Please provide COUNTRY');
            return;
        }

        if (!this.state.state) {
            window.show_alert('warning', 'Verification', 'Please provide STATE');
            return;
        }

        if (!this.state.city) {
            window.show_alert('warning', 'Verification', 'Please provide CITY');
            return;
        }

        if (!this.state.address) {
            window.show_alert('warning', 'Verification', 'Please provide ADDRESS');
            return;
        }

        if (!this.state.zip) {
            window.show_alert('warning', 'Verification', 'Please provide ZIP');
            return;
        }

        this.setState({ loading: true });

        window.$.ajax({
            type: 'post',
            url: './api/prepareRegTx',
            data: {
                wallet,
                name: this.state.name,
                country: this.state.country,
                state: this.state.state,
                city: this.state.city,
                address: this.state.address,
                zip: this.state.zip,
            },
            success: (res) => {
                if (!res) {
                    logger.debug('Empty response from server');
                    this.setState({ loading: false });
                    window.show_alert('error', 'Preparing register transaction', [['Error', 'Empty response from server']]);
                    return;
                }
                logger.debug(res);

                if (!res.ok) {
                    logger.debug('Error: ' + res.err);
                    this.setState({ loading: false });
                    window.show_alert('error', 'Preparing register transaction', [['Request ID', res.x_id], ['Error', res.err]]);
                    return;
                }

                if (!res.result) {
                    logger.debug('Invalid response: missing result');
                    this.setState({ loading: false });
                    window.show_alert('error', 'Preparing register transaction', [['Request ID', res.x_id], ['Error', 'Missing result field']]);
                    return;
                }

                this.check_address_exists(res.result, (err, exists) => {
                    if (err) {
                        logger.debug('Error occured in check_address_exists: ', err);
                        this.setState({ loading: false });
                        window.show_alert('error', 'Checking if address exists', [['Error', err.message]]);
                        return;
                    }
                    if (exists) {
                        logger.debug('This address already exists');
                        this.setState({ loading: false });
                        window.show_alert('error', 'Checking if address exists', 'This address is already registered under your current MetaMask account');
                        return;
                    }

                    logger.debug('calling registerAddress');
                    this.registerAddress(res.result, (err, txId) => {
                        if (err) {
                            logger.debug('Error occured in registerAddress: ', err);
                            this.setState({ loading: false });
                            window.show_alert('error', 'Register address', [['Error', err.message]]);
                        } else if (txId) {
                            logger.debug('Transaction submitted: ' + txId);
                            window.$.ajax({
                                type: 'post',
                                url: './api/notifyRegTx',
                                data: {
                                    wallet,
                                    txId,
                                    sessionKey: res.result.sessionKey
                                },
                                success: (res) => {
                                    this.setState({ loading: false });

                                    if (!res) {
                                        logger.debug('Empty response from server');
                                        window.show_alert('error', 'Postcard sending', [
                                            ['Transaction to register address was mined, but postcard was not sent'],
                                            ['Transaction ID', txId],
                                            ['Error', 'empty response from server']
                                        ]);
                                        return;
                                    }

                                    if (!res.ok) {
                                        logger.debug('Not ok response from server: ' + res.err);
                                        window.show_alert('error', 'Postcard sending', [
                                            ['Transaction to register address was mined, but postcard was not sent'],
                                            ['Request ID', res.x_id],
                                            ['Transaction ID', txId],
                                            ['Error', res.err]
                                        ]);
                                        return;
                                    }
                                    window.show_alert('success', 'Address registered!', [
                                        ['Transaction to register address was mined and postcard was sent'],
                                        ['Transaction ID', txId],
                                        ['Expected delivery date', res.result.expected_delivery_date],
                                        ['Mail type', res.result.mail_type]
                                    ]);
                                },
                                error: ({ statusText, status }) => {
                                    logger.debug('Server returned error on notifyRegTx: ' + statusText + ' (' + status + ')');
                                    this.setState({ loading: false });
                                    window.show_alert('error', 'Postcard sending', [['Server error', statusText + ' (' + status + ')']]);
                                }
                            });
                        } else {
                            logger.debug('JSON RPC unexpected response: err is empty but txId is also empty');
                            this.setState({ loading: false });
                            window.show_alert('error', 'Register address', 'Error is empty but txId is also empty!');
                        }
                    });
                });
            },
            error: ({ responseJSON, statusText, status }) => {
                logger.debug('Server returned error on prepareRegTx: ' + statusText + ' (' + status + ')');
                this.setState({ loading: false });
                const errorBody = [
                    ['Server error', statusText + ' (' + status + ')']
                ];
                if (responseJSON && responseJSON.err) {
                    errorBody.push([responseJSON.err]);
                }
                window.show_alert('error', 'Preparing register transaction', errorBody);
            }
        });
    };

    render() {
        return (
            <div className="col-md-12">
                <div className="content">
                    <form id="registerForm">
                        <div className="form-group">
                            <label>Name</label>
                            <div className="info"><img className="svg-info" src={require('../assets/images/info.svg')} alt="info" />
                                <div className="hidden-info">Enter your full name</div>
                            </div>
                            <input type="text" className="form-control" placeholder="Enter your full name" name="name" value={this.state.name}
                                   onChange={this.on_change} />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <div className="info"><img className="svg-info" src={require('../assets/images/info.svg')} alt="info" />
                                <div className="hidden-info">Enter your full address</div>
                            </div>
                            <input type="text" className="form-control" placeholder="Enter your full address" name="address" value={this.state.address}
                                   onChange={this.on_change} />
                        </div>
                        <div className="form-group row">
                            <div className="col-md-6 mb-xs-4 mb-sm-4 mb-md-0">
                                <label>City</label>
                                <div className="info"><img className="svg-info" src={require('../assets/images/info.svg')} alt="info" />
                                    <div className="hidden-info">Enter the name of the city</div>
                                </div>
                                <input type="text" className="form-control" placeholder="Enter the city" name="city" value={this.state.city}
                                       onChange={this.on_change} />
                            </div>
                            <div className="col-md-6">
                                <label>State</label>
                                <div className="info"><img className="svg-info" src={require('../assets/images/info.svg')} alt="info" />
                                    <div className="hidden-info">Select one of the states from the dropdown list</div>
                                </div>
                                <select className="form-control" name="state" value={this.state.state} onChange={this.on_change}>
                                    {
                                        listOfStates.map((state, index) => (
                                            <option value={state.code} key={index}>{state.label}</option>
                                        ))
                                    }
                                </select>
                                <p className="help-block">Select one of the states from the dropdown list</p>
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="col-md-6 mb-xs-4 mb-sm-4 mb-md-0">
                                <label>Zip</label>
                                <div className="info"><img className="svg-info" src={require('../assets/images/info.svg')} alt="info" />
                                    <div className="hidden-info">Enter ZIP code</div>
                                </div>
                                <input type="text" className="form-control" placeholder="Enter ZIP code"  name="zip" value={this.state.zip}
                                       onChange={this.on_change} />
                            </div>
                            <div className="col-md-6">
                                <label>Country</label>
                                <div className="info"><img className="svg-info" src={require('../assets/images/info.svg')} alt="info" />
                                    <div className="hidden-info">At the present moment address verification is available only in the United States.</div>
                                </div>
                                <input type="text" className="form-control" placeholder="Enter the country" name="country" value={this.state.country}
                                       onChange={this.on_change} />
                                <p className="help-block">At the present moment address verification is available only in the United States.</p>
                            </div>
                        </div>
                        <a href="/" className="primary-btn mt-3">
                            Back
                            <img className="btn-arrow" src={require('../assets/images/back.svg')} alt="arrow" />
                        </a>
                        <button id="sendMessageButton" type="button" className="action-btn mt-3" onClick={this.order_clicked}>
                            Order
                            <img className="btn-arrow" src={require('../assets/images/arrow.svg')} alt="arrow" />
                        </button>
                    </form>
                    <div className="small-c-copy"><strong>0.04 ETH</strong> This is the price we charge for sending a postcard to you</div>
                </div>
                <Loading show={this.state.loading}/>
            </div>
        );
    }
}

export default RegisterAddressPage;
