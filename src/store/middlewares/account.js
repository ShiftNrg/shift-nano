import i18next from 'i18next';
import { getAccount, transactions as getTransactions, sendMigration } from '../../utils/api/account';
// eslint-disable-next-line max-len
import { accountUpdated, accountLoggedIn, migrationSent, migrationReceived, migrationFailed } from '../../actions/account';
import { transactionsUpdated } from '../../actions/transactions';
import { activePeerUpdate } from '../../actions/peers';
import { votesFetched } from '../../actions/voting';
import actionTypes from '../../constants/actions';
import { fetchAndUpdateForgedBlocks } from '../../actions/forging';
import { getDelegate } from '../../utils/api/delegate';
import transactionTypes from '../../constants/transactionTypes';
import { loadingStarted, loadingFinished } from '../../utils/loading';
import { successToastDisplayed, errorToastDisplayed } from '../../actions/toaster';

const updateTransactions = (store, peers, account) => {
  loadingStarted('updateTransactions');
  const maxBlockSize = 25;
  getTransactions(peers.data, account.address, maxBlockSize)
    .then((response) => {
      loadingFinished('updateTransactions');
      store.dispatch(transactionsUpdated({
        confirmed: response.transactions,
        count: parseInt(response.count, 10),
      }));
    });
};

const hasRecentTransactions = txs => (
  txs.confirmed.filter(tx => tx.confirmations < 1000).length !== 0 ||
  txs.pending.length !== 0
);

const updateAccountData = (store, action) => {
  loadingStarted('updateTransactions');
  const { peers, account, transactions } = store.getState();

  getAccount(peers.data, account.address).then((result) => {
    loadingFinished('updateTransactions');
    if (result.balance !== account.balance) {
      if (!action.data.windowIsFocused || !hasRecentTransactions(transactions)) {
        updateTransactions(store, peers, account);
      }
      if (account.isDelegate) {
        store.dispatch(fetchAndUpdateForgedBlocks({
          activePeer: peers.data,
          limit: 10,
          offset: 0,
          generatorPublicKey: account.publicKey,
        }));
      }
    }
    store.dispatch(accountUpdated(result));
    store.dispatch(activePeerUpdate({ online: true }));
  }).catch((res) => {
    store.dispatch(activePeerUpdate({ online: false, code: res.error.code }));
  });
};

const getRecentTransactionOfType = (transactionsList, type) => (
  transactionsList.filter(transaction => (
    transaction.type === type &&
    // limit the number of confirmations to 5 to not fire each time there is another new transaction
    // theoretically even less then 5, but just to be on the safe side
    transaction.confirmations < 5))[0]
);

const delegateRegistration = (store, action) => {
  const delegateRegistrationTx = getRecentTransactionOfType(
    action.data.confirmed, transactionTypes.registerDelegate);
  const state = store.getState();

  if (delegateRegistrationTx) {
    loadingStarted('delegateRegistrationTx');
    getDelegate(state.peers.data, { publicKey: state.account.publicKey })
      .then((delegateData) => {
        loadingFinished('delegateRegistrationTx');
        store.dispatch(accountLoggedIn(Object.assign({},
          { delegate: delegateData.delegate, isDelegate: true })));
      });
  }
};

const votePlaced = (store, action) => {
  const voteTransaction = getRecentTransactionOfType(
    action.data.confirmed, transactionTypes.vote);

  if (voteTransaction) {
    const state = store.getState();
    const { peers, account } = state;

    store.dispatch(votesFetched({
      activePeer: peers.data,
      address: account.address,
      type: 'update',
    }));
  }
};

const passphraseUsed = (store, action) => {
  if (!store.getState().account.passphrase) {
    store.dispatch(accountUpdated({ passphrase: action.data }));
  }
};


// eslint-disable-next-line no-unused-vars
const submitBurnedMigration = async (store, action) => {
  const { account } = store.getState();

  store.dispatch(migrationSent());

  sendMigration(account.message, account.publicKey, account.signedMessage /* , txIds */)
    .then((result) => {
      store.dispatch(migrationReceived());
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(result));
    })
    .catch((error) => {
      store.dispatch(migrationFailed());
      // eslint-disable-next-line no-console
      console.log(error);
    });
};

const checkTransactionsAndUpdateAccount = (store, action) => {
  const state = store.getState();
  const { peers, account, transactions } = state;

  if (action.data.windowIsFocused && hasRecentTransactions(transactions)) {
    updateTransactions(store, peers, account);
  }

  const tx = action.data.block.transactions || [];
  const accountAddress = state.account.address;
  const blockContainsRelevantTransaction = tx.filter((transaction) => {
    const sender = transaction ? transaction.senderId : null;
    const recipient = transaction ? transaction.recipientId : null;
    return accountAddress === recipient || accountAddress === sender;
  }).length > 0;
  // const emptyPayloadHash = ' e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  // const blockContainsRelevantTransaction = action.data.block.payloadHash !== emptyPayloadHash;

  if (blockContainsRelevantTransaction) {
    updateAccountData(store, action);
  }

  // // check for pending shift migration burn tx
  // if (account.pendingShiftMigration) {
  //   // might have to loop through last 5-10 tx and send any tx id that match
  //   console.log(JSON.stringify(transactions.confirmed[0]));
  //   const burnedTx = transactions.confirmed[0];
  //   if (burnedTx.recipientId === '18446744073709551616S') {
  //     const txId = burnedTx.id;
  //     console.log(`tx id from account middleware: ${txId}`);
  //     store.dispatch(migrationSend({ migrationTxIds: txId })); // dispatch event w/ new data for new state
  //   }
  //   // store.dispatch(EVENT(data)); // dispatch event w/ new data for new state
  // }
};

const accountMiddleware = store => next => (action) => {
  next(action);
  switch (action.type) {
    // update on login because the 'save account' button
    // depends on a rerendering of the page
    // TODO: fix the 'save account' path problem, so we can remove this
    case actionTypes.accountLoggedIn:
      updateAccountData(store, action);
      break;
    case actionTypes.newBlockCreated:
      checkTransactionsAndUpdateAccount(store, action);
      break;
    case actionTypes.transactionsUpdated:
      delegateRegistration(store, action);
      votePlaced(store, action);
      break;
    case actionTypes.passphraseUsed:
      passphraseUsed(store, action);
      break;
    case actionTypes.migrationReceived:
      // showMigrationDialog(store, action); // won't close? fml
      store.dispatch(successToastDisplayed({ label: i18next.t('Shift Migration Request: Success!') }));
      break;
    case actionTypes.migrationFailed:
      store.dispatch(errorToastDisplayed({ label: i18next.t('Shift Migration Request: Failed!') }));
      break;
    default: break;
  }
};

export default accountMiddleware;
