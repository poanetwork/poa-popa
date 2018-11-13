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
            erc735: null,
        };
        this.on_change = this.on_change.bind(this);
        this.executeAddClaim = this.executeAddClaim.bind(this);
        this.generateClaim = this.generateClaim.bind(this);
        this.renderErc735ClaimSection = this.renderErc735ClaimSection.bind(this);

        // @TODO: replace $.ajax with fetch/axios
        if (!window.$) {
          window.$ = $;
        }
    }

    on_change(event) {
        logger.debug('on_change ' + event.target.name + ': ' + event.target.value);
        this.setState({ [event.target.name]: event.target.value });
    };

    async generateClaim() {
        const {my_web3, physicalAddressIndex} = this.props;
        const identityContractAddress = this.state.identitycontractaddress;
        const web3 = my_web3;

        if (!identityContractAddress || !web3.isAddress(identityContractAddress)) {
            window.show_alert('warning', 'Verification', 'Please provide a valid IDENTITY CONTRACT ADDRESS');
            return;
        }

        const [wallet] = web3 && web3.eth.accounts ? web3.eth.accounts : [];

        this.setState({ loading: true, erc735: null });

        logger.debug('Form data:');
        logger.debug('wallet = ' + wallet);
        logger.debug('addressIndex = ' + physicalAddressIndex);
        logger.debug('destinationClaimHolderAddress = ' + identityContractAddress);

        window.$.ajax({
            type: 'post',
            url: '/api/issueErc735Claim',
            data: {
                wallet,
                addressIndex: physicalAddressIndex,
                destinationClaimHolderAddress: identityContractAddress
            },
            success: (res) => {
                if (!res) {
                    logger.debug('Empty response from server');
                    this.setState({ loading: false });
                    window.show_alert('error', 'Generating ERC735 claim', [['Error', 'Empty response from server']]);
                    return;
                }
                logger.debug(res);

                const {ok, data, issuerAddress, signature, uri} = res;
                if (!ok) {
                    logger.debug('Error: ' + res.err);
                    this.setState({ loading: false });
                    window.show_alert('error', 'Generating ERC735 claim', [['Request ID', res.x_id], ['Error', res.err]]);
                    return;
                }
                if (!data || !issuerAddress || !signature || !uri) {
                    logger.debug('Invalid response: missing issuer address, signature, uri or hashed data.');
                    this.setState({ loading: false });
                    window.show_alert('error', 'Generating ERC735 claim', [['Request ID', res.x_id], ['Error', 'Missing issuer address, signature, uri or hashed data field']]);
                    return;
                }

                const erc735Claim = {
                  type: 7,
                  scheme: 1,
                  issuer: res.issuerAddress,
                  signature: res.signature,
                  data: res.data,
                  uri: res.uri
                }
                this.setState({
                  erc735Claim: erc735Claim,
                  loading: false
                });
            },
            error: ({ responseJSON, statusText, status }) => {
                logger.debug('Server returned error on issueErc735Claim: ' + statusText + ' (' + status + ')');
                this.setState({ loading: false });
                const errorBody = [
                    ['Server error', statusText + ' (' + status + ')']
                ];
                if (responseJSON && responseJSON.err) {
                    errorBody.push([responseJSON.err]);
                }
                window.show_alert('error', 'Generating ERC735 claim', errorBody);
            }
        });
    }

    executeAddClaim() {
      const {my_web3} = this.props;
      const [wallet] = my_web3 && my_web3.eth.accounts ? my_web3.eth.accounts : [];
      const {identitycontractaddress, erc735Claim} = this.state;

      if (!erc735Claim) {
        window.show_alert('warning', 'Execute add claim', 'The ERC-735 claim must be generated first.');
        return;
      }

      this.setState({ loading: true });
      return executeAddClaimOnIdentityContract(
          my_web3,
          wallet,
          identitycontractaddress,
          erc735Claim,
          (err, txId) => {
            if (err) {
                logger.debug('Error calling executeAddClaimOnIdentityContract:', err);
                window.show_alert('error', 'Execute add claim', 'Error executing add claim to identity contract');
                this.setState({ loading: false });
            }
            logger.debug('txId = ' + txId);

            return waitForTransaction(my_web3, txId)
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

    renderErc735ClaimSection(erc735Claim) {
      if (!erc735Claim) {
        return (
          <p>
              ERC-735 claim data <i>will appear here once it is generated</i>.
          </p>
        );
      } else {
          const erc735ClaimContent = `scheme: 1\ntype: 7\nissuer: ${erc735Claim.issuer || '...'}\nsignature: ${erc735Claim.signature || '...'}\ndata: ${erc735Claim.data || '...'}\nuri: ${erc735Claim.uri || '...'}`;
          return (
            <section>
                <p>
                    ERC-735 claim data generated:
                </p>
                <p>
                    <pre>{erc735ClaimContent}</pre>
                </p>
                <div className="small-c-copy">
                    Click on "Add To Identity" and sign the transaction to <span className="monospaced-text">execute</span> an <span className="monospaced-text">addClaim</span> on the specified identity contract using the data above.
                </div>
            </section>
          );
      }
    }

    render() {
        const {loading, erc735Claim, identitycontractaddress} = this.state;
        return (
            <div className="col-md-12">
                <div className="content">
                    <h1 className="main-title">Add claim to identity contract</h1>
                    <p>
                        Enter the address of your ERC-725 identity contract, generate the data needed for an ERC-735 claim, and finally add it to your identity contract.
                    </p>
                    <div className="claim-form-container">
                        <div className="row">
                            <div className="col-md-12">
                                <form id="claim-form" name="claimForm" noValidate>
                                    <label>Identity Contract Address:</label>
                                    <div className="form-group identity-contract-address">
                                        <input className="form-control" type="text" name="identitycontractaddress" value={identitycontractaddress} onChange={this.on_change}/>
                                        <button type="button" className="btn btn-primary" id="btnSubmit" onClick={this.generateClaim} disabled={loading}></button>
                                    </div>
                                </form>
                                {this.renderErc735ClaimSection(erc735Claim)}
                            </div>
                        </div>
                    </div>
                    <BackButton to="/my-addresses" />
                    <button id="addToIdentity" type="button" className="action-btn mt-3" onClick={this.executeAddClaim} disabled={loading}>
                        Add To Identity
                        <img className="btn-arrow" src={require('../assets/images/arrow.svg')} alt="arrow" />
                    </button>
                </div>
                <Loading show={loading}/>
            </div>
        );
    }
}

export default AddClaimToIdentityPage;
