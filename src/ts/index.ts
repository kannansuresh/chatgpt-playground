import { chatGPT } from './classes.js';
import { payloadMessage } from './classes.js';
import { payloadRole } from './classes.js';
import * as manageLS from './manageLocalStorage.js';
import * as utils from './utils.js';
import { openAIChatComplete } from './openAI.js';
import * as exports from './export.js';

const chatGPTData = new chatGPT();

const systemRole = chatGPT.roles.system.role;
const userRole = chatGPT.roles.user.role;
const assistantRole = chatGPT.roles.assistant.role;

const getRole = (roleString: string) => {
  switch (roleString) {
    case systemRole:
      return chatGPT.roles.system;
    case userRole:
      return chatGPT.roles.user;
    case assistantRole:
      return chatGPT.roles.assistant;
    default:
      return new payloadRole('?', '❔', '?', 'Unknown role');
  }
};

const getIcon = (role: string) => {
  return getRole(role).icon;
};

// html elements
const chatGPTForm = document.querySelector('#chatgpt-form') as HTMLFormElement;
const switchRoleButtons = document.querySelectorAll('.role-switch') as NodeListOf<HTMLButtonElement>;
const deleteMessageButtons = document.querySelectorAll('.message-delete') as NodeListOf<HTMLButtonElement>;
const textAreas = document.querySelectorAll('textarea') as NodeListOf<HTMLTextAreaElement>;
const messagesContainer = document.querySelector('#messages-container') as HTMLDivElement;
const addMessageButton = document.querySelector('#add-message') as HTMLButtonElement;
const apiKeyInput = document.querySelector('#apiKey') as HTMLInputElement;
const saveAPIKeyCheckbox = document.querySelector('#saveAPIKey') as HTMLInputElement;

// initialize elements

manageLS.initializeForm(saveAPIKeyCheckbox, apiKeyInput);

let apiKey = apiKeyInput.value;

saveAPIKeyCheckbox.addEventListener('change', setUserPreferenceOfAPIKeySaving);

function setUserPreferenceOfAPIKeySaving() {
  const isChecked = saveAPIKeyCheckbox.checked;
  manageLS.setSaveAPIChoice(isChecked);
  if (isChecked) manageLS.setAPIKey(apiKeyInput.value);
}

apiKeyInput.addEventListener('input', () => {
  const isChecked = saveAPIKeyCheckbox.checked;
  apiKey = apiKeyInput.value;
  if (isChecked) manageLS.setAPIKey(apiKey);
});

textAreas.forEach(textAreaEventListeners);
switchRoleButtons.forEach(switchRoleEventListeners);
deleteMessageButtons.forEach(messageDeleteButtonEventListener);

addMessageButton.addEventListener('click', () => {
  addMessage();
});

window.addEventListener('resize', () => {
  textAreas.forEach(t => {
    utils.resizeTextarea(t);
  });
});

function textAreaEventListeners(textarea: HTMLTextAreaElement) {
  textarea.addEventListener('input', () => {
    utils.resizeTextarea(textarea);
  });
  textarea.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      submitForm(e);
    }
  });
}

function switchRoleEventListeners(switchRole: HTMLButtonElement) {
  switchRole.addEventListener('click', e => {
    const currentRole = switchRole.getAttribute('data-role-type');
    const newRole = currentRole === userRole ? assistantRole : userRole;
    switchRole.setAttribute('data-role-type', newRole);
    switchRole.textContent = getIcon(newRole);
    switchRole.setAttribute('title', `Switch to (${currentRole})`);
    const txtArea = switchRole.parentElement?.querySelector('textarea');
    if (txtArea) {
      txtArea.placeholder = getRole(newRole).placeholder;
    }
  });
}

function messageDeleteButtonEventListener(messageDeleteButton: HTMLButtonElement) {
  messageDeleteButton.addEventListener('click', () => {
    utils.deleteMessage(messageDeleteButton);
  });
}

chatGPTForm.addEventListener('submit', e => {
  submitForm(e);
});

