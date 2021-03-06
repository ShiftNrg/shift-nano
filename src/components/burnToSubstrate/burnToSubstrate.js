/* eslint-disable no-constant-condition */
import React from 'react';
import Input from 'react-toolbox/lib/input';
import { IconMenu, MenuItem } from 'react-toolbox/lib/menu';
import Lisk from 'shift-js';
import { ethers } from 'ethers';
import { fromRawLsk, toRawLsk } from '../../utils/lsk';
import AuthInputs from '../authInputs';
import ActionBar from '../actionBar';
import InfoParagraph from '../infoParagraph';
import SignVerifyResult from '../signVerifyResult';
import { authStatePrefill, authStateIsValid } from '../../utils/form';
import fees from '../../constants/fees';

import styles from './burnToSubstrate.css';

class BurnToSubstrate extends React.Component {
  constructor() {
    super();
    this.state = {
      recipient: {
        value: '18446744073709551616S',
      },
      amount: {
        value: '',
      },
      reference: {
        value: '',
      },
      fee: fromRawLsk(fees.send),
      message: { value: '' },
      result: '',
      ...authStatePrefill(),
    };
    this.inputValidationRegexps = {
      recipient: /^\d{1,21}[S|s]$/,
      amount: /^\d+(\.\d{1,8})?$/,
    };
  }

  componentDidMount() {
    const newState = {
      recipient: {
        value: '18446744073709551616S',
      },
      amount: {
        value: this.props.amount || '',
      },
      fee: fromRawLsk(this.props.type ? fees[this.props.type] : fees.send),
      ...authStatePrefill(this.props.account),
    };
    this.setState(newState);
  }

  handleChange(name, value, error) {
    this.setState({
      [name]: {
        value,
        error: typeof error === 'string' ? error : this.validateInput(name, value),
      },
    });
  }

  validateInput(name, value) {
    if (!value && name !== 'reference') {
      return this.props.t('Required');
    } else if (!value.match(this.inputValidationRegexps[name])) {
      return this.props.t('Invalid');
    } else if (name === 'amount' && value > parseFloat(this.getMaxAmount())) {
      return this.props.t('Insufficient funds');
    } else if (name === 'amount' && value === '0') {
      return this.props.t('Zero not allowed');
    } else if (name === 'reference' && value.length > 64) {
      return this.props.t('Maximum length of 64 characters is exceeded.');
    } else if (name === 'message' && ethers.utils.isAddress(value)) {
      return this.props.t('Not a valid Ethereum address.');
    }
    return undefined;
  }

  send(event) {
    event.preventDefault();
    this.props.sent({
      activePeer: this.props.activePeer,
      account: this.props.account,
      recipientId: this.state.recipient.value,
      amount: this.state.amount.value,
      passphrase: this.state.passphrase.value,
      secondPassphrase: this.state.secondPassphrase.value,
      // data: this.state.reference.value,
    });
    this.setState({ executed: true });
  }

  sign(message) {
    // const signedMessage = Lisk.crypto.signMessageWithPassphrase(message,
    const signedMessage = Lisk.crypto.signMessageWithSecret(message,
      this.state.passphrase.value);
    // const result = Lisk.crypto.printSignedMessage(signedMessage);
    const result = Lisk.crypto.printSignedMessage(message,
      signedMessage, this.props.account.publicKey);
    this.setState({ result });
    return result;
  }

  showResult(event) {
    event.preventDefault();
    const result = this.sign(this.state.message.value);
    const copied = this.props.copyToClipboard(result, {
      message: this.props.t('Press #{key} to copy'),
    });
    if (copied) {
      this.props.successToast({ label: this.props.t('Result copied to clipboard') });
    }
  }

  getMaxAmount() {
    return fromRawLsk(Math.max(0, this.props.account.balance - toRawLsk(this.state.fee)));
  }

  setMaxAmount() {
    this.handleChange('amount', this.getMaxAmount());
  }

