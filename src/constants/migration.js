module.exports = {
  shift_submission: {
    url: 'https://wshift-migration.shiftnrg.network/shiftSig',
  },
  eth_submission: {
    url: 'https://wshift-migration.shiftnrg.network/ethSig',
  },
  get_register_eth_address: {
    url: 'https://wshift-migration.shiftnrg.network/getEthAddresses',
  },
  signedShiftMessage: {
    signedMessage: {
      message: '',
      publicKey: '',
      signature: '',
    },
    txIds: [],
  },
  signedEthMessage: {
    address: '',
    msg: '',
    sig: '',
    version: '',
    signer: '',
  },
};
