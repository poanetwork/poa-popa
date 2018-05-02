const PhysicalAddressClaim = artifacts.require('PhysicalAddressClaim');

contract('PhysicalAddressClaim', () => {
    it('Should encodes the confirmation block number in a bytes32', async () => {
        const contract = await PhysicalAddressClaim.deployed();
        const _confirmationBlockNumber = '0x0000000000000000000000000000000000000000000000000000000000FAFAFA';
        const expected = '0x0100000000000000000000000000000000000000000000000000000000fafafa';
        assert.equal(
            await contract.encode(_confirmationBlockNumber),
            expected
        );
    });

    it('Should not encode if the confirmation block number is bigger than the Confirmation mask', async () => {
        const contract = await PhysicalAddressClaim.deployed();
        const _confirmationBlockNumber = '0x0100000000000000000000000000000000000000000000000000000000FAFAFA';

        await contract.encode(_confirmationBlockNumber)
            .then(
                () => assert.fail(), // should reject
                () => {}
            );
    });

    it('Should decodes the claim', async () => {
        const contract = await PhysicalAddressClaim.deployed();
        const _claim = '0x0100000000000000000000000000000000000000000000000000000000FAFAFA';
        const [version, confirmation] = await contract.decode(_claim);
        assert.equal(
            version,
            1
        );
        assert.equal(
            (confirmation).toFixed(),
            parseInt('0x0000000000000000000000000000000000000000000000000000000000FAFAFA', 16)
        );
    });

    it('Should not decode the claim if it is not the current version', async () => {
        const contract = await PhysicalAddressClaim.deployed();
        const _claim = '0x0200000000000000000000000000000000000000000000000000000000FAFAFA';
        await contract.decode(_claim)
            .then(
                () => assert.fail(), // should reject
                () => {}
            );
    });

    it('Should extracts the version', async () => {
        const contract = await PhysicalAddressClaim.deployed();
        const _claim = '0x0100000000000000000000000000000000000000000000000000000000FAFAFA';
        const expected = 1;
        assert.equal(
            (await contract.decodeVersion(_claim)).toFixed(),
            expected
        );
    });

    it('Should extracts the confirmation block number', async () => {
        const contract = await PhysicalAddressClaim.deployed();
        const _claim = '0x0100000000000000000000000000000000000000000000000000000000FAFAFA';
        const expected = parseInt('0x0000000000000000000000000000000000000000000000000000000000FAFAFA', 16);
        assert.equal(
            (await contract.decodeConfirmation(_claim)).toFixed(),
            expected
        );
    });
});
