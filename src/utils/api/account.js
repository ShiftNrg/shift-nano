import Lisk from 'shift-js';
import { requestToActivePeer } from './peers';

export const getAccount = (activePeer, address) =>
  new Promise((resolve, reject) => {
    activePeer.getAccount(address, (data) => {
      if (data.success) {
        localStorage.setItem('lastActiveAccount', JSON.stringify(data.account));
        resolve({
          ...data.account,
          serverPublicKey: data.account.publicKey,
        });
      } else if (!data.success && data.error === 'Account not found') {
        // when the account has no transactions yet (therefore is not saved on the blockchain)
        // this endpoint returns {"success":false,"error":"Account not found"}
        resolve({
          address,
          balance: 0,
        });
      } else {
        reject(data);
      }
    });
  });

export const setSecondPassphrase = (activePeer, secondPassphrase, publicKey, passphrase) =>
  /*
  new Promise((resolve, reject) => {
    const transaction = Lisk.transaction
      .registerSecondPassphrase({ passphrase, secondPassphrase });
    activePeer.transactions.broadcast(transaction).then(() => {
      resolve(transaction);
    }).catch(reject);
  });
  */
  requestToActivePeer(activePeer, 'signatures', {
    secondSecret: secondPassphrase,
    secret: passphrase,
    publicKey,
  });

export const send = (activePeer, recipientId, amount,
  passphrase, secondPassphrase = null/* , data = null */) =>
  /*
  new Promise((resolve, reject) => {
    const transaction = Lisk.transaction
      .transfer({
        recipientId,
        amount,
        passphrase,
        secondPassphrase,
        // data,
      });
    activePeer.transactions.broadcast(transaction).then(() => {
      resolve(transaction);
    }).catch(reject);
  });
  */
  requestToActivePeer(activePeer, 'transactions', {
    recipientId,
    amount,
    secret: passphrase,
    secondSecret: secondPassphrase,
  });

export const transactions = (activePeer, address, limit = 20, offset = 0, orderBy = 'timestamp:desc') =>
  requestToActivePeer(activePeer, 'transactions', {
  // activePeer.transactions.get({
    // senderIdOrRecipientId: address,
    senderId: address,
    recipientId: address,
    limit,
    offset,
    orderBy,
  });

export const unconfirmedTransactions = (activePeer, address, limit = 20, offset = 0, orderBy = 'timestamp:desc') =>
  requestToActivePeer(activePeer, 'transactions/unconfirmed', {
  // activePeer.node.getTransactions('unconfirmed', {
    senderId: address,
    recipientId: address,
    limit,
    offset,
    orderBy,
  });

export const extractPublicKey = passphrase =>
  Lisk.crypto.getKeys(passphrase).publicKey;

/**
 * @param {String} data - passphrase or public key
 */
export const extractAddress = (data) => {
  if (data.indexOf(' ') < 0) {
    return Lisk.crypto.getAddressFromPublicKey(data);
  }
  return Lisk.crypto.getAddressFromPassphrase(data);
};
