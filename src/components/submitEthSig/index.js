import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { successToastDisplayed, errorToastDisplayed } from '../../actions/toaster';
import { sent } from '../../actions/account';
import SubmitEthSig from './submitEthSig';

const mapStateToProps = state => ({
  account: state.account,
  activePeer: state.peers.data,
});

const mapDispatchToProps = dispatch => ({
  sent: data => dispatch(sent(data)),
  successToast: data => dispatch(successToastDisplayed(data)),
  errorToast: data => dispatch(errorToastDisplayed(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(SubmitEthSig));
