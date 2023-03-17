import { chatGPT } from './classes.js';
import { resizeTextarea, getPreviewHtml } from './utils.js';

let reader: ReadableStreamDefaultReader | undefined;

export function stopStream() {
  console.log('Reader is: ' + reader);

  if (reader) {
    reader.cancel();
  }
}

export async function openAIChatComplete(gptData: chatGPT, textArea: HTMLTextAreaElement) {
  const previewDiv = textArea.parentElement?.querySelector('.preview') as HTMLDivElement;
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

    reader = response.body?.getReader();
    let responseText = '';

    const onData = (chunk: BufferSource | undefined) => {
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

      textArea.classList.remove('hidden');
      previewDiv.classList.add('hidden');

      for (let i = 0; i < jsonStrings.length; i++) {
        const responseData = JSON.parse(jsonStrings[i]);
        const choices = responseData.choices;
        if (choices && choices.length > 0) {
          const delta = choices[0].delta;
          if (delta && delta.content) {
            const content = delta.content;
            responseText += content;
            updateTextAreaAndPreview(textArea, previewDiv, content);
          }
        }
      }
    };

    const onDone = () => {
      updateTextAreaAndPreview(textArea, previewDiv, responseText, true);
    };

    const read: any = () => {
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
  } catch (error) {
    const errorMsg = `${error}`;
    updateTextAreaAndPreview(textArea, previewDiv, errorMsg, true, true);
    console.log(errorMsg);
    return { result: false, response: errorMsg };
  } finally {
    textArea.placeholder = chatGPT.roles['assistant'].placeholder;
  }
}

function updateTextAreaAndPreview(
  textArea: HTMLTextAreaElement,
  previewDiv: HTMLDivElement,
  text: string,
  responseComplete: boolean = false,
  error: boolean = false
) {
  textArea.value += text;
  textArea.value = textArea.value.trimStart();
  // @ts-ignore
  previewDiv.innerHTML = getPreviewHtml(textArea.value);
  resizeTextarea(textArea);
  textArea.scrollHeight;
  if (responseComplete) {
    textArea.value = error ? text : text.trim();
    // @ts-ignore
    previewDiv.innerHTML = getPreviewHtml(textArea.value);
    resizeTextarea(textArea);
    textArea.classList.add('hidden');
    previewDiv.classList.remove('hidden');
  }
}

export default openAIChatComplete;
