/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
import React from 'react';
import Input from 'react-toolbox/lib/input';
import { IconMenu } from 'react-toolbox/lib/menu';
import { Button } from 'react-toolbox/lib/button';
import Lisk from 'shift-js';
import { ethers } from 'ethers';
import { fromRawLsk } from '../../utils/lsk';
import AuthInputs from '../authInputs';
import ActionBar from '../actionBar';
import InfoParagraph from '../infoParagraph';
import SignVerifyResult from '../signVerifyResult';
import { authStatePrefill, authStateIsValid } from '../../utils/form';
import migration from '../../constants/migration';
import styles from './migrateToWShift.css';

const axios = require('axios');

class MigrateToWShift extends React.Component {
  constructor() {
    super();
    this.state = {
      amount: {
        value: '0',
      },
      message: { value: '' },
      result: '',
      registeredEthAddress: 'Not Registered!',
      ...authStatePrefill(),
    };
  }

  async componentDidMount() {
    const newState = {
      amount: {
        value: fromRawLsk(Math.max(0, this.props.account.balance)),
      },
      ...authStatePrefill(this.props.account),
    };
    this.setState(newState);
    this.getEthAddress();
  }

  async getEthAddress() {
    try {
      const url = `${migration.get_register_eth_address.url}/${this.props.account.address}`;
      // console.log(url);
      const result = await axios.get(url);
      const value = result.data.body[0] ? result.data.body[0] : this.state.registeredEthAddress;
      this.setState({ registeredEthAddress: value });
    } catch (error) {
      // console.error(error);
    }
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
    } else if (name === 'message' && !ethers.utils.isAddress(value)) {
      this.setState({ result: '' });
      return this.props.t('Not a valid Ethereum address.');
    }
    return undefined;
  }

  send(event) {
    event.preventDefault();
    // this.props.sent({
    //   activePeer: this.props.activePeer,
    //   account: this.props.account,
    //   amount: this.state.amount.value,
    //   passphrase: this.state.passphrase.value,
    //   secondPassphrase: this.state.secondPassphrase.value,
    // });

    const account = this.props.account;

    this.props.submitMigration({
      message: account.message,
      publicKey: account.publicKey,
      signedMessage: account.signedMessage,
    });

    // TODO: remove this - no longer needed
    account.pendingShiftMigration = true;
    // store.dispatch(migrationSend({ migrationTxIds: txId })); // dispatch event w/ new data for new state
    this.setState({ executed: true, account });
  }

  sign(message) {
    // const signedMessage = Lisk.crypto.signMessageWithPassphrase(message,
    const signedMessage = Lisk.crypto.signMessageWithSecret(message,
      this.state.passphrase.value);
    // const result = Lisk.crypto.printSignedMessage(signedMessage);
    const result = Lisk.crypto.printSignedMessage(message,
      signedMessage, this.props.account.publicKey);

    const account = this.props.account;
    account.signedMessage = signedMessage;
    account.message = message;

    this.setState({ result, account });
    // console.log(result);
    this.props.messageSigned(this.props.account);
    return result;
  }

  showResult() {
    this.sign(this.state.message.value);
  }

  render() {
    return (
      <div className={`${styles.send} send`}>
        <form onSubmit={this.send.bind(this)}>
          <InfoParagraph>
            {this.props.t('Your entire remaining balance will be migratred to Wrapped Shift. This amount cannot be adjusted.')}
          </InfoParagraph>

          <Input label={this.props.t('Migration Amount')} required={true}
            className='amount'
            readOnly={true}
            error={this.state.amount.error}
            value={this.state.amount.value}
            onChange={this.handleChange.bind(this, 'amount')} />

          <InfoParagraph>
            {this.props.t(`Your registered Ethereum Address is: ${this.state.registeredEthAddress}`)}
          </InfoParagraph>

          <AuthInputs
            passphrase={this.state.passphrase}
            secondPassphrase={this.state.secondPassphrase}
            onChange={this.handleChange.bind(this)} />

          <IconMenu icon='more_vert' position='topRight'
            menuRipple className={`${styles.sendAllMenu} transaction-amount`} >
          </IconMenu>

          <div className='sign-message'>
            <InfoParagraph>
              {this.props.t('Enter your Ethereum address below. Then click "Sign Message".')}
              <br />
              {this.props.t('Double check that you have the private key to this address!')}
              <br />
              {this.props.t('You\'ll be required to verify ownership of this Ethereum address by signing and submitting another message.')}
            </InfoParagraph>
            <InfoParagraph>
              {this.props.t('Failure to do so will make the migration process incomplete.')}
            </InfoParagraph>
            <InfoParagraph>
              {this.props.t('The 2nd step is only required once, unless your Ethereum address changes. Then it must be submitted again.')}
            </InfoParagraph>

            <section>
              <Input className='message' multiline label={this.props.t('Ethereum Address: 0x...')}
                autoFocus={true}
                value={this.state.message.value}
                error={this.state.message.error}
                onChange={this.handleChange.bind(this, 'message')} />

              <Button onClick={this.showResult.bind(this)} label='Sign Message' flat primary />
            </section>
            <SignVerifyResult result={this.state.result} title={this.props.t('Result')} />

            {this.state.result ?
              <ActionBar
                secondaryButton={{ onClick: this.props.closeDialog }}
                primaryButton={{
                  label: this.props.t('Submit Migration Request'),
                  className: 'sign-button',
                  type: 'submit',
                  disabled: (!this.state.message.value ||
                    !!this.state.message.error ||
                    this.state.result === '' ||
                    this.state.executed ||
                    !authStateIsValid(this.state)),
                }} /> : null
            }
          </div>
        </form>
      </div>
    );
  }
}

export default MigrateToWShift;
