/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
import React from 'react';
import Input from 'react-toolbox/lib/input';
import ActionBar from '../actionBar';
import InfoParagraph from '../infoParagraph';
import { authStatePrefill } from '../../utils/form';
import migration from '../../constants/migration';
import styles from './submitEthSig.css';

const axios = require('axios');

class SubmitEthSig extends React.Component {
  constructor() {
    super();
    this.state = {
      // eslint-disable-next-line no-useless-concat
      // message: { value: '{ "address": "0x1cf6119fe0cb30f7ceca279836b67988ec4d1152", "msg": "8065339284245106210S", "sig":' +
      // '"0xae5c680f47a871a14a144134437d790a7b9e7d1c6d8f34e7acefc241519922fb1f3e2996463d327c74a12dab79157635b1e50836a9bcfb8efe9d40680684111600", "version": "3", "signer": "ledger" }' },
      message: { value: '' },
      result: '',
      registeredEthAddress: 'Not Registered!',
      ...authStatePrefill(),
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
    if (name === 'message' && value.length < 80) {
      this.setState({ result: '' });
      return this.props.t('Not a valid Ethereum address.');
    }
    return undefined;
  }

  submit(event) {
    event.preventDefault();
    const result = this.submitSignedEthMessage();
    console.log(result);
    this.setState({ executed: true });
  }


  async submitSignedEthMessage() {
    const url = migration.eth_submission.url;
    const payload = this.state.message.value;

    let result = null;

    try {
      console.log(url);
      console.log(JSON.stringify(payload).replace(/\\/g, ''));

      result = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
    return result;
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
              <Input className='message' multiline={true} label={this.props.t('Ethereum Signed Message: {...}')}
                autoFocus={true}
                value={this.state.message.value}
                error={this.state.message.error}
                onChange={this.handleChange.bind(this, 'message')} />
            </section>

            <ActionBar secondaryButton={{ onClick: this.props.closeDialog }}
              primaryButton={{ label: this.props.t('Submit'), className: 'submit-button', type: 'submit', disabled: (!this.state.message.value),
              }} />
          </div>
        </form>
      </div>
    );
  }
}

export default SubmitEthSig;
