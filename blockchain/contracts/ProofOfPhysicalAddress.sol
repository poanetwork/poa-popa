pragma solidity 0.4.19;

// Checks -> Effects -> Interactions

contract ProofOfPhysicalAddress
{
    address public owner;
    address public signer;

    // Main structures:
    struct PhysicalAddress {
        string name;

        string country;
        string state;
        string city;
        string location;
        string zip;

        uint256 creation_block;
        bytes32 keccak_identifier;
        bytes32 confirmation_code_sha3;
        uint256 confirmation_block;
    }

    function ProofOfPhysicalAddress() public
    {
        owner = msg.sender;
        signer = owner;
    }

    struct User
    {
        uint256 creation_block;
        PhysicalAddress[] physical_addresses;
    }

    mapping (address => User) public users;

    // Stats:

    uint64 public total_users;
    uint64 public total_addresses;
    uint64 public total_confirmed;

    // Helpers:
    function signer_is_valid(bytes32 data, uint8 v, bytes32 r, bytes32 s)
    public constant returns (bool)
    {
        bytes memory prefix = '\x19Ethereum Signed Message:\n32';
        bytes32 prefixed = keccak256(prefix, data);
        return (ecrecover(prefixed, v, r, s) == signer);
    }

    // Methods:

    // set address that is used on server-side to calculate signatures
    // and on contract-side to verify them
    function set_signer(address new_signer)
    public
    {
        require(msg.sender == owner);
        signer = new_signer;
    }

    // withdraw specified amount of eth in wei
    function withdraw_some(uint256 amount_wei)
    public
    {
        require(msg.sender == owner);
        if (this.balance < amount_wei) revert();
        owner.transfer(amount_wei);
    }

    // withdraw all available eth
    function withdraw_all()
    public
    {
        require(msg.sender == owner);
        if (this.balance == 0) revert();
        owner.transfer(this.balance);
    }

    function user_exists(address wallet)
    public constant returns (bool)
    {
        return (users[wallet].creation_block > 0);
    }

    function user_address_confirmed(address wallet, uint256 address_index)
    public constant returns (bool)
    {
        require(user_exists(wallet));
        return (users[wallet].physical_addresses[address_index].confirmation_block > 0);
    }

    // returns (found/not found, index if found/0 if not found, confirmed/not confirmed)
    function user_address_by_creation_block(address wallet, uint256 creation_block)
    public constant returns (bool, uint256, bool)
    {
        require(user_exists(wallet));
        for (uint256 ai = 0; ai < users[wallet].physical_addresses.length; ai += 1)
        {
            if (users[wallet].physical_addresses[ai].creation_block == creation_block)
            {
                return (true, ai, user_address_confirmed(wallet, ai));
            }
        }
        return (false, 0, false);
    }

    // returns (found/not found, index if found/0 if not found, confirmed/not confirmed)
    function user_address_by_confirmation_code(address wallet, bytes32 confirmation_code_sha3)
    public constant returns (bool, uint256, bool)
    {
        require(user_exists(wallet));
        for (uint256 ai = 0; ai < users[wallet].physical_addresses.length; ai += 1)
        {
            if (users[wallet].physical_addresses[ai].confirmation_code_sha3 == confirmation_code_sha3)
            {
                return (true, ai, user_address_confirmed(wallet, ai));
            }
        }
        return (false, 0, false);
    }

    // returns (found/not found, index if found/0 if not found, confirmed/not confirmed)
    function user_address_by_address(address wallet, string country, string state, string city, string location, string zip)
    public constant returns(bool, uint256, bool)
    {
        require(user_exists(wallet));
        bytes32 keccak_identifier = keccak256(country, state, city, location, zip);
        for (uint256 ai = 0; ai < users[wallet].physical_addresses.length; ai += 1) {
            if (users[wallet].physical_addresses[ai].keccak_identifier == keccak_identifier) {
                return (true, ai, user_address_confirmed(wallet, ai));
            }
        }
        return (false, 0, false);
    }

    function user_last_used_name(address wallet)
    public constant returns (string)
    {
        require(user_exists(wallet));
        return users[wallet].physical_addresses[users[wallet].physical_addresses.length-1].name;
    }

    // if user does not exist, returns 0
    function user_addresses_count(address wallet)
    public constant returns (uint256)
    {
        return users[wallet].physical_addresses.length;
    }

    function user_address(address wallet, uint256 address_index)
    public constant returns (
        string country, string state, string city, string location, string zip)
    {
        require(user_exists(wallet));
        return (
            users[wallet].physical_addresses[address_index].country,
            users[wallet].physical_addresses[address_index].state,
            users[wallet].physical_addresses[address_index].city,
            users[wallet].physical_addresses[address_index].location,
            users[wallet].physical_addresses[address_index].zip
        );
    }

    function user_address_info(address wallet, uint256 address_index)
    public constant returns (
        string name,
        uint256 creation_block, uint256 confirmation_block)
    {
        require(user_exists(wallet));
        return (
            users[wallet].physical_addresses[address_index].name,
            users[wallet].physical_addresses[address_index].creation_block,
            users[wallet].physical_addresses[address_index].confirmation_block
        );
    }

    // Main methods:

    function register_address(
        string name,
        string country, string state, string city, string location, string zip,
        uint256 price_wei,
        bytes32 confirmation_code_sha3, uint8 sig_v, bytes32 sig_r, bytes32 sig_s)
    public payable
    {
        require(bytes(name).length > 0);
        require(bytes(country).length > 0);
        require(bytes(state).length > 0);
        require(bytes(city).length > 0);
        require(bytes(location).length > 0);
        require(bytes(zip).length > 0);
        require(msg.value >= price_wei);

        bytes32 data = keccak256(
            msg.sender,
            name,
            country,
            state,
            city,
            location,
            zip,
            price_wei,
            confirmation_code_sha3
        );
        require(signer_is_valid(data, sig_v, sig_r, sig_s));

        if (user_exists(msg.sender)) {
            // check if this address is already registered
            bool found;
            (found, , ) = user_address_by_address(msg.sender, country, state, city, location, zip);

            require(!found);
        } else {
            // new user
            users[msg.sender].creation_block = block.number;

            total_users += 1;
        }

        PhysicalAddress memory pa;

        pa.name = name;
        pa.country = country;
        pa.state = state;
        pa.city = city;
        pa.location = location;
        pa.zip = zip;
        pa.creation_block = block.number;
        pa.confirmation_code_sha3 = confirmation_code_sha3;
        pa.keccak_identifier = keccak256(country, state, city, location, zip);
        pa.confirmation_block = 0;
        users[msg.sender].physical_addresses.push(pa);

        total_addresses += 1;
    }

    function confirm_address(string confirmation_code_plain, uint8 sig_v, bytes32 sig_r, bytes32 sig_s)
    public
    {
        require(bytes(confirmation_code_plain).length > 0);
        require(user_exists(msg.sender));

        bytes32 data = keccak256(
            msg.sender,
            confirmation_code_plain
        );
        require(signer_is_valid(data, sig_v, sig_r, sig_s));

        bool found;
        uint ai;
        bool confirmed;
        (found, ai, confirmed) = user_address_by_confirmation_code(msg.sender, keccak256(confirmation_code_plain));
        require(found);

        if (confirmed)
        {
            revert();
        }
        else
        {
            users[msg.sender].physical_addresses[ai].confirmation_block = block.number;
            total_confirmed += 1;
        }
    }
}
