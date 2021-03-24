module.exports = {
  mainnet: { // network name translation t('Mainnet');
    name: 'Mainnet',
    // ssl: true,
    // port: 443,
    address: 'http://18.222.25.46:9305',
    code: 0,
  },
  testnet: { // network name translation t('Testnet');
    name: 'Testnet',
    testnet: true,
    address: 'http://3.1.196.88:9405',
    code: 1,
  },
  customNode: { // network name translation t('Custom Node');
    name: 'Custom Node',
    custom: true,
    address: 'http://localhost:9305',
    code: 2,
    nethash: 'net',
  },
};