function addMessage(message = '', setAsAssistant = false) {
  const allRoles = document.querySelectorAll('.role-switch');
  const lastRoleType = allRoles[allRoles.length - 1]?.getAttribute('data-role-type') || assistantRole;
  const isUser = lastRoleType === userRole;
  const newRole = setAsAssistant ? assistantRole : isUser ? assistantRole : userRole;

  const inputGroup = document.createElement('div');
  inputGroup.className = 'input-group mb-3';

  const switchRoleButton = document.createElement('button');
  switchRoleButton.className = 'btn btn-outline-secondary role-switch form-button';
  switchRoleButton.setAttribute('data-role-type', newRole);
  switchRoleButton.setAttribute('type', 'button');
  switchRoleButton.setAttribute('title', 'Switch Role');
  switchRoleButton.tabIndex = -1;
  switchRoleButton.textContent = getIcon(newRole);
  switchRoleEventListeners(switchRoleButton);

  const deleteMessageButton = document.createElement('button');
  deleteMessageButton.className = 'btn btn-outline-secondary message-delete form-button';
  const cross = String.fromCharCode(0x274c);
  deleteMessageButton.textContent = cross;
  deleteMessageButton.tabIndex = -1;
  deleteMessageButton.setAttribute('type', 'button');
  deleteMessageButton.setAttribute('title', 'Delete Message');
  messageDeleteButtonEventListener(deleteMessageButton);

  const messageInput = document.createElement('textarea');
  messageInput.className = 'form-control message-text';
  messageInput.placeholder = `Enter ${newRole === userRole ? 'a user' : 'an assistant'} message here.`;
  messageInput.setAttribute('aria-label', 'message');
  messageInput.setAttribute('rows', '1');
  messageInput.setAttribute('spellcheck', 'false');
  textAreaEventListeners(messageInput);

  inputGroup.append(switchRoleButton, messageInput, deleteMessageButton);
  messagesContainer.append(inputGroup);

  messageInput.value = message;
  messageInput.dispatchEvent(new Event('input', { bubbles: true }));
  return messageInput;
}

function getMessages(): payloadMessage[] {
  const messages: payloadMessage[] = [];
  const messageInputs = document.querySelectorAll('#messages-container .input-group');
  messageInputs.forEach(input => {
    const role = input.querySelector('button')?.dataset.roleType ?? '';
    const content = input.querySelector('textarea')?.value ?? '';
    if (!content?.trim()) return;
    messages.push({ role, content });
  });
  return messages;
}

async function submitForm(e: Event) {
  e.preventDefault();
  const messages = getMessages();
  if (messages.length === 0) return;
  let targetTextArea = null;
  let apiResponse = null;
  try {
    targetTextArea = addMessage('', true) as HTMLTextAreaElement;
    utils.addSpinner(messagesContainer);
    chatGPTData.apiKey = apiKey;
    chatGPTData.payloadMessages = messages;
    apiResponse = await openAIChatComplete(chatGPTData, targetTextArea);
  } catch (error) {
    if (targetTextArea) targetTextArea.value = 'Error fetching response.\n' + error;
  } finally {
    utils.removeSpinner();
    let lastMessage = targetTextArea;
    if (apiResponse?.result) lastMessage = addMessage();
    if (lastMessage) lastMessage.focus();
  }
}

const downloadMarkdownButton = document.getElementById('downloadMarkdown') as HTMLButtonElement;
downloadMarkdownButton.addEventListener('click', exports.downloadMarkdown);

const downloadHTMLButton = document.getElementById('downloadHTML') as HTMLButtonElement;
downloadHTMLButton.addEventListener('click', exports.downloadHTML);

const downloadPythonButton = document.getElementById('downloadPython') as HTMLButtonElement;

downloadPythonButton.addEventListener('click', e => {
  exports.downloadPython(getMessages(), chatGPTData.model);
});

const adFree = document.getElementById('ad-free') as HTMLLinkElement;

const adFreeMsg = `
Ads play an essential role in by providing the revenue needed to maintain the site and this project. Please consider using the ad enabled page to help us continue providing quality content.<br><br>

Alternatively, please support our project by sponsoring it on GitHub or <a class="col" href="https://www.buymeacoffee.com/aneejian" target="_blank">buying us a coffee</a>. Your support would be much appreciated and would help us continue creating valuable content.<br><br>

Thank you for your understanding and support!
`;

adFree.addEventListener('click', e => {
  e.preventDefault();
  utils.showModal('Ad Free', adFreeMsg, 'Continue to Ad Free Page', 'Remain Here', utils.navigateTo);
});
