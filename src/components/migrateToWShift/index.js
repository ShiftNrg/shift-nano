import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { messageSigned, sent } from '../../actions/account';
import MigrateToWShift from './migrateToWShift';

const mapStateToProps = state => ({
  account: state.account,
  activePeer: state.peers.data,
});

const mapDispatchToProps = dispatch => ({
  sent: data => dispatch(sent(data)),
  messageSigned: data => dispatch(messageSigned(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(MigrateToWShift));
