require('dotenv').config();
const TrustedSetupCoordinator = require('../abis/TrustedSetupCoordinator');
const crypto = require('crypto');
const ethers = require('ethers');

const { DEV_PRIVATE_KEY, TOKEN_FAUCET_PKEY } = process.env;
const ARB_RINKEBY_URL = 'https://rinkeby.arbitrum.io/rpc';

// BigNumber
const toBN = n => new ethers.BigNumber.from(n.toString());

// for compressing to one slot on-chain
const toBytes32 = ipfsHash =>
    // strip the multihash id
    new ethers.BigNumber.from(ethers.utils.base58.decode(ipfsHash).slice(2));

// for recovering ipfs hash from compressed on-chain data
const toIpfsHash = bytes32 =>
    // each ipfsHash starts with 'Qm' (the multihash identifier)
    ethers.utils.base58.encode([0x12, 0x20, ...ethers.utils.arrayify(bytes32)]);

// check address validity
const isAddress = addr => ethers.utils.isAddress(addr);

// return checksum address
const getAddress = addr => ethers.utils.getAddress(addr);

// read-only provider
const provider = new ethers.providers.JsonRpcProvider(ARB_RINKEBY_URL);

// random crypto private key, for signing only (not for funds)
const getKey = () =>
    new ethers.BigNumber.from(crypto.randomBytes(32));

// controller wallet, owns coordinator contract
const wallet = new ethers.Wallet(
    DEV_PRIVATE_KEY, provider
);

// by default use read-only provider
const coordinator = new ethers.Contract(
    TrustedSetupCoordinator.address,
    TrustedSetupCoordinator.abi,
    provider
);

const controller = coordinator.connect(wallet);

const getController = () => {
    return coordinator.controller();
};

const getBalance = (addr) => {
    return provider.getBalance(addr);
};

const nitroFaucet = () => {
    return new ethers.Contract(
        '0x2660A51376D78D723B082cc527f7d24b8F6AF74F',
        [
            "function balanceOf(address owner) external view returns (uint)",
            "function transfer(address to, uint value) external returns (bool)"
        ],
        new ethers.Wallet(TOKEN_FAUCET_PKEY, new ethers.providers.JsonRpcProvider('https://nitro-devnet.arbitrum.io/rpc'))
    );
};

const rinkarbyFaucet = () => {
    return new ethers.Contract(
        '0x0A26b6E96679269b0A3516ce863Ee7d869854D3F',
        [
            "function balanceOf(address owner) external view returns (uint)",
            "function transfer(address to, uint value) external returns (bool)"
        ],
        new ethers.Wallet(TOKEN_FAUCET_PKEY, new ethers.providers.JsonRpcProvider('https://rinkeby.arbitrum.io/rpc'))
    );
};

module.exports = {
    toBN,
    toBytes32,
    toIpfsHash,
    isAddress,
    getAddress,
    getKey,
    coordinator,
    controller,
    getController,
    getBalance,
    nitroFaucet,
    rinkarbyFaucet,
};
