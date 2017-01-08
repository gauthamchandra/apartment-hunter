class SlackMessageBuilder {
  constructor() {
    this.formattedMsg = '';
  }

  addBoldText(msg) {
    this.formattedMsg += `*${msg}*`;
    return this;
  }

  addNormalText(msg) {
    this.formattedMsg += msg;
    return this;
  }

  addLinkText(link) {
    this.formattedMsg += `<${link}>`;
    return this;
  }

  addNewLine() {
    this.formattedMsg += '\n';
    return this;
  }

  build() {
    return this.formattedMsg;
  }
}

module.exports = SlackMessageBuilder;
