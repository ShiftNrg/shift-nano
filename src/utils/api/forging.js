import moment from 'moment';
import { requestToActivePeer } from './peers';
// import { extractAddress } from '../api/account';

export const getForgedBlocks = (activePeer, limit = 10, offset = 0, generatorPublicKey) =>
  /*
  requestToActivePeer(activePeer, 'blocks', {
    limit,
    offset,
    generatorPublicKey,
  });
  */
  new Promise((resolve, reject) =>
    requestToActivePeer(activePeer, 'blocks', {
    // activePeer.blocks.get({
      limit,
      offset,
      generatorPublicKey,
    })
      .then((response) => {
        resolve(response);
      })
      .catch(reject),
  );

export const getForgedStats = (activePeer, startMoment, generatorPublicKey) =>
  /*
  activePeer.delegates.getForgingStatistics(
    extractAddress(generatorPublicKey),
    {
      start: moment(startMoment).unix(),
      end: moment().unix(),
    },
  );
  */
  new Promise((resolve, reject) =>
    requestToActivePeer(activePeer, 'delegates/forging/getForgedByAccount', {
      generatorPublicKey,
      start: moment(startMoment).unix(),
      end: moment().unix(),
    })
      .then((response) => {
        resolve(response);
      })
      .catch(reject),
  );

