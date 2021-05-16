module.exports = {
  shift_submission: {
    url: 'https://wshift-migration.shiftnrg.network/shiftSig',
  },
  shutdown_shift_submission: {
    url: 'https://wshift-migratino.shfitnrg.network/shutdownShiftSig',
  },
  eth_submission: {
    url: 'https://wshift-migration.shiftnrg.network/ethSig',
  },
  get_register_eth_address: {
    url: 'https://wshift-migration.shiftnrg.network/getEthAddresses',
  },
  get_migration_status: {
    url: 'https://wshift-migration.shiftnrg.network/getMigrationStatus',
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
  shutdownShiftMessage: {
    signedMessage: {
      message: '',
      publicKey: '',
      signature: '',
    },
  },
};
