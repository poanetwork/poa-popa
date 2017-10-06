pragma solidity ^0.4.15;

// Checks -> Effects -> Interactions

contract ProofOfPhysicalAddress
{
    struct PhysicalAddress
    {
        string name;

        string country;
        string state;
        string city;
        string location;
        string zip;

        uint256 creation_block;
        bytes32 confirmation_code_sha3;
        uint256 confirmation_block;
    }

    struct User
    {
        uint256 creation_block;
        PhysicalAddress[] physical_addresses;
    }

    mapping (address => User) public users;

    address public owner;

    // stats
    uint64 public total_users;
    uint64 public total_addresses;
    uint64 public total_confirmed;

    function ProofOfPhysicalAddress()
    {
        owner = msg.sender;
    }

    function str_eq(string s, string m)
    internal returns(bool)
    {
        bytes memory _s = bytes(s);
        bytes memory _m = bytes(m);

        if (_s.length != _m.length) return false;
        if (_s.length == 0 && _m.length == 0) return true;

        for (uint256 i = 0; i < _s.length; i += 1)
        {
            if (_s[i] != _m[i]) return false;
        }
        return true;
    }

    // Public methods:

    function signer_is_valid(bytes32 data, uint8 v, bytes32 r, bytes32 s)
    public constant returns (bool)
    {
        bytes memory prefix = '\x19Ethereum Signed Message:\n32';
        bytes32 prefixed = sha3(prefix, data);
        return (ecrecover(prefixed, v, r, s) == owner);
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
        for (uint256 ai = 0; ai < users[wallet].physical_addresses.length; ai += 1)
        {
            if (
                   str_eq(users[wallet].physical_addresses[ai].country, country)
                && str_eq(users[wallet].physical_addresses[ai].state, state)
                && str_eq(users[wallet].physical_addresses[ai].city, city)
                && str_eq(users[wallet].physical_addresses[ai].location, location)
                && str_eq(users[wallet].physical_addresses[ai].zip, zip))
            {
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

    function register_address(
        string name,
        string country, string state, string city, string location, string zip,
        bytes32 confirmation_code_sha3, uint8 sig_v, bytes32 sig_r, bytes32 sig_s)
    public
    {
        require(!str_eq(name, ''));
        require(!str_eq(country, '') && !str_eq(state, '') && !str_eq(city, '') && !str_eq(location, '') && !str_eq(zip, ''));

        require(signer_is_valid(
            sha3(
                msg.sender,
                name,
                country,
                state,
                city,
                location,
                zip,
                confirmation_code_sha3
            ),
            sig_v, sig_r, sig_s
        ));

        if (user_exists(msg.sender))
        {
            // check if this address is already registered
            bool found;
            (found, , ) = user_address_by_address(msg.sender, country, state, city, location, zip);

            if (found) revert();

            // not registered yet:
            users[msg.sender].physical_addresses.push(PhysicalAddress({
                name: name,
                country: country,
                state: state,
                city: city,
                location: location,
                zip: zip,
                creation_block: block.number,
                confirmation_code_sha3: confirmation_code_sha3,
                confirmation_block: 0
            }));

            total_addresses += 1;
        }
        else
        {
            // new user
            users[msg.sender].creation_block = block.number;
            users[msg.sender].physical_addresses.push(PhysicalAddress({
                name: name,
                country: country,
                state: state,
                city: city,
                location: location,
                zip: zip,
                creation_block: block.number,
                confirmation_code_sha3: confirmation_code_sha3,
                confirmation_block: 0
            }));

            total_users += 1;
            total_addresses += 1;
        }
    }

    function confirm_address(string confirmation_code_plain, uint8 sig_v, bytes32 sig_r, bytes32 sig_s)
    public
    {
        require(!str_eq(confirmation_code_plain, ''));
        require(user_exists(msg.sender));

        require(signer_is_valid(
            sha3(
                msg.sender,
                confirmation_code_plain
            ),
            sig_v, sig_r, sig_s
        ));

        bool found;
        uint ai;
        bool confirmed;
        (found, ai, confirmed) = user_address_by_confirmation_code(msg.sender, sha3(confirmation_code_plain));
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

    // for dev
    bytes32[] public logs;
    function write_log(bytes32 mesg)
    public
    {
        logs.push(mesg);
    }

    function test_ecrecover(bytes32 data, uint8 v, bytes32 r, bytes32 s)
    public constant returns (bytes32, uint8, bytes32, bytes32,    bytes32, address, bool)
    {
        bytes memory prefix = '\x19Ethereum Signed Message:\n32';
        bytes32 prefixed = sha3(prefix, data);
        address recovered = ecrecover(prefixed, v, r, s);
        return (data, v, r, s, prefixed, recovered, recovered == owner);
    }

    function test_sha3(string name, string country, string state, string city, string location, string zip, bytes32 cc)
    public constant returns (bytes32)
    {
        return sha3(
            msg.sender,
            name,
            country,
            state,
            city,
            location,
            zip,
            cc
        );
    }
}
