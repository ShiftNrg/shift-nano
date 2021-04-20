/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
import React from 'react';
import Input from 'react-toolbox/lib/input';
import { ethers } from 'ethers';
import ActionBar from '../actionBar';
import InfoParagraph from '../infoParagraph';
import { authStatePrefill, authStateIsValid } from '../../utils/form';
import migration from '../../constants/migration';
import styles from './submitEthSig.css';
import sendEthSig from '../../utils/api/account';

const axios = require('axios');

class SubmitEthSig extends React.Component {
  constructor() {
    super();
    this.state = {
      message: { value: '' },
      result: '',
      registeredEthAddress: 'Not Registered!',
      ...authStatePrefill(),
    };
    this.inputValidationRegexps = {
      recipient: /^\d{1,21}[S|s]$/,
      amount: /^\d+(\.\d{1,8})?$/,
    };
  }

  async componentDidMount() {
    const newState = {
      ...authStatePrefill(this.props.account),
    };
    this.setState(newState);
    this.getEthAddress();
  }

  async getEthAddress() {
    try {
      const url = `${migration.get_register_eth_address.url}/${this.props.account.address}`;
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
    } else if (!value.match(this.inputValidationRegexps[name])) {
      return this.props.t('Invalid');
    } else if (name === 'amount' && value > parseFloat(this.getMaxAmount())) {
      return this.props.t('Insufficient funds');
    } else if (name === 'amount' && value === '0') {
      return this.props.t('Zero not allowed');
    } else if (name === 'message' && !ethers.utils.isAddress(value)) {
      this.setState({ result: '' });
      return this.props.t('Not a valid Ethereum address.');
    }
    return undefined;
  }

  async submit(event) {
    event.preventDefault();
    const result = await sendEthSig();
    console.log(result);
    this.setState({ executed: true });
  }

  render() {
    return (
      <div className={`${styles.send} send`}>
        <form onSubmit={this.submit.bind(this)}>
          <div className='submit-eth-signed-message'>
            <InfoParagraph>
              {this.props.t(`Your registered Ethereum Address is: ${this.state.registeredEthAddress}`)}
            </InfoParagraph>
            <InfoParagraph>
              {this.props.t('Paste your Ethereum signed message below & click "Submit".')}
            </InfoParagraph>
            <InfoParagraph>
              {this.props.t('Failure to do so will make the migration process incomplete.')}
            </InfoParagraph>
            <InfoParagraph>
              {this.props.t('This current step is only required once, unless your Ethereum address changes. Then it must be submitted again.')}
            </InfoParagraph>
            <section>
              <Input className='message' multiline label={this.props.t('Ethereum Address: 0x...')}
                autoFocus={true}
                value={this.state.message.value}
                error={this.state.message.error}
                onChange={this.handleChange.bind(this, 'message')} />
            </section>

            {this.state.result ?
              <ActionBar
                secondaryButton={{ onClick: this.props.closeDialog }}
                primaryButton={{
                  label: this.props.t('Burn SHIFT & Submit Migration Request'),
                  className: 'sign-button',
                  type: 'submit',
                  disabled: (!this.state.message.value || !!this.state.message.error ||
                    this.state.result === '' || this.state.executed || !authStateIsValid(this.state)),
                }} /> : null
            }
          </div>
        </form>
      </div>
    );
  }
}

export default SubmitEthSig;
