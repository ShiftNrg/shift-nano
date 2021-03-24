module.exports = {
  shift_submission: {
    address: 'https://wshift-migration.shift.network/shiftSig',
  },
  eth_submission: {
    address: 'https://wshift-migration.shift.network/ethSig',
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
