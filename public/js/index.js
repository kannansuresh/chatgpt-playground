import { chatGPT } from './classes.js';
import { payloadRole } from './classes.js';
import * as manageLS from './manageLocalStorage.js';
import * as utils from './utils.js';
import { openAIChatComplete } from './openAI.js';
import * as exports from './export.js';
const chatGPTData = new chatGPT();
const systemRole = chatGPT.roles.system.role;
const userRole = chatGPT.roles.user.role;
const assistantRole = chatGPT.roles.assistant.role;
const getRole = (roleString) => {
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
const getIcon = (role) => {
    return getRole(role).icon;
};
// html elements
const chatGPTForm = document.querySelector('#chatgpt-form');
const switchRoleButtons = document.querySelectorAll('.role-switch');
const deleteMessageButtons = document.querySelectorAll('.message-delete');
const textAreas = document.querySelectorAll('textarea');
const messagesContainer = document.querySelector('#messages-container');
const addMessageButton = document.querySelector('#add-message');
const apiKeyInput = document.querySelector('#apiKey');
const saveAPIKeyCheckbox = document.querySelector('#saveAPIKey');
// initialize elements
manageLS.initializeForm(saveAPIKeyCheckbox, apiKeyInput);
let apiKey = apiKeyInput.value;
saveAPIKeyCheckbox.addEventListener('change', setUserPreferenceOfAPIKeySaving);
function setUserPreferenceOfAPIKeySaving() {
    const isChecked = saveAPIKeyCheckbox.checked;
    manageLS.setSaveAPIChoice(isChecked);
    if (isChecked)
        manageLS.setAPIKey(apiKeyInput.value);
}
apiKeyInput.addEventListener('input', () => {
    const isChecked = saveAPIKeyCheckbox.checked;
    apiKey = apiKeyInput.value;
    if (isChecked)
        manageLS.setAPIKey(apiKey);
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
function textAreaEventListeners(textarea) {
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
function switchRoleEventListeners(switchRole) {
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
function messageDeleteButtonEventListener(messageDeleteButton) {
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
function getMessages() {
    const messages = [];
    const messageInputs = document.querySelectorAll('#messages-container .input-group');
    messageInputs.forEach(input => {
        const role = input.querySelector('button')?.dataset.roleType ?? '';
        const content = input.querySelector('textarea')?.value ?? '';
        if (!content?.trim())
            return;
        messages.push({ role, content });
    });
    return messages;
}
async function submitForm(e) {
    e.preventDefault();
    const messages = getMessages();
    if (messages.length === 0)
        return;
    let targetTextArea = null;
    let apiResponse = null;
    try {
        targetTextArea = addMessage('', true);
        utils.addSpinner(messagesContainer);
        chatGPTData.apiKey = apiKey;
        chatGPTData.payloadMessages = messages;
        apiResponse = await openAIChatComplete(chatGPTData, targetTextArea);
    }
    catch (error) {
        if (targetTextArea)
            targetTextArea.value = 'Error fetching response.\n' + error;
    }
    finally {
        utils.removeSpinner();
        let lastMessage = targetTextArea;
        if (apiResponse?.result)
            lastMessage = addMessage();
        if (lastMessage)
            lastMessage.focus();
    }
}
const downloadMarkdownButton = document.getElementById('downloadMarkdown');
downloadMarkdownButton.addEventListener('click', exports.downloadMarkdown);
const downloadHTMLButton = document.getElementById('downloadHTML');
downloadHTMLButton.addEventListener('click', exports.downloadHTML);
const downloadPythonButton = document.getElementById('downloadPython');
downloadPythonButton.addEventListener('click', e => {
    exports.downloadPython(getMessages(), chatGPTData.model);
});