  render() {
    return (
      <div className={`${styles.send} send`}>
        <form onSubmit={this.send.bind(this)}>
          <InfoParagraph>
            {this.props.t('Abort if address below is not "18446744073709551616S"!')}
          </InfoParagraph>
          <Input label={this.props.t('Burn Address')} required={true}
            className='recipient'
            autoFocus={false}
            readOnly={true}
            error={this.state.recipient.error}
            value={this.state.recipient.value} />
          <InfoParagraph>
            {this.props.t('Enter the amount you wish to migrate to the new (Substrate-based) ShiftNrg Blockchain.')}
          </InfoParagraph>
          <Input label={this.props.t('Burn Amount')} required={true}
            className='amount'
            error={this.state.amount.error}
            value={this.state.amount.value}
            onChange={this.handleChange.bind(this, 'amount')} />
          <Input
            label={this.props.t(false ? 'Reference' : '')}
            required={false}
            className='reference'
            style={{ display: false ? '' : 'none' }}
            error={this.state.reference.error}
            value={this.state.reference.value}
            onChange={this.handleChange.bind(this, 'reference')} />
          <AuthInputs
            passphrase={this.state.passphrase}
            secondPassphrase={this.state.secondPassphrase}
            onChange={this.handleChange.bind(this)} />
          <div className={styles.fee}> {this.props.t('Fee: {{fee}} SHIFT', { fee: this.state.fee })} </div>
          <IconMenu icon='more_vert' position='topRight' menuRipple className={`${styles.sendAllMenu} transaction-amount`} >
            <MenuItem onClick={this.setMaxAmount.bind(this)}
              caption={this.props.t('Set maximum amount')}
              className='send-maximum-amount'/>
          </IconMenu>
          {/* <ActionBar
            secondaryButton={{
              onClick: this.props.closeDialog,
            }}
            primaryButton={{
              label: this.props.t('Burn-to-Substrate'),
              type: 'submit',
              disabled: (
                this.state.executed ||
                !!this.state.recipient.error ||
                !this.state.recipient.value ||
                !!this.state.amount.error ||
                !this.state.amount.value ||
                !authStateIsValid(this.state)),
            }} /> */}
        </form>

        <div className='sign-message'>
          <InfoParagraph>
            {this.props.t('Enter your substrate-Shift address below. Double check that you have the private key to this address!')}
            <br />
            {this.props.t('You\'ll be required to verify ownership of this substrate-Shift address by signing and submitting another message.')}
          </InfoParagraph>
          <InfoParagraph>
            {this.props.t('Failure to do so will make the migration process incomplete.')}
          </InfoParagraph>
          <InfoParagraph>
            {this.props.t('This 2nd step is only required once, unless your substrate-Shift address changes. Then it must be submitted again.')}
          </InfoParagraph>
          <form onSubmit={this.showResult.bind(this)} id='signMessageForm'>
            <section>
              <Input className='message' multiline label={this.props.t('substrate-Shift Address: 3xxx... ')}
                autoFocus={true}
                value={this.state.message.value}
                onChange={this.handleChange.bind(this, 'message')} />
              <AuthInputs
                passphrase={this.state.passphrase}
                secondPassphrase={this.state.secondPassphrase}
                onChange={this.handleChange.bind(this)} />
            </section>
            {this.state.result ?
              <SignVerifyResult result={this.state.result} title={this.props.t('Result')} /> :
              <ActionBar
                secondaryButton={{
                  onClick: this.props.closeDialog,
                }}
                primaryButton={{
                  label: this.props.t('Burn, Sign, and Submit 1/2'),
                  className: 'sign-button',
                  type: 'submit',
                  disabled: (!this.state.message.value ||
                    this.state.result ||
                    !authStateIsValid(this.state) ||
                    this.state.executed ||
                    !!this.state.recipient.error ||
                    !this.state.recipient.value ||
                    !!this.state.amount.error ||
                    !this.state.amount.value ||
                    !authStateIsValid(this.state)),
                }} />
            }
          </form>
        </div>
      </div>
    );
  }
}

export default BurnToSubstrate;
