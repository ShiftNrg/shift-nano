// import Lisk from 'shift-js';
import { requestToActivePeer } from './peers';

export const listAccountDelegates = (activePeer, address) =>
  new Promise((resolve, reject) =>
    requestToActivePeer(activePeer, 'accounts/delegates', { address })
      .then((response) => {
        const votedDelegates = response.delegates
          .map(delegate => Object.assign({}, delegate, { voted: true }));
        resolve({ delegates: votedDelegates });
      })
      .catch(reject),
  );
  // activePeer.votes.get({ address, limit: 101 });

export const listDelegates = (activePeer, options) => {
  options.sort = 'rank:asc';
  return new Promise((resolve, reject) =>
    requestToActivePeer(activePeer, `delegates/${options.q ? 'search' : ''}`, options)
      .then((response) => {
        // Restructure response to v1.0 API format
        const list = [];
        response.delegates.forEach((item) => {
          item.account = { address: item.address, publicKey: item.publicKey };
          list.push(item);
        });
        resolve({ delegates: list, totalCount: response.totalCount });
      })
      .catch(reject),
  );
  // return activePeer.delegates.get(options);
};

export const getDelegate = (activePeer, publicKey) =>
  requestToActivePeer(activePeer, 'delegates/get', publicKey);
  // activePeer.delegates.get(options);

export const vote = (activePeer, passphrase, publicKey,
  votes, unvotes, secondPassphrase = null) =>
  requestToActivePeer(activePeer, 'accounts/delegates', {
    secret: passphrase,
    publicKey,
    delegates: votes.map(delegate => `+${delegate}`).concat(unvotes.map(delegate => `-${delegate}`)),
    secondSecret: secondPassphrase,
  });
  /*
  const transaction = Lisk.transaction
    .castVotes({
      passphrase,
      votes,
      unvotes,
      secondPassphrase });
  activePeer.transactions.broadcast(transaction).then(() => {
      resolve(transaction);
    })
      .catch(reject);
    */

export const voteAutocomplete = (activePeer, username, votedDict) => {
  const options = { q: username };

  return new Promise((resolve, reject) =>
    listDelegates(activePeer, options)
      .then((response) => {
        resolve(response.delegates.filter(delegate =>
          Object.keys(votedDict).filter(item =>
            (item === delegate.username) && (item.confirmed || item.unconfirmed)).length === 0,
        ));
      })
      .catch(reject),
  );
};

export const unvoteAutocomplete = (username, votedDict) =>
  new Promise(resolve => resolve(Object.keys(votedDict)
    .filter(delegate => delegate.indexOf(username) !== -1 && votedDict[delegate].unconfirmed)
    .map(element => ({ username: element, publicKey: votedDict[element].publicKey }))),
  );

export const registerDelegate = (activePeer, username, passphrase, secondPassphrase = null) =>
  /*
  new Promise((resolve, reject) => {
    const transaction = Lisk.transaction
      .registerDelegate({
        username,
        passphrase,
        secondPassphrase });
    activePeer.transactions.broadcast(transaction).then(() => {
      resolve(transaction);
    }).catch(reject);
  });
  */
  requestToActivePeer(activePeer, 'delegates', {
    username,
    secret: passphrase,
    secondSecret: secondPassphrase,
  });
