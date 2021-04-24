import { errorAlertDialogDisplayed } from './dialog';
import { listAccountDelegates, listDelegates, vote } from '../utils/api/delegate';
import { passphraseUsed } from './account';
import { transactionAdded } from './transactions';
import Fees from '../constants/fees';
import actionTypes from '../constants/actions';
import transactionTypes from '../constants/transactionTypes';
import { loadingStarted, loadingFinished } from '../utils/loading';

/**
 * Add pending variable to the list of voted delegates and list of unvoted delegates
 */
export const pendingVotesAdded = () => ({
  type: actionTypes.pendingVotesAdded,
});

/**
 * Remove all data from the list of voted delegates and list of unvoted delegates
 */
export const votesUpdated = data => ({
  type: actionTypes.votesUpdated,
  data,
});

/**
 * Add data to the list of voted delegates
 */
export const votesAdded = data => ({
  type: actionTypes.votesAdded,
  data,
});

/**
 * Add data to the list of all delegates
 */
export const delegatesAdded = data => ({
  type: actionTypes.delegatesAdded,
  data,
});

/**
 * Toggles account's vote for the given delegate
 */
export const voteToggled = data => ({
  type: actionTypes.voteToggled,
  data,
});


/**
 * Updates vote lookup status of the given delegate name
 */
export const voteLookupStatusUpdated = data => ({
  type: actionTypes.voteLookupStatusUpdated,
  data,
});

/**
 * Clears all vote lookup statuses
 */
export const voteLookupStatusCleared = () => ({
  type: actionTypes.voteLookupStatusCleared,
});

/**
 * Makes Api call to register votes
 * Adds pending state and then after the duration of one round
 * cleans the pending state
 */
export const votePlaced = ({ activePeer, passphrase, account, votes, secondSecret }) =>
  (dispatch) => {
    const votedList = [];
    const unvotedList = [];

    Object.keys(votes).forEach((username) => {
      /* istanbul ignore else */
      if (!votes[username].confirmed && votes[username].unconfirmed) {
        votedList.push(votes[username].publicKey);
      } else if (votes[username].confirmed && !votes[username].unconfirmed) {
        unvotedList.push(votes[username].publicKey);
      }
    });

    loadingStarted('votePlaced');
    vote(
      activePeer,
      passphrase,
      account.publicKey,
      votedList,
      unvotedList,
      secondSecret,
    ).then((response) => {
      loadingFinished('votePlaced');
      // Add to list
      dispatch(pendingVotesAdded());

      // Add the new transaction
      // @todo Handle alerts either in transactionAdded action or middleware
      dispatch(transactionAdded({
        // id: response.id,
        id: response.transactionId,
        senderPublicKey: account.publicKey,
        senderId: account.address,
        amount: 0,
        fee: Fees.vote,
        type: transactionTypes.vote,
      }));
    }).catch((error) => {
      loadingFinished('votePlaced');
      const text = error && error.message ? `${error.message}.` : 'An error occurred while placing your vote.';
      dispatch(errorAlertDialogDisplayed({ text }));
    });
    dispatch(passphraseUsed(account.passphrase));
  };

/**
 * Gets the list of delegates current account has voted for
 *
 */
export const votesFetched = ({ activePeer, address, type }) =>
  (dispatch) => {
    loadingStarted('votesFetched');
    listAccountDelegates(activePeer, address).then(({ delegates }) => {
      loadingFinished('votesFetched');
      if (type === 'update') {
        dispatch(votesUpdated({ list: delegates }));
      } else {
        dispatch(votesAdded({ list: delegates }));
      }
    }).catch((error) => {
      loadingFinished('votesFetched');
      dispatch(errorAlertDialogDisplayed({ text: error.message }));
    });
  };

/**
 * Gets list of all delegates
 */
export const delegatesFetched = ({ activePeer, search, offset, refresh }) =>
  (dispatch) => {
    loadingStarted('delegatesFetched');
    listDelegates(
      activePeer, {
        offset,
        limit: '100',
        q: search,
        // ...(search === '' ? {} : { search }),
      },
    ).then(({ delegates, totalCount }) => {
      loadingFinished('delegatesFetched');
      dispatch(delegatesAdded({ list: delegates, totalDelegates: totalCount, refresh }));
    }).catch((error) => {
      loadingFinished('delegatesFetched');
      dispatch(errorAlertDialogDisplayed({ text: error.message }));
    });
  };

/**
 * Get list of delegates current account has voted for and dispatch it with votes from url 
 */
export const urlVotesFound = ({ activePeer, upvotes, unvotes, address }) =>
  (dispatch) => {
    const processUrlVotes = (votes) => {
      dispatch(votesAdded({ list: votes, upvotes, unvotes }));
    };
    loadingStarted('urlVotesFound');
    listAccountDelegates(activePeer, address)
      .then(({ data }) => {
        loadingFinished('urlVotesFound');
        processUrlVotes(data);
      })
      .catch(() => {
        loadingFinished('urlVotesFound');
        processUrlVotes([]);
      });
  };
