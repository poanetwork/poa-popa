pragma solidity 0.4.19;

import "./EthereumClaimsRegistryInterface.sol";
import "./PhysicalAddressClaim.sol";
import "./ERC20.sol";


// Checks -> Effects -> Interactions
contract ProofOfPhysicalAddress {
    address public owner;
    address public signer;
    EthereumClaimsRegistryInterface public registry;

    // Main structures:
    struct PhysicalAddress {
        string name;

        string country;
        string state;
        string city;
        string location;
        string zip;

        uint256 creationBlock;
        bytes32 keccakIdentifier;
        bytes32 confirmationCodeSha3;
    }

    function ProofOfPhysicalAddress(address _registry) public
    {
        owner = msg.sender;
        signer = owner;
        registry = EthereumClaimsRegistryInterface(_registry);
    }

    struct User {
        uint256 creationBlock;
        PhysicalAddress[] physicalAddresses;
    }

    mapping (address => User) public users;

    // Stats:

    uint64 public totalUsers;
    uint64 public totalAddresses;
    uint64 public totalConfirmed;

    // Events:

    event LogSignerChanged(address newSigner);
    event LogRegistryChanged(address newRegistry);
    event LogAddressRegistered(address indexed wallet, bytes32 keccakIdentifier);
    event LogAddressUnregistered(address indexed wallet, bytes32 keccakIdentifier);
    event LogAddressConfirmed(address indexed wallet, bytes32 keccakIdentifier);
    event LogClaimedTokens(address token, address to, uint256 amount);

    // Modifiers:
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier checkUserExists(address wallet) {
        require(userExists(wallet));
        _;
    }

    modifier validIndex(address wallet, uint256 addressIndex) {
        require(addressIndex < users[wallet].physicalAddresses.length);
        _;
    }

    // Helpers:
    function signerIsValid(bytes32 data, uint8 v, bytes32 r, bytes32 s)
    public constant returns (bool)
    {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixed = keccak256(prefix, data);
        return (ecrecover(prefixed, v, r, s) == signer);
    }

    // Methods:
    // set address that is used on server-side to calculate signatures
    // and on contract-side to verify them
    function setSigner(address newSigner) public onlyOwner {
        signer = newSigner;
        LogSignerChanged(newSigner);
    }

    function setRegistry(address newRegistry) public onlyOwner {
        registry = EthereumClaimsRegistryInterface(newRegistry);
        LogRegistryChanged(newRegistry);
    }

    // withdraw specified amount of eth in wei
    function withdrawSome(uint256 amountWei)
    public onlyOwner
    {
        require(address(this).balance >= amountWei);
        owner.transfer(amountWei);
    }

    // withdraw all available eth
    function withdrawAll()
    public onlyOwner
    {
        require(address(this).balance > 0);
        owner.transfer(address(this).balance);
    }

    function userExists(address wallet)
    public constant returns (bool)
    {
        return (users[wallet].creationBlock > 0);
    }

    function userAddressConfirmed(address wallet, uint256 addressIndex)
    public constant checkUserExists(wallet) validIndex(wallet, addressIndex) returns (bool)
    {
        bytes32 keccakIdentifier = users[wallet].physicalAddresses[addressIndex].keccakIdentifier;

        if (keccakIdentifier == 0x0) {
            return false;
        }

        return PhysicalAddressClaim.decodeConfirmation(registry.getClaim(address(this), wallet, keccakIdentifier)) > 0;
    }

    // returns (found/not found, index if found/0 if not found, confirmed/not confirmed)
    function userAddressByCreationBlock(address wallet, uint256 creationBlock)
    public constant checkUserExists(wallet) returns (bool, uint256, bool)
    {
        for (uint256 ai = 0; ai < users[wallet].physicalAddresses.length; ai++) {
            if (users[wallet].physicalAddresses[ai].creationBlock == creationBlock) {
                return (true, ai, userAddressConfirmed(wallet, ai));
            }
        }
        return (false, 0, false);
    }

    // returns (found/not found, index if found/0 if not found, confirmed/not confirmed)
    function userAddressByConfirmationCode(
        address wallet,
        bytes32 confirmationCodeSha3
    )
        public
        constant
        checkUserExists(wallet)
        returns(bool, uint256, bool, bytes32)
    {
        for (uint256 ai = 0; ai < users[wallet].physicalAddresses.length; ai++) {
            if (users[wallet].physicalAddresses[ai].confirmationCodeSha3 == confirmationCodeSha3) {
                return (
                    true,
                    ai,
                    userAddressConfirmed(wallet, ai),
                    users[wallet].physicalAddresses[ai].keccakIdentifier
                );
            }
        }
        return (false, 0, false, 0x0);
    }

    // returns (found/not found, index if found/0 if not found, confirmed/not confirmed)
    function userAddressByAddress(address wallet, string country, string state, string city, string location, string zip)
    public constant checkUserExists(wallet) returns(bool, uint256, bool)
    {
        bytes32 keccakIdentifier = keccak256(country, state, city, location, zip);
        return userAddressByKeccakIdentifier(wallet, keccakIdentifier);
    }

    // returns (found/not found, index if found/0 if not found, confirmed/not confirmed)
    function userAddressByKeccakIdentifier(address wallet, bytes32 keccakIdentifier)
    public constant checkUserExists(wallet) returns(bool, uint256, bool)
    {
        for (uint256 ai = 0; ai < users[wallet].physicalAddresses.length; ai++) {
            if (users[wallet].physicalAddresses[ai].keccakIdentifier == keccakIdentifier) {
                return (true, ai, userAddressConfirmed(wallet, ai));
            }
        }
        return (false, 0, false);
    }

    // returns last name submitted to PoPA contract
    function userLastSubmittedName(address wallet)
    public constant checkUserExists(wallet) returns (string)
    {
        return users[wallet].physicalAddresses[users[wallet].physicalAddresses.length-1].name;
    }

    // returns name from the last confirmed address. If no addresses were confirmed returns ''
    function userLastConfirmedName(address wallet)
    public constant checkUserExists(wallet) returns (string)
    {
        for (uint256 ai = users[wallet].physicalAddresses.length; ai > 0;) {
            ai--;
            if (userAddressConfirmed(wallet, ai)) {
                return users[wallet].physicalAddresses[ai].name;
            }
        }
        return "";
    }

    // returns how many addresses there are in PoPA contract. If user does not exist, returns 0
    function userSubmittedAddressesCount(address wallet)
    public constant returns (uint256)
    {
        return users[wallet].physicalAddresses.length;
    }

    // returns how many addresses from PoPA contract are confirmed. If user does not exist, returns 0
    function userConfirmedAddressesCount(address wallet)
    public constant returns (uint256)
    {
        uint256 c = 0;
        for (uint256 ai = 0; ai < users[wallet].physicalAddresses.length; ai++) {
            if (userAddressConfirmed(wallet, ai)) {
                c += 1;
            }
        }
        return c;
    }

    function userAddress(address wallet, uint256 addressIndex)
    public constant checkUserExists(wallet) validIndex(wallet, addressIndex) returns (
        string country, string state, string city, string location, string zip)
    {
        return (
            users[wallet].physicalAddresses[addressIndex].country,
            users[wallet].physicalAddresses[addressIndex].state,
            users[wallet].physicalAddresses[addressIndex].city,
            users[wallet].physicalAddresses[addressIndex].location,
            users[wallet].physicalAddresses[addressIndex].zip
        );
    }

    function userAddressInfo(address wallet, uint256 addressIndex)
    public constant checkUserExists(wallet) validIndex(wallet, addressIndex) returns (
        string name,
        uint256 creationBlock,
        uint256 confirmationBlock,
        bytes32 keccakIdentifier
    ) {
        bytes32 _keccakIdentifier = users[wallet].physicalAddresses[addressIndex].keccakIdentifier;

        uint256 _confirmationBlock = PhysicalAddressClaim.decodeConfirmation(registry.getClaim(
            address(this),
            wallet,
            _keccakIdentifier)
        );

        return (
            users[wallet].physicalAddresses[addressIndex].name,
            users[wallet].physicalAddresses[addressIndex].creationBlock,
            _confirmationBlock,
            _keccakIdentifier
        );
    }

    // Main methods:
    function registerAddress(
        string name,
        string country, string state, string city, string location, string zip,
        uint256 priceWei,
        bytes32 confirmationCodeSha3, uint8 sigV, bytes32 sigR, bytes32 sigS)
    public payable
    {
        require(bytes(name).length > 0);
        require(bytes(country).length > 0);
        require(bytes(state).length > 0);
        require(bytes(city).length > 0);
        require(bytes(location).length > 0);
        require(bytes(zip).length > 0);
        require(msg.value >= priceWei);

        bytes32 data = keccak256(
            msg.sender,
            name,
            country,
            state,
            city,
            location,
            zip,
            priceWei,
            confirmationCodeSha3
        );
        require(signerIsValid(data, sigV, sigR, sigS));

        if (userExists(msg.sender)) {
            // check if this address is already registered
            bool found;
            (found, , ) = userAddressByAddress(msg.sender, country, state, city, location, zip);

            require(!found);
        } else {
            // new user
            users[msg.sender].creationBlock = block.number;

            totalUsers += 1;
        }

        PhysicalAddress memory pa;

        pa.name = name;
        pa.country = country;
        pa.state = state;
        pa.city = city;
        pa.location = location;
        pa.zip = zip;
        pa.creationBlock = block.number;
        pa.confirmationCodeSha3 = confirmationCodeSha3;
        pa.keccakIdentifier = keccak256(country, state, city, location, zip);
        users[msg.sender].physicalAddresses.push(pa);

        totalAddresses += 1;

        LogAddressRegistered(msg.sender, pa.keccakIdentifier);
    }

    function unregisterAddress(string country, string state, string city, string location, string zip)
        public checkUserExists(msg.sender)
    {
        bool found;
        uint256 index;
        bool confirmed;
        (found, index, confirmed) = userAddressByAddress(msg.sender, country, state, city, location, zip);
        require(found);

        bytes32 keccakIdentifier = users[msg.sender].physicalAddresses[index].keccakIdentifier;
        registry.removeClaim(
            address(this),
            msg.sender,
            keccakIdentifier
        );

        // Remove physical address from list
        uint256 length = users[msg.sender].physicalAddresses.length;

        for (uint256 i = index; i < length - 1; i++) {
            users[msg.sender].physicalAddresses[i] = users[msg.sender].physicalAddresses[i+1];
        }

        delete users[msg.sender].physicalAddresses[length - 1];
        users[msg.sender].physicalAddresses.length--;

        if (users[msg.sender].physicalAddresses.length == 0) {
            delete users[msg.sender];
            totalUsers--;
        }

        totalAddresses--;
        if (confirmed) {
            totalConfirmed--;
        }

        LogAddressUnregistered(msg.sender, keccakIdentifier);
    }

    function confirmAddress(string confirmationCodePlain, uint8 sigV, bytes32 sigR, bytes32 sigS)
    public checkUserExists(msg.sender)
    {
        require(bytes(confirmationCodePlain).length > 0);

        bytes32 data = keccak256(
            msg.sender,
            confirmationCodePlain
        );
        require(signerIsValid(data, sigV, sigR, sigS));

        bool found;
        uint ai;
        bool confirmed;
        bytes32 keccakIdentifier;
        (found, ai, confirmed, keccakIdentifier) = userAddressByConfirmationCode(
            msg.sender,
            keccak256(confirmationCodePlain)
        );
        require(found);
        require(!confirmed);

        registry.setClaim(msg.sender, keccakIdentifier, PhysicalAddressClaim.encode(block.number));
        totalConfirmed += 1;

        LogAddressConfirmed(msg.sender, keccakIdentifier);
    }

    function claimTokens(address _token, address _to) public onlyOwner {
        require(_token != address(0));
        require(_to != address(0));

        ERC20 token = ERC20(_token);
        uint256 balance = token.balanceOf(this);
        token.transfer(_to, balance);
        LogClaimedTokens(_token, _to, balance);
    }
}
