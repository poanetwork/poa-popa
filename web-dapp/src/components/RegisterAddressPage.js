import React from 'react';
import * as log from 'loglevel';

import { Loading } from './Loading';

import '../assets/javascripts/show-alert.js';

const logger = log.getLogger('RegisterAddressPage');

class RegisterAddressPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            country: 'US',
            state: '',
            city: '',
            address: '',
            zip: '',
            loading: false,
        };
        this.on_change = this.on_change.bind(this);
        this.check_wallet_same = this.check_wallet_same.bind(this);
        this.check_user_exists = this.check_user_exists.bind(this);
        this.check_address_exists = this.check_address_exists.bind(this);
        this.register_address = this.register_address.bind(this);
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

        contract.user_exists(opts.wallet, { from: opts.wallet }, (err, result) => {
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

            logger.debug('call contract.user_address_by_address');
            contract.user_address_by_address(
                opts.wallet,
                opts.params.country,
                opts.params.state,
                opts.params.city,
                opts.params.address,
                opts.params.zip,
                { from: opts.wallet }, (err, result) => {
                    if (err) {
                        logger.debug('Error calling contract.user_address_by_address:', err);
                        return callback(err);
                    }

                    logger.debug('contract.user_address_by_address result =', result);
                    return callback(null, result[0]);
                });
        });
    };

    register_address(opts, callback) {
        const contract = this.props.contract;

        logger.debug('Calling contract.register_address.estimateGas');
        logger.debug('opts = ' + JSON.stringify(opts));

        opts.params.price_wei = new this.props.my_web3.BigNumber(opts.params.price_wei);
        logger.debug('Price for the postcard (in wei): ' + opts.params.price_wei);
        contract.register_address.estimateGas(
            opts.params.name,
            opts.params.country,
            opts.params.state,
            opts.params.city,
            opts.params.address,
            opts.params.zip,
            opts.params.price_wei,
            opts.confirmation_code_sha3,
            opts.v,
            opts.r,
            opts.s,
            { from: opts.wallet, value: opts.params.price_wei }, (err, result) => {

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

                logger.debug('Calling contract.register_address');
                contract.register_address(
                    opts.params.name,
                    opts.params.country,
                    opts.params.state,
                    opts.params.city,
                    opts.params.address,
                    opts.params.zip,
                    opts.params.price_wei,
                    opts.confirmation_code_sha3,
                    opts.v,
                    opts.r,
                    opts.s,
                    { from: opts.wallet, value: opts.params.price_wei, gas: ugas }, (err, tx_id) => {

                        if (err) {
                            logger.debug('Error calling contract.register_address:', err);
                            return callback(err);
                        }
                        logger.debug('contract.register_address, tx_id = ' + tx_id);

                        return callback(null, tx_id);
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
                wallet: wallet,
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

                    logger.debug('calling register_address');
                    this.register_address(res.result, (err, tx_id) => {
                        if (err) {
                            logger.debug('Error occured in register_address: ', err);
                            this.setState({ loading: false });
                            window.show_alert('error', 'Register address', [['Error', err.message]]);
                        } else if (tx_id) {
                            logger.debug('Transaction mined: ' + tx_id);
                            window.$.ajax({
                                type: 'post',
                                url: './api/notifyRegTx',
                                data: {
                                    wallet: wallet,
                                    tx_id: tx_id,
                                    session_key: res.result.session_key
                                },
                                success: (res) => {
                                    this.setState({ loading: false });

                                    if (!res) {
                                        logger.debug('Empty response from server');
                                        window.show_alert('error', 'Postcard sending', [
                                            ['Transaction to register address was mined, but postcard was not sent'],
                                            ['Transaction ID', tx_id],
                                            ['Error', 'empty response from server']
                                        ]);
                                        return;
                                    }

                                    if (!res.ok) {
                                        logger.debug('Not ok response from server: ' + res.err);
                                        window.show_alert('error', 'Postcard sending', [
                                            ['Transaction to register address was mined, but postcard was not sent'],
                                            ['Request ID', res.x_id],
                                            ['Transaction ID', tx_id],
                                            ['Error', res.err]
                                        ]);
                                        return;
                                    }
                                    window.show_alert('success', 'Address registered!', [
                                        ['Transaction to register address was mined and postcard was sent'],
                                        ['Transaction ID', tx_id],
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
                            logger.debug('JSON RPC unexpected response: err is empty but tx_id is also empty');
                            this.setState({ loading: false });
                            window.show_alert('error', 'Register address', 'Error is empty but tx_id is also empty!');
                        }
                    });
                });
            },
            error: ({ statusText, status }) => {
                logger.debug('Server returned error on prepareRegTx: ' + statusText + ' (' + status + ')');
                this.setState({ loading: false });
                window.show_alert('error', 'Preparing register transaction', [['Server error', statusText + ' (' + status + ')']]);
            }
        });
    };

    render() {
        return (
            <div className='register-address-page'>
                <section className="content address table">
                    <div className="table-cell table-cell_left">
                        <div className="address-content">
                            <h1 className="title">Proof of physical address</h1>
                            <p className="description">
                                This DApps can be used to verify that you have access to a certain postal address in
                                U.S. by receiving a postcard with confirmation code.
                            </p>
                            <form action="" className="address-form">
                                <div className="address-form-i">
                                    <label htmlFor="" className="label">
                                        Name
                                        <span className="address-question">
                                        <span className="address-question-tooltip">
                                            <span className="text">
                                                Enter your full name
                                            </span>
                                        </span>
                                    </span>
                                    </label>
                                    <input type="text" className="input" name="name" value={this.state.name}
                                           onChange={this.on_change}/>
                                </div>
                                <div className="address-form-i">
                                    <div className="left">
                                        <label htmlFor="" className="label">
                                            Country
                                            <span className="address-question">
                                            <span className="address-question-tooltip">
                                                <span className="text">
                                                    At the present moment address verification is available only in the United States.
                                                </span>
                                            </span>
                                        </span>
                                        </label>
                                        <input type="text" className="input" readOnly={true} name="country"
                                               value={this.state.country} onChange={this.on_change}/>
                                    </div>
                                    <div className="right">
                                        <label htmlFor="" className="label">
                                            State
                                            <span className="address-question">
                                            <span className="address-question-tooltip">
                                                <span className="text">
                                                    Select one of the states from the dropdown list
                                                </span>
                                            </span>
                                        </span>
                                        </label>
                                        {/*
                                    <input type="text" className="input" name="state" value={this.state.state} onChange={this.on_change} />
                                    */}
                                        <select className="input" name="state" style={{ 'backgroundColor': 'white' }}
                                                value={this.state.state} onChange={this.on_change}>
                                            <option value="AA">U.S. Armed Forces – Americas</option>
                                            <option value="AE">U.S. Armed Forces – Europe</option>
                                            <option value="AK">Alaska</option>
                                            <option value="AL">Alabama</option>
                                            <option value="AP">U.S. Armed Forces – Pacific</option>
                                            <option value="AR">Arkansas</option>
                                            <option value="AS">American Somoa</option>
                                            <option value="AZ">Arizona</option>
                                            <option value="CA">California</option>
                                            <option value="CT">Connecticut</option>
                                            <option value="CO">Colorado</option>
                                            <option value="DC">District Of Columbia</option>
                                            <option value="DE">Delaware</option>
                                            <option value="FL">Florida</option>
                                            <option value="FM">Federated States of Micronesia</option>
                                            <option value="GA">Georgia</option>
                                            <option value="GU">Guam</option>
                                            <option value="HI">Hawaii</option>
                                            <option value="IA">Iowa</option>
                                            <option value="ID">Idaho</option>
                                            <option value="IL">Illinois</option>
                                            <option value="IN">Indiana</option>
                                            <option value="KS">Kansas</option>
                                            <option value="KY">Kentucky</option>
                                            <option value="LA">Louisiana</option>
                                            <option value="MA">Massachusetts</option>
                                            <option value="MD">Maryland</option>
                                            <option value="ME">Maine</option>
                                            <option value="MH">Marshall Islands</option>
                                            <option value="MI">Michigan</option>
                                            <option value="MN">Minnesota</option>
                                            <option value="MO">Missouri</option>
                                            <option value="MP">Northern Mariana</option>
                                            <option value="MS">Mississippi</option>
                                            <option value="MT">Montana</option>
                                            <option value="NC">North Carolina</option>
                                            <option value="ND">North Dakota</option>
                                            <option value="NE">Nebraska</option>
                                            <option value="NH">New Hampshire</option>
                                            <option value="NJ">New Jersey</option>
                                            <option value="NM">New Mexico</option>
                                            <option value="NV">Nevada</option>
                                            <option value="NY">New York</option>
                                            <option value="OH">Ohio</option>
                                            <option value="OK">Oklahoma</option>
                                            <option value="OR">Oregon</option>
                                            <option value="PA">Pennsylvania</option>
                                            <option value="PW">Palau</option>
                                            <option value="PR">Puerto Rico</option>
                                            <option value="RI">Rhode Island</option>
                                            <option value="SC">South Carolina</option>
                                            <option value="SD">South Dakota</option>
                                            <option value="TN">Tennessee</option>
                                            <option value="TX">Texas</option>
                                            <option value="UT">Utah</option>
                                            <option value="VA">Virginia</option>
                                            <option value="WA">Washington</option>
                                            <option value="WV">West Virginia</option>
                                            <option value="WY">Wyoming</option>
                                            <option value="WI">Wisconsin</option>
                                            <option value="VI">Virgin Islands</option>
                                            <option value="VT">Vermont</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="address-form-i">
                                    <div className="left">
                                        <label htmlFor="" className="label">
                                            City
                                            <span className="address-question">
                                            <span className="address-question-tooltip">
                                                <span className="text">
                                                    Enter full name of the city
                                                </span>
                                            </span>
                                        </span>
                                        </label>
                                        <input type="text" className="input" name="city" value={this.state.city}
                                               onChange={this.on_change}/>
                                    </div>
                                    <div className="right">
                                        <label htmlFor="" className="label">
                                            ZIP
                                            <span className="address-question">
                                            <span className="address-question-tooltip">
                                                <span className="text">
                                                    Enter ZIP code
                                                </span>
                                            </span>
                                        </span>
                                        </label>
                                        <input type="text" className="input" name="zip" value={this.state.zip}
                                               onChange={this.on_change}/>
                                    </div>
                                </div>
                                <div className="address-form-i">
                                    <label htmlFor="" className="label">
                                        Address
                                        <span className="address-question">
                                        <span className="address-question-tooltip">
                                            <span className="text">
                                                Enter the rest of the address
                                            </span>
                                        </span>
                                    </span>
                                    </label>
                                    <input type="text" className="input" name="address" value={this.state.address}
                                           onChange={this.on_change}/>
                                </div>
                                <button type="button" className="button button_order"
                                        onClick={this.order_clicked}>Order
                                </button>
                            </form>
                            <div className="address-postcard">
                                <p className="address-postcard-title">0.04 ETH</p>
                                <p className="address-postcard-description">
                                    This is the price we charge for sending a postcard to you
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="table-cell table-cell_right">
                        <div className="address-content">
                            <div className="how-to swipe" id="slider">
                                <div className="swipe-wrap">
                                    <div className="how-to-i how-to-i_fill-form">
                                        <p className="how-to-title">
                                            <span>Step 1: </span>
                                            Fill form
                                        </p>
                                        <p className="how-to-description">
                                            Fill the form with your full name and postal address
                                        </p>
                                    </div>
                                    <div className="how-to-i how-to-i_sign-transaction">
                                        <p className="how-to-title">
                                            <span>Step 2: </span>
                                            Sign transaction
                                        </p>
                                        <p className="how-to-description">
                                            Sign transaction in MetaMask to add your data to smart contract and send you
                                            a postcard
                                        </p>
                                    </div>
                                    <div className="how-to-i how-to-i_get-postcard">
                                        <p className="how-to-title">
                                            <span>Step 3: </span>
                                            Get postcard
                                        </p>
                                        <p className="how-to-description">
                                            Check your mailbox for the postcard with confirmation code on it
                                        </p>
                                    </div>
                                    <div className="how-to-i how-to-i_type-code">
                                        <p className="how-to-title">
                                            <span>Step 4: </span>
                                            Type code
                                        </p>
                                        <p className="how-to-description">
                                            Open the webpage specified on the postcard and type in confirmation code
                                        </p>
                                    </div>
                                    <div className="how-to-i how-to-i_finalize-proof">
                                        <p className="how-to-title">
                                            <span>Step 5: </span>
                                            Finalize proof
                                        </p>
                                        <p className="how-to-description">
                                            Sign the second transaction to verify the code and finalize the process
                                        </p>
                                    </div>
                                </div>
                                <div className="how-to-navigation">
                                    <div className="how-to-navigation-i how-to-navigation-i_active"/>
                                    <div className="how-to-navigation-i"/>
                                    <div className="how-to-navigation-i"/>
                                    <div className="how-to-navigation-i"/>
                                    <div className="how-to-navigation-i"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Loading show={this.state.loading}/>
            </div>
        );
    }
}

export default RegisterAddressPage;
