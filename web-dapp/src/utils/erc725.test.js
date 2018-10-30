import * as erc725 from './erc725';

describe('erc725.executeAddClaimOnIdentityContract', () => {
    const fromWallet = '0x00000';
    const identityContractAddress = '0x00001';

    it('should instantiate the identity contract at the given address', () => {
        const atInvocationResult = {
            addClaim: { getData: () => true },
            execute: { getData: () => true }
        };
        const web3EthContractInvocationResult = {
            at: jest.fn(() => (atInvocationResult))
        };
        const web3 = {
            eth: {
                contract: () => web3EthContractInvocationResult,
                sendTransaction: jest.fn()
            }
        };

        erc725.executeAddClaimOnIdentityContract(
            web3,
            fromWallet,
            identityContractAddress,
            {},
            () => true
        );

        expect(web3EthContractInvocationResult.at)
          .toHaveBeenLastCalledWith(identityContractAddress);
    });

    it('should invoce sendTransaction with execute.getData() and the corressponding params', () => {
        const EXECUTE_GET_DATA_RESULT = 'something';
        const atInvocationResult = {
            addClaim: { getData: () => true },
            execute: { getData: () => EXECUTE_GET_DATA_RESULT }
        };
        const web3EthContractInvocationResult = {
            at: jest.fn(() => (atInvocationResult))
        };
        const web3 = {
            eth: {
                contract: () => web3EthContractInvocationResult,
                sendTransaction: jest.fn()
            }
        };
        const callback = () => true;

        erc725.executeAddClaimOnIdentityContract(
            web3,
            fromWallet,
            identityContractAddress,
            {},
            callback
        );

        expect(web3.eth.sendTransaction)
          .toHaveBeenLastCalledWith(
            {
              from: fromWallet,
              to: identityContractAddress,
              data: EXECUTE_GET_DATA_RESULT,
              gas: erc725.EXECUTE_TRANSACTION_GAS
            },
            callback
          );
    });

});
