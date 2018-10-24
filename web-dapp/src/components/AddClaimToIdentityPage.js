import React from 'react';
import $ from 'jquery';
import * as log from 'loglevel';

import { Loading } from './Loading';
import BackButton from './BackButton';

import '../assets/javascripts/show-alert.js';
import { executeAddClaimOnIdentityContract } from '../utils/erc725'
import waitForTransaction from '../waitForTransaction';

const logger = log.getLogger('AddClaimToIdentityPage');

class AddClaimToIdentityPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            identitycontractaddress: '',
        };
        this.on_change = this.on_change.bind(this);
        this.generateClaim = this.generateClaim.bind(this);
        this.executeAddClaim = this.executeAddClaim.bind(this);

        // @TODO: replace $.ajax with fetch/axios
        if (!window.$) {
          window.$ = $;
        }
    }

    on_change(event) {
        logger.debug('on_change ' + event.target.name + ': ' + event.target.value);
        this.setState({ [event.target.name]: event.target.value });
    };

    generateClaim() {
        const {wallet, my_web3, physicalAddressIndex} = this.props;
        const identityContractAddress = this.state.identitycontractaddress;
        const web3 = my_web3;

        if (!identityContractAddress || !web3.isAddress(identityContractAddress)) {
            window.show_alert('warning', 'Verification', 'Please provide a valid IDENTITY CONTRACT ADDRESS');
            return;
        }

        this.setState({ loading: true });

        logger.debug('Form data:');
        logger.debug('wallet = ' + wallet);
        logger.debug('addressIndex = ' + physicalAddressIndex);
        logger.debug('destinationClaimHolderAddress = ' + identityContractAddress);

        window.$.ajax({
            type: 'post',
            url: '/api/issueErc725Claim',
            data: {
                wallet,
                addressIndex: physicalAddressIndex,
                destinationClaimHolderAddress: identityContractAddress
            },
            success: (res) => {
                if (!res) {
                    logger.debug('Empty response from server');
                    this.setState({ loading: false });
                    window.show_alert('error', 'Generating ERC725 claim', [['Error', 'Empty response from server']]);
                    return;
                }
                logger.debug(res);

                if (!res.ok) {
                    logger.debug('Error: ' + res.err);
                    this.setState({ loading: false });
                    window.show_alert('error', 'Generating ERC725 claim', [['Request ID', res.x_id], ['Error', res.err]]);
                    return;
                }

                if (!res.result) {
                    logger.debug('Invalid response: missing result');
                    this.setState({ loading: false });
                    window.show_alert('error', 'Generating ERC725 claim', [['Request ID', res.x_id], ['Error', 'Missing result field']]);
                    return;
                }

                const claim = {
                    issuerAddress: res.issuerAddress,
                    signature: res.signature,
                    data: res.data,
                    uri: res.uri,
                };
                this.executeAddClaim(web3, wallet, identityContractAddress, claim);
            },
            error: ({ responseJSON, statusText, status }) => {
                logger.debug('Server returned error on issueErc725Claim: ' + statusText + ' (' + status + ')');
                this.setState({ loading: false });
                const errorBody = [
                    ['Server error', statusText + ' (' + status + ')']
                ];
                if (responseJSON && responseJSON.err) {
                    errorBody.push([responseJSON.err]);
                }
                window.show_alert('error', 'Generating ERC725 claim', errorBody);
            }
        });
    }

    executeAddClaim(web3, wallet, identityContractAddress, claim) {
      return executeAddClaimOnIdentityContract(
          web3,
          wallet,
          identityContractAddress,
          claim,
          (err, txId) => {
            if (err) {
                logger.debug('Error calling executeAddClaimOnIdentityContract:', err);
                window.show_alert('error', 'Execute add claim', 'Error executing add claim to identity contract');
                this.setState({ loading: false });
            }
            logger.debug('txId = ' + txId);

            return waitForTransaction(web3, txId)
                .then(() => {
                    logger.debug('Transaction submitted: ' + txId);
                    // @TODO: add details included in claim
                    window.show_alert('success', 'Claim generated and added to identity contract!', [
                        ['Transaction to execute and add claim to identity contract was submitted'],
                        ['Transaction ID', txId],
                    ]);
                    this.setState({ loading: false });
                })
                .catch(error => {
                  logger.debug('Error calling executeAddClaimOnIdentityContract:', err);
                  window.show_alert('error', 'Execute add claim', 'Error executing add claim to identity contract');
                  this.setState({ loading: false });
                });
          }
      );
    }

    render() {
        const {loading} = this.state;
        return (
            <div className="col-md-12">
                <div className="content">
                    <h1 className="main-title">Add claim to identity contract</h1>
                    <p>
                       Enter the address of your identity contract and submit the form to generate the claim, then sign the transaction to excecute the addition of the corresponding claim.
                    </p>
                    <form id="addToIdentityForm">
                        <div className="form-group">
                            <label>Identity Contract Address</label>
                            <div className="info"><img className="svg-info" src={require('../assets/images/info.svg')} alt="info" />
                                <div className="hidden-info">Enter the address of your identity contract</div>
                            </div>
                            <input type="text" className="form-control" placeholder="Enter the address of your identity contract" name="identitycontractaddress" value={this.state.identitycontractaddress}
                                   onChange={this.on_change} />
                        </div>
                        <BackButton to="/my-addresses" />
                        <button id="generateClaim" type="button" className="action-btn mt-3" onClick={this.generateClaim} disabled={loading}>
                            Generate Claim
                            <img className="btn-arrow" src={require('../assets/images/arrow.svg')} alt="arrow" />
                        </button>
                    </form>
                </div>
                <Loading show={loading}/>
            </div>
        );
    }
}

export default AddClaimToIdentityPage;
