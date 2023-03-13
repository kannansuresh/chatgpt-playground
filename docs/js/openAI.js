import { resizeTextarea } from './utils.js';
export async function openAIChatComplete(gptData, textArea) {
    const previewDiv = textArea.parentElement?.querySelector('.preview');
    const url = gptData.endPoint;
    const requestData = gptData.getRequestData();
    let response;
    try {
        response = await fetch(url, requestData);
        // check for response errors
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`${error.error.code}\n${error.error.message}`);
        }
        const reader = response.body?.getReader();
        let responseText = '';
        const onData = (chunk) => {
            const textDecoder = new TextDecoder();
            const jsonString = textDecoder.decode(chunk, { stream: true });
            let jsonStrings = jsonString.split('data:');
            jsonStrings = jsonStrings.map(str => {
                if (str.includes('[DONE]')) {
                    return str.replace('[DONE]', '');
                }
                return str;
            });
            jsonStrings = jsonStrings.map(str => str.trim()).filter(str => str.length > 0);
            for (let i = 0; i < jsonStrings.length; i++) {
                const responseData = JSON.parse(jsonStrings[i]);
                const choices = responseData.choices;
                if (choices && choices.length > 0) {
                    const delta = choices[0].delta;
                    if (delta && delta.content) {
                        const content = delta.content;
                        responseText += content;
                        textArea.value += content;
                        textArea.value = textArea.value.trimStart();
                        // @ts-ignore
                        previewDiv.innerHTML = marked.parse(textArea.value);
                        // resizeTextarea(textArea);
                        textArea.scrollHeight;
                    }
                }
            }
        };
        const onDone = () => {
            textArea.value = responseText.trim();
            // @ts-ignore
            previewDiv.innerHTML = marked.parse(textArea.value);
            resizeTextarea(textArea);
        };
        const read = () => {
            return reader?.read().then(({ done, value }) => {
                if (done) {
                    onDone();
                    return;
                }
                onData(value);
                return read();
            });
        };
        await read();
        return { result: true, response: responseText.trim() };
    }
    catch (error) {
        const errorMsg = `${error}`;
        textArea.value = errorMsg;
        resizeTextarea(textArea);
        return { result: false, response: errorMsg };
    }
}
export default openAIChatComplete;
