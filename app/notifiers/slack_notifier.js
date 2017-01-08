const Promise = global.Promise
    , fetch = require('node-fetch');

class SlackNotifier {
  constructor(opts = {}) {
    if (typeof opts.webhook_url !== 'string') {
      throw new Error('A webhook URL is needed to send messages');
    }

    this.webhook_url = opts.webhook_url;
    this.icon_url = opts.icon_url;
  }

  /**
   * @param msg - the formatted msg string for slack.
   *
   * @see SlackMessageBuilder
   * */
  sendMessage(msg) {
    return new Promise((resolve, reject) => {
     fetch(this.webhook_url, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ text: msg }),
     })
     .then(res => { resolve(res) })
     .catch(err => { reject(err); });
    });
  }
}

module.exports = SlackNotifier;
