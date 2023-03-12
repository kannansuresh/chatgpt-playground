export class payloadRole {
    constructor(role, icon, short, placeholder) {
        this.role = role;
        this.icon = icon;
        this.short = short;
        this.placeholder = placeholder;
    }
}
export class payloadMessage {
    constructor(role, content) {
        this.role = role;
        this.content = content;
    }
}
export class chatGPT {
    constructor(...args) {
        this.model = 'gpt-3.5-turbo';
        this.stream = true;
        this.endPoint = 'https://api.openai.com/v1/chat/completions';
        this.apiKey = '';
        if (args.length === 0) {
            this.apiKey = '';
            this.payloadMessages = [];
        }
        else if (args.length === 1) {
            this.apiKey = args[0];
            this.payloadMessages = [];
        }
        else if (args.length === 2) {
            this.apiKey = args[0];
            this.payloadMessages = args[1];
        }
        else {
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
chatGPT.roles = {
    system: new payloadRole('system', '🧠', 'sys', ''),
    user: new payloadRole('user', '👤', 'usr', 'Enter a user message here.'),
    assistant: new payloadRole('assistant', '🤖', 'ast', 'Enter an assistant message here.'),
};
