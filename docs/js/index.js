import { chatGPT } from './classes.js';
import { payloadRole } from './classes.js';
import * as manageLS from './manageLocalStorage.js';
import * as utils from './utils.js';
import { openAIChatComplete, stopStream } from './openAI.js';
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
const modelSelect = document.querySelector('#chatgpt-model');
// initialize elements
manageLS.initializeForm(saveAPIKeyCheckbox, apiKeyInput);
let apiKey = apiKeyInput.value;
saveAPIKeyCheckbox.addEventListener('change', setUserPreferenceOfAPIKeySaving);
let storedModel = manageLS.getModel();
if (storedModel)
    modelSelect.value = storedModel;
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
textAreas.forEach(utils.resizeTextarea);
switchRoleButtons.forEach(switchRoleEventListeners);
deleteMessageButtons.forEach(messageDeleteButtonEventListener);
const textAreaDisplayProperties = textAreas[0].style.display;
textAreas.forEach(createPreviewDiv);
function createPreviewDiv(textArea) {
    const previewDiv = document.createElement('div');
    previewDiv.classList.add('preview');
    previewDiv.style.display = textAreaDisplayProperties;
    previewDiv.tabIndex = 0;
    textArea.parentElement?.insertBefore(previewDiv, textArea);
    const classes = textArea.classList;
    classes.forEach(c => {
        previewDiv.classList.add(c);
    });
    textArea.classList.add('hidden');
    setPreviewHTML(previewDiv, textArea);
    previewEventListeners(previewDiv);
    return previewDiv;
}
function previewEventListeners(preview) {
    const textArea = preview.parentElement?.querySelector('textarea');
    function showTextArea() {
        textArea.classList.remove('hidden');
        textArea.style.display = textAreaDisplayProperties;
        utils.resizeTextarea(textArea);
        textArea.focus();
        preview.style.display = 'none';
    }
    ['click', 'focus'].forEach(e => {
        preview.addEventListener(e, showTextArea);
    });
}
addMessageButton.addEventListener('click', () => {
    addMessage();
});
window.addEventListener('resize', () => {
    textAreas.forEach(utils.resizeTextarea);
});
modelSelect.addEventListener('change', () => {
    chatGPTData.model = modelSelect.value;
    manageLS.setModel(modelSelect.value);
});
function textAreaEventListeners(textarea) {
    textarea.addEventListener('input', e => {
        utils.resizeTextarea(textarea);
    });
    textarea.addEventListener('focus', e => {
        utils.resizeTextarea(textarea);
    });
    textarea.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            submitForm(e);
        }
    });
    textarea.addEventListener('blur', () => {
        const preview = textarea.parentElement?.querySelector('.preview');
        preview.style.display = textAreaDisplayProperties;
        setPreviewHTML(preview, textarea);
        textarea.style.display = 'none';
    });
}
function setPreviewHTML(preview, textarea) {
    //@ts-ignore
    const parsedMarkdown = utils.getPreviewHtml(textarea.value);
    const previewHtml = textarea.value.trim() ? `<div>${parsedMarkdown}</div>` : `<span class="text-muted">${textarea.placeholder}</span>`;
    preview.innerHTML = previewHtml;
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
            const previewDiv = switchRole.parentElement?.querySelector('.preview');
            if (previewDiv)
                setPreviewHTML(previewDiv, txtArea);
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
    messageInput.placeholder = setAsAssistant ? 'Fetching response...' : getRole(newRole).placeholder;
    messageInput.setAttribute('aria-label', 'message');
    messageInput.setAttribute('rows', '1');
    messageInput.setAttribute('spellcheck', 'false');
    textAreaEventListeners(messageInput);
    inputGroup.append(switchRoleButton, messageInput, deleteMessageButton);
    messagesContainer.append(inputGroup);
    messageInput.value = message;
    messageInput.dispatchEvent(new Event('input', { bubbles: true }));
    createPreviewDiv(messageInput);
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
        const spinnerDiv = utils.addSpinner(messagesContainer);
        spinnerDiv.querySelector('button')?.addEventListener('click', () => {
            stopStream();
        });
        chatGPTData.apiKey = apiKey;
        chatGPTData.payloadMessages = messages;
        apiResponse = await openAIChatComplete(chatGPTData, targetTextArea);
    }
    catch (error) {
        if (targetTextArea)
            targetTextArea.value = 'Error fetching response.\n\n' + error;
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
const adFree = document.getElementById('ad-free');
const adFreeMsg = `
Ads play an essential role in providing the revenue needed to maintain the site and this project. Please consider using the ad enabled page to help us continue providing quality content.<br><br>

Alternatively, please support our project by sponsoring it on GitHub or <a class="col" href="https://www.buymeacoffee.com/aneejian" target="_blank">buying us a coffee</a>. Your support would be much appreciated and would help us continue creating valuable content.<br><br>

Thank you for your understanding and support!
`;
if (adFree) {
    adFree.addEventListener('click', e => {
        e.preventDefault();
        utils.showModal('Ad Free', adFreeMsg, 'Continue to Ad Free Page', 'Remain Here', utils.navigateTo);
    });
}
