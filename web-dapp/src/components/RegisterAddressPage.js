import React, { Component } from 'react';
import '../assets/javascripts/show-alert.js';

class RegisterAddressPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            country: '',
            state: '',
            city: '',
            address: '',
            zip: '',
        };
    }

    componentDidMount = () => {
        console.log('RegisterAddressPage.componentDidMount');

        if (!window.mySwipe) {
            console.log('Add mySwipe');
            window.mySwipe = new window.Swipe(document.getElementById('slider'), {
                startSlide: 0,
                speed: 500,
                auto: 4000,
                disableScroll: true,
                callback: function(index, elem) {
                    window.$('.how-to-navigation-i').removeClass('how-to-navigation-i_active')
                    .eq(index).addClass('how-to-navigation-i_active');
                }
            });

            window.$('.how-to-navigation-i').on('click', function() {
                var index = window.$(this).index();
                window.mySwipe.slide(index);
            });
        }
    }

    on_change = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    check_wallet_same = (current_wallet, initial_wallet) => {
        console.log('check_wallet current_wallet: ' + current_wallet);
        console.log('check_wallet initial_wallet: ' + initial_wallet);
        if (!current_wallet) {
            return 'MetaMask account should be unlocked';
        }
        if (current_wallet.trim().toLowerCase() !== initial_wallet) {
            return 'MetaMask account was switched';
        }
        return '';
    }

    check_user_exists = (opts, callback) => {
        var contract = this.props.contract;
        var wsame = this.check_wallet_same(this.props.my_web3.eth.accounts[0], opts.wallet);
        if (wsame) return callback(wsame);

        console.log('calling contract.check_user_exists');
        contract.user_exists(opts.wallet, { from: opts.wallet }, (err, result) => {
            if (err) {
                console.log('Error calling contract.check_user_exists:', err);
                return callback(err);
            }

            console.log('contract.check_user_exists result =', result);
            return callback(null, result);
        });
    }

    check_address_exists = (opts, callback) => {
        var contract = this.props.contract;
        var wsame = this.check_wallet_same(this.props.my_web3.eth.accounts[0], opts.wallet);
        if (wsame) return callback(wsame);

        this.check_user_exists(opts, (err, exists) => {
            if (err) {
                window.show_alert('error', 'Error in check_user_exists: ' + err.message);
                return callback(err, false);
            }

            if (!exists) {
                console.log('No previously registered addresses found, continue');
                return callback(null, false);
            }

            console.log('call contract.user_address_by_address');
            contract.user_address_by_address(
                opts.wallet,
                opts.params.country,
                opts.params.state,
                opts.params.city,
                opts.params.address,
                opts.params.zip,
                { from: opts.wallet }, (err, result) => {

                if (err) {
                    console.log('Error calling contract.user_address_by_address:', err);
                    return callback(err);
                }

                console.log('contract.user_address_by_address result =', result);
                return callback(null, result[0]);
            });
        });
    }

    register_address = (opts, callback) => {
        var contract = this.props.contract;

        console.log('calling estimateGas');
        console.log('opts = ' + JSON.stringify(opts));
        contract.register_address.estimateGas(
            opts.params.name,
            opts.params.country,
            opts.params.state,
            opts.params.city,
            opts.params.address,
            opts.params.zip,
            opts.confirmation_code_sha3,
            opts.v,
            opts.r,
            opts.s,
            { from: opts.wallet }, (err, result) => {

            if (err) {
                console.log('Estimate gas callback error:', err);
                return callback(err);
            }

            var egas = result;
            console.log('Estimated gas: ' + egas);
            var ugas = Math.floor(1.1*egas);
            console.log('Will set gas = ' + ugas);

            var wallet = this.props.my_web3 && this.props.my_web3.eth.accounts[0];
            console.log('Current wallet: ' + wallet);
            if (!wallet) {
                return callback('Account locked');
            }
            if (wallet.trim().toLowerCase() !== opts.wallet) {
                return callback('Account was switched');
            }

            console.log('Calling contract.register_address');
            contract.register_address(
                opts.params.name,
                opts.params.country,
                opts.params.state,
                opts.params.city,
                opts.params.address,
                opts.params.zip,
                opts.confirmation_code_sha3,
                opts.v,
                opts.r,
                opts.s,
                { from: opts.wallet, gas: ugas }, (err, tx_id) => {

                if (err) {
                    console.log('Error calling contract.register_address:', err);
                    return callback(err);
                }
                console.log('contract.register_address, tx_id = ' + tx_id);

                return callback(null, tx_id);
            });
        });
    }

    order_clicked = () => {
        console.log(this.props);
        console.log(this.props.my_web3);
        var wallet = this.props.my_web3 && this.props.my_web3.eth.accounts[0];
        if (!wallet) {
            window.show_alert('warning', 'MetaMask account', 'Please unlock your account in MetaMask and refresh the page first');
            return;
        }

        console.log('Using account ' + wallet);

        if (!this.state.name) {
            window.show_alert('warning', 'Required field is empty', 'Please provide your NAME');
            return;
        }

        if (!this.state.country) {
            window.show_alert('warning', 'Required field is empty', 'Please provide COUNTRY');
            return;
        }

        if (!this.state.state) {
            window.show_alert('warning', 'Required field is empty', 'Please provide STATE');
            return;
        }

        if (!this.state.city) {
            window.show_alert('warning', 'Required field is empty', 'Please provide CITY');
            return;
        }

        if (!this.state.address) {
            window.show_alert('warning', 'Required field is empty', 'Please provide ADDRESS');
            return;
        }

        if (!this.state.zip) {
            window.show_alert('warning', 'Required field is empty', 'Please provide ZIP');
            return;
        }

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
                if (!res) return;
                console.log(res);

                if (!res.ok) {
                    console.log('Error: ' + res.err);
                    window.show_alert('error', 'Server returned error', res.err);
                    return;
                }

                if (!res.result) {
                    console.log('Invalid response: missing result');
                    window.show_alert('error', 'Invalid server response', 'Missing result field');
                    return;
                }

                this.check_address_exists(res.result, (err, exists) => {
                    if (err) {
                        console.log('Error occured in check_address_exists: ', err);
                        window.show_alert('error', 'Error in check_address_exists', err.message);
                        return;
                    }
                    if (exists) {
                        window.show_alert('error', 'Address already registered', 'This address is already registered under your current MetaMask account');
                        return;
                    }

                    console.log('calling register_address');
                    this.register_address(res.result, (err, tx_id) => {
                        if (err) {
                            console.log('Error occured in register_address: ', err);
                            window.show_alert('error', 'Error in register_address', err.message);
                        }
                        else if (tx_id) {
                            console.log('Transaction mined: ' + tx_id);
                            window.$.ajax({
                                type: 'post',
                                url: './api/notifyRegTx',
                                data: {
                                    wallet: wallet,
                                    tx_id: tx_id,
                                    session_key: res.result.session_key
                                },
                                success: (res) => {
                                    if (!res) {
                                        console.log('Empty response from server');
                                        window.show_alert('error', 'Postcard sending error', 'Transaction was mined, but postcard was not sent<br><b>Transaction ID</b>: ' + tx_id + '<br><b>Error</b>: empty response from server');
                                        return;
                                    }
                                    if (!res.ok) {
                                        console.log('Not ok response from server: ' + res.err);
                                        window.show_alert('error', 'Postcard sending error', 'Transaction was mined, but postcard was not sent<br><b>Transaction ID</b>: ' + tx_id + '<br><b>Error</b>: ' + res.err);
                                        return;
                                    }
                                    window.show_alert('success', 'Address registered!', '<b>Transaction ID</b>: ' + tx_id + '<br><b>Postcard was sent</b>');
                                },
                                error: (xhr, ajaxOptions, thrownError) => {
                                    console.log('Server returned error on notifyRegTx: ' + xhr.statusText + ' (' + xhr.status + ')');
                                    window.show_alert('error', 'Server error on notifyRegTx', xhr.statusText + ' (' + xhr.status + ')');
                                }
                            });
                        }
                        else {
                            console.log('JSON RPC unexpected response: err is empty but tx_id is also empty');
                            window.show_alert('error', 'Unexpected response from register_address', 'Error is empty but tx_id is also empty');
                        }
                    });
                });
            },
            error: (xhr, ajaxOptions, thrownError) => {
                console.log('Server returned error on prepareRegTx: ' + xhr.statusText + ' (' + xhr.status + ')');
                window.show_alert('error', 'Server error on prepareRegTx', xhr.statusText + ' (' + xhr.status + ')');
            }
        });
    }

    render = () => {
        return (
            <section className="content address table">
                <div className="table-cell table-cell_left">
                    <div className="address-content">
                        <h1 className="title">Proof of physical address</h1>
                        <p className="description">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                            commodo consequat.
                        </p>
                        <form action="" className="address-form">
                            <div className="address-form-i">
                                <label for="" className="label">
                                    Name
                                    <span className="address-question">
                                        <span className="address-question-tooltip">
                                            <span className="text">
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                                tempor incididunt ut
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <input type="text" className="input" name="name" value={this.state.name} onChange={this.on_change} />
                            </div>
                            <div className="address-form-i">
                                <label for="" className="label">
                                    Address
                                    <span className="address-question">
                                        <span className="address-question-tooltip">
                                            <span className="text">
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                                tempor incididunt ut
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <input type="text" className="input" name="address" value={this.state.address} onChange={this.on_change} />
                            </div>
                            <div className="address-form-i">
                                <div className="left">
                                    <label for="" className="label">
                                        City
                                        <span className="address-question">
                                            <span className="address-question-tooltip">
                                                <span className="text">
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                                    tempor incididunt ut
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                                    <input type="text" className="input" name="city" value={this.state.city} onChange={this.on_change} />
                                </div>
                                <div className="right">
                                    <label for="" className="label">
                                        State
                                        <span className="address-question">
                                            <span className="address-question-tooltip">
                                                <span className="text">
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                                    tempor incididunt ut
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                                    <input type="text" className="input" name="state" value={this.state.state} onChange={this.on_change} />
                                </div>
                            </div>
                            <div className="address-form-i">
                                <div className="left">
                                    <label for="" className="label">
                                        Zip
                                        <span className="address-question">
                                            <span className="address-question-tooltip">
                                                <span className="text">
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                                    tempor incididunt ut
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                                    <input type="text" className="input" name="zip" value={this.state.zip} onChange={this.on_change} />
                                </div>
                                <div className="right">
                                    <label for="" className="label">
                                        Country
                                        <span className="address-question">
                                            <span className="address-question-tooltip">
                                                <span className="text">
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                                    tempor incididunt ut
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                                    <input type="text" className="input" name="country" value={this.state.country} onChange={this.on_change} />
                                </div>
                            </div>
                            <button type="button" className="button button_order" onClick={this.order_clicked}>Order</button>
                        </form>
                        <div className="address-postcard">
                            <p className="address-postcard-title">5$ / 0.0248548378 ETH</p>
                            <p className="address-postcard-description">
                                Lorem ipsum dolor sit amet, consectetur adipiscing
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
                                        <span>Step 1:</span>
                                        Fill form
                                    </p>
                                    <p className="how-to-description">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                                        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                                        commodo consequat.
                                    </p>
                                </div>
                                <div className="how-to-i how-to-i_sign-transaction">
                                    <p className="how-to-title">
                                        <span>Step 2:</span>
                                        Sign transaction
                                    </p>
                                    <p className="how-to-description">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                                        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                                        commodo consequat.
                                    </p>
                                </div>
                                <div className="how-to-i how-to-i_get-postcard">
                                    <p className="how-to-title">
                                        <span>Step 3:</span>
                                        Get postcard
                                    </p>
                                    <p className="how-to-description">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                                        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                                        commodo consequat.
                                    </p>
                                </div>
                                <div className="how-to-i how-to-i_type-code">
                                    <p className="how-to-title">
                                        <span>Step 4:</span>
                                        Type code
                                    </p>
                                    <p className="how-to-description">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                                        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                                        commodo consequat.
                                    </p>
                                </div>
                                <div className="how-to-i how-to-i_finalize-proof">
                                    <p className="how-to-title">
                                        <span>Step 5:</span>
                                        Finalize proof
                                    </p>
                                    <p className="how-to-description">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                                        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                                        commodo consequat.
                                    </p>
                                </div>
                            </div>
                            <div className="how-to-navigation">
                                <div className="how-to-navigation-i how-to-navigation-i_active"></div>
                                <div className="how-to-navigation-i"></div>
                                <div className="how-to-navigation-i"></div>
                                <div className="how-to-navigation-i"></div>
                                <div className="how-to-navigation-i"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
};

export default RegisterAddressPage;
