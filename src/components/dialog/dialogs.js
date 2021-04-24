import i18next from 'i18next';
import ReceiveDialog from '../receiveDialog';
import Register from '../register';
import RegisterDelegate from '../registerDelegate';
import SavedAccounts from '../savedAccounts';
import SecondPassphrase from '../secondPassphrase';
import Send from '../send';
import Settings from '../settings';
import SignMessage from '../signMessage';
import VerifyMessage from '../verifyMessage';
import VoteDialog from '../voteDialog';
import EncryptMessage from '../encryptMessage';
import DecryptMessage from '../decryptMessage';
import BurnToWShift from '../burnToWShift';
import BurnToSubstrate from '../burnToSubstrate';
import SubmitEthSig from '../submitEthSig';

export default () => ({
  send: {
    title: i18next.t('Send'),
    component: Send,
  },
  'register-delegate': {
    title: i18next.t('Register as delegate'),
    component: RegisterDelegate,
  },
  'sign-message': {
    title: i18next.t('Sign message'),
    component: SignMessage,
  },
  'verify-message': {
    title: i18next.t('Verify message'),
    component: VerifyMessage,
  },
  'register-second-passphrase': {
    title: i18next.t('Register Second Passphrase'),
    component: SecondPassphrase,
  },
  vote: {
    title: i18next.t('Vote for delegates'),
    component: VoteDialog,
  },
  receive: {
    title: i18next.t('Receive SHIFT'),
    component: ReceiveDialog,
  },
  register: {
    title: i18next.t('New Account'),
    component: Register,
  },
  'saved-accounts': {
    title: i18next.t('Saved accounts'),
    component: SavedAccounts,
  },
  settings: {
    title: i18next.t('Settings'),
    component: Settings,
  },
  'encrypt-message': {
    title: i18next.t('Encrypt message'),
    component: EncryptMessage,
  },
  'decrypt-message': {
    title: i18next.t('Decrypt message'),
    component: DecryptMessage,
  },
  'burn-wshift': {
    title: i18next.t('Burn-to-wSHIFT'),
    component: BurnToWShift,
  },
  'burn-substrate': {
    title: i18next.t('Burn-to-Substrate'),
    component: BurnToSubstrate,
  },
  'submit-ethSig': {
    title: i18next.t('Submit-Eth-Sig'),
    component: SubmitEthSig,
  },
});
