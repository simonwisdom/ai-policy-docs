import DOMPurify from 'dompurify';

interface ActionProviderProps {
  createChatBotMessage: (message: string, options: object) => any;
  setState: (callback: (prevState: any) => any) => void;
  createClientMessage: (message: string) => void;
}

class ActionProvider {
  createChatBotMessage: ActionProviderProps['createChatBotMessage'];
  setState: ActionProviderProps['setState'];
  createClientMessage: ActionProviderProps['createClientMessage'];

  constructor(
    createChatBotMessage: ActionProviderProps['createChatBotMessage'],
    setState: ActionProviderProps['setState'],
    createClientMessage: ActionProviderProps['createClientMessage'],
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setState;
    this.createClientMessage = createClientMessage;
  }

  handleMessage = async (message: string) => {
    this.createClientMessage(message);

    try {
      const backendUrl = import.meta.env.MODE === 'production'
        ? `${import.meta.env.VITE_BACKEND_URL_PROD || 'https://ai-policy-docs-production.up.railway.app'}/api/algolia_search?query=${encodeURIComponent(message)}`
        : `${import.meta.env.VITE_BACKEND_URL_DEV || 'http://localhost:3001'}/api/algolia_search?query=${encodeURIComponent(message)}`;

      console.log(`Sending request to: ${backendUrl}`);
      const response = await fetch(backendUrl);
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const parsedResponse = await response.json();
      console.log('Parsed response:', parsedResponse);

      if (parsedResponse.llmResponse && parsedResponse.searchResults) {
        const llmResponse = parsedResponse.llmResponse;
        const searchResults = parsedResponse.searchResults;

        this.setState((prevState: any) => ({
          ...prevState,
          searchResults: searchResults,
          llmResponse: llmResponse,
        }));

        const botMessage = this.createChatBotMessage('Search results are available.', { delay: 500 });
        this.setState((prevState: any) => ({
          ...prevState,
          messages: [...prevState.messages, botMessage],
        }));
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      const botMessage = this.createChatBotMessage(DOMPurify.sanitize('Sorry, there was an error processing your request.'), { delay: 500 });
      this.setState((prevState: any) => ({
        ...prevState,
        messages: [...prevState.messages, botMessage],
      }));
    }
  };
}

export default ActionProvider;