interface MessageParserProps {
  actionProvider: {
    handleMessage: (message: string) => void;
  };
}

class MessageParser {
  actionProvider: MessageParserProps['actionProvider'];

  constructor(actionProvider: MessageParserProps['actionProvider']) {
    this.actionProvider = actionProvider;
  }

  parse(message: string) {
    this.actionProvider.handleMessage(message);
  }
}

export default MessageParser;
