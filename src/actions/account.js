/* eslint-disable max-len */
import i18next from 'i18next';
import actionTypes from '../constants/actions';
import { setSecondPassphrase, send } from '../utils/api/account';
import { registerDelegate } from '../utils/api/delegate';
import { transactionAdded } from './transactions';
import { errorAlertDialogDisplayed } from './dialog';
import Fees from '../constants/fees';
import { toRawLsk } from '../utils/lsk';
import transactionTypes from '../constants/transactionTypes';
import { loadingStarted, loadingFinished } from '../utils/loading';

// eslint-disable-next-line no-unused-vars
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Trigger this action to update the account object
 * while already logged in
 *
 * @param {Object} data - account data
 * @returns {Object} - Action object
 */
export const accountUpdated = data => ({
  data,
  type: actionTypes.accountUpdated,
});

/**
 * Trigger this action to log out of the account
 * while already logged in
 *
 * @returns {Object} - Action object
 */
export const accountLoggedOut = () => ({
  type: actionTypes.accountLoggedOut,
});

/**
 * Trigger this action to login to an account
 * The login middleware triggers this action
 *
 * @param {Object} data - account data
 * @returns {Object} - Action object
 */
export const accountLoggedIn = data => ({
  type: actionTypes.accountLoggedIn,
  data,
});

export const passphraseUsed = data => ({
  type: actionTypes.passphraseUsed,
  data,
});

export const migrationSend = data => ({
  type: actionTypes.migrationSend,
  data,
});

export const migrationSent = data => ({
  type: actionTypes.migrationSent,
  data,
});

export const migrationReceived = data => ({
  type: actionTypes.migrationReceived,
  data,
});

export const migrationFailed = data => ({
  type: actionTypes.migrationFailed,
  data,
});

/**
 *
 */
export const secondPassphraseRegistered = ({ activePeer, secondPassphrase, account }) =>
  (dispatch) => {
    loadingStarted('secondPassphraseRegistered');
    setSecondPassphrase(activePeer, secondPassphrase, account.publicKey, account.passphrase)
      .then((data) => {
        loadingFinished('secondPassphraseRegistered');
        dispatch(transactionAdded({
          id: data.id,
          senderPublicKey: account.publicKey,
          senderId: account.address,
          amount: 0,
          fee: Fees.setSecondPassphrase,
          type: transactionTypes.setSecondPassphrase,
        }));
      }).catch((error) => {
        loadingFinished('secondPassphraseRegistered');
        const text = (error && error.message) ? error.message : i18next.t('An error occurred while registering your second passphrase. Please try again.');
        dispatch(errorAlertDialogDisplayed({ text }));
      });
    dispatch(passphraseUsed(account.passphrase));
  };

/**
 *
 */
export const delegateRegistered = ({
  activePeer, account, passphrase, username, secondPassphrase }) =>
  (dispatch) => {
    loadingStarted('delegateRegistered');
    registerDelegate(activePeer, username, passphrase, secondPassphrase)
      .then((data) => {
        loadingFinished('delegateRegistered');
        // dispatch to add to pending transaction
        dispatch(transactionAdded({
          id: data.id,
          senderPublicKey: account.publicKey,
          senderId: account.address,
          username,
          amount: 0,
          fee: Fees.registerDelegate,
          type: transactionTypes.registerDelegate,
        }));
      })
      .catch((error) => {
        loadingFinished('delegateRegistered');
        const text = error && error.message ? `${error.message}.` : i18next.t('An error occurred while registering as delegate.');
        const actionObj = errorAlertDialogDisplayed({ text });
        dispatch(actionObj);
      });
    dispatch(passphraseUsed(passphrase));
  };

/**
 * This is the default method used for sending SHIFT
 */
export const sent = ({ activePeer, account, recipientId, amount, passphrase, secondPassphrase/* , data */ }) =>
  (dispatch) => {
    loadingStarted('sent');
    send(activePeer, recipientId, toRawLsk(amount), passphrase, secondPassphrase/* , data */)
      .then((res) => {
        loadingFinished('sent');
        dispatch(transactionAdded({
          id: res.id,
          senderPublicKey: account.publicKey,
          senderId: account.address,
          recipientId,
          amount: toRawLsk(amount),
          fee: Fees.send,
          type: transactionTypes.send,
        }));
      })
      .catch((error) => {
        loadingFinished('sent');
        const text = error && error.message ? `${error.message}.` : i18next.t('An error occurred while creating the transaction.');
        dispatch(errorAlertDialogDisplayed({ text }));
      });
    dispatch(passphraseUsed(passphrase));
  };

  /**
   * 
   * @param {*} param0 
   * @returns 
   */
export const sentMigration = ({ activePeer, account, recipientId, amount, passphrase, secondPassphrase/* , data */ }) =>
  (dispatch) => {
    loadingStarted('sent');
    send(activePeer, recipientId, toRawLsk(amount), passphrase, secondPassphrase/* , data */)
      .then(async (res) => {
        loadingFinished('sent');
        dispatch(transactionAdded({
          id: res.id,
          senderPublicKey: account.publicKey,
          senderId: account.address,
          recipientId,
          amount: toRawLsk(amount),
          fee: Fees.send,
          type: transactionTypes.send,
        }));
        return res;
      })
      .catch((error) => {
        loadingFinished('sent');
        const text = error && error.message ? `${error.message}.` : i18next.t('An error occurred while creating the transaction.');
        dispatch(errorAlertDialogDisplayed({ text }));
      });
    // .then((res) => {
    //   dispatch(migrationSent());
    //   sendMigration(account.message, account.publicKey, account.signedMessage)
    //     .then((result) => {
    //       dispatch(migrationReceived());
    //       console.log(JSON.stringify(res));
    //       console.log(result);
    //     })
    //     .catch((error) => {
    //       dispatch(migrationFailed());
    //       console.log(error);
    //     });
    // });
    dispatch(passphraseUsed(passphrase));
  };
