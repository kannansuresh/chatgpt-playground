export class payloadRole {
  role: string;
  icon: string;
  short: string;
  placeholder: string;
  constructor(role: string, icon: string, short: string, placeholder: string) {
    this.role = role;
    this.icon = icon;
    this.short = short;
    this.placeholder = placeholder;
  }
}

export class payloadMessage {
  role: string;
  content: string;
  constructor(role: string, content: string) {
    this.role = role;
    this.content = content;
  }
}

export class chatGPT {
  model: string = 'gpt-3.5-turbo';
  stream: boolean = true;
  endPoint: string = 'https://api.openai.com/v1/chat/completions';
  payloadMessages: payloadMessage[];
  apiKey: string;
  static roles = {
    system: new payloadRole('system', '🧠', 'sys', ''),
    user: new payloadRole('user', '👤', 'usr', 'Enter a user message here.'),
    assistant: new payloadRole('assistant', '🤖', 'ast', 'Enter an assistant message here.'),
  };

  constructor();
  constructor(apiKey: string);
  constructor(apiKey: string, payloadMessages: payloadMessage[]);
  constructor(apiKey: string, model: string, stream: boolean, endPoint: string, payloadMessages: payloadMessage[]);

  constructor(...args: any[]) {
    this.apiKey = '';
    if (args.length === 0) {
      this.apiKey = '';
      this.payloadMessages = [];
    } else if (args.length === 1) {
      this.apiKey = args[0];
      this.payloadMessages = [];
    } else if (args.length === 2) {
      this.apiKey = args[0];
      this.payloadMessages = args[1];
    } else {
      this.model = args[0];
      this.stream = args[1];
      this.endPoint = args[2];
      this.payloadMessages = args[3];
    }
  }

  getRequestData() {
    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: this.payloadMessages,
        stream: this.stream,
      }),
    };
  }
}
