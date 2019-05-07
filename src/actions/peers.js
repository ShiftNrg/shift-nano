import i18next from 'i18next';
import Lisk from 'shift-js';
import actionTypes from '../constants/actions';
import { getNethash } from './../utils/api/peers';
import { errorToastDisplayed } from './toaster';
import { loadingStarted, loadingFinished } from '../utils/loading';

const peerSet = (data, config) => ({
  data: Object.assign({
    passphrase: data.passphrase,
    publicKey: data.publicKey,
    activePeer: Lisk.api(config),
    options: Lisk.api(config).options,
  }),
  type: actionTypes.activePeerSet,
});

/**
 * Returns required action object to set
 * the given peer data as active peer
 * This should be called once in login page
 *
 * @param {Object} data - Active peer data and the passphrase of account
 * @returns {Object} Action object
 */
export const activePeerSet = data =>
  (dispatch) => {
    const addHttp = (url) => {
      const reg = /^(?:f|ht)tps?:\/\//i;
      return reg.test(url) ? url : `http://${url}`;
    };
    const config = data.network || {};

    if (config.address) {
      const { hostname, port, protocol } = new URL(addHttp(config.address));

      config.node = hostname;
      config.ssl = protocol === 'https:';
      config.port = port || (config.ssl ? 443 : 80);
      config.nodes = [`${protocol}//${hostname}:${port}`];
    } else if (config.testnet) {
      config.nodes = Lisk.api(config).defaultTestnetPeers;
    } else {
      config.nodes = Lisk.api(config).defaultPeers;
    }

    if (config.testnet === undefined && config.port !== undefined) {
      config.testnet = config.port === '9405';
    }

    if (config.custom) {
      loadingStarted('getConstants');
      getNethash(Lisk.api(config)).then((response) => {
        loadingFinished('getConstants');
        config.nethash = response.nethash;
        dispatch(peerSet(data, config));
      }).catch(() => {
        loadingFinished('getConstants');
        dispatch(errorToastDisplayed({ label: i18next.t('Unable to connect to the node') }));
      });
    } else {
      dispatch(peerSet(data, config));
    }
  };


/**
 * Returns required action object to partially
 * update the active peer
 *
 * @param {Object} data - Active peer data
 * @returns {Object} Action object
 */
export const activePeerUpdate = data => ({
  data,
  type: actionTypes.activePeerUpdate,
});
