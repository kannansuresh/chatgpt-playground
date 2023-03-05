'use strict';

const roleSwitchSpans = document.querySelectorAll('.role-switch');
const messageDeleteSpans = document.querySelectorAll('.message-delete');
const textAreas = document.querySelectorAll('textarea');
const inputField = document.getElementById('input');
const messagesContainer = document.getElementById('messages-container');
const messagesContainer2 = document.createElement('div');
const addMessageButton = document.getElementById('add-message');
const systemTextarea = document.getElementById('system');
const submitButton = document.getElementById('submit');

roleSwitchSpans.forEach(addUserSwitchEventListener);
messageDeleteSpans.forEach(messageDeleteEventListener);
textAreas.forEach(textAreaResizeEventListener);

addMessageButton.addEventListener('click', () => {
  addMessage();
});

function addUserSwitchEventListener(userSwitch) {
  userSwitch.addEventListener('click', () => {
    const isAssistant = userSwitch.dataset.roleType === 'assistant';
    userSwitch.textContent = isAssistant ? 'USER' : 'ASSISTANT';
    userSwitch.dataset.roleType = isAssistant ? 'user' : 'assistant';
  });
}

function messageDeleteEventListener(messageDelete) {
  messageDelete.addEventListener('click', () => {
    deleteMessage(messageDelete);
  });
}

function textAreaResizeEventListener(textArea) {
  textArea.addEventListener('input', () => {
    resizeTextarea(textArea);
  });
}

function resizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
  textarea.rows = textarea.value.split('\n').length > 1 ? textarea.value.split('\n').length : 1;
}

function addMessage(message = '') {
  try {
    const allRoles = document.querySelectorAll('.role-switch');
    const lastRoleType = allRoles.length > 0 ? allRoles[allRoles.length - 1].getAttribute('data-role-type') : 'assistant';
    const isUser = lastRoleType === 'user';
    const inputGroup = document.createElement('div');
    inputGroup.classList.add('input-group', 'mb-3');
    const switchRoleButton = document.createElement('button');
    switchRoleButton.classList.add('btn', 'btn-outline-secondary', 'role-switch');
    switchRoleButton.dataset.roleType = isUser ? 'assistant' : 'user';
    switchRoleButton.textContent = isUser ? 'ASSISTANT' : 'USER';
    switchRoleButton.tabIndex = -1;
    addUserSwitchEventListener(switchRoleButton); // add the event listener to the new user switch element
    const deleteMessageButton = document.createElement('button');
    deleteMessageButton.classList.add('btn', 'btn-outline-secondary', 'message-delete');
    deleteMessageButton.textContent = '-';
    deleteMessageButton.tabIndex = -1;
    messageDeleteEventListener(deleteMessageButton); // add the event listener to the new delete element
    const messageInput = document.createElement('textarea');
    messageInput.classList.add('form-control');
    messageInput.placeholder = `Enter ${isUser ? 'a user' : 'an assistant'} message here.`;
    messageInput.setAttribute('aria-label', 'message');
    messageInput.classList.add('message-text');
    messageInput.setAttribute('rows', 1);
    textAreaResizeEventListener(messageInput); // add the event listener to the new textarea element
    inputGroup.appendChild(switchRoleButton);
    inputGroup.appendChild(messageInput);
    inputGroup.appendChild(deleteMessageButton);
    messagesContainer.appendChild(inputGroup);
    messageInput.value = message;
    const inputEvent = new Event('input', { bubbles: true });
    messageInput.dispatchEvent(inputEvent);
  } catch (err) {
    console.error('Error adding message:', err);
  }
}

function typeText(text, textArea) {
  let index = 0;
  let inputText = text;
  type(inputText);
  function type() {
    if (index < inputText.length) {
      textArea.value += inputText.charAt(index);
      index++;
      setTimeout(type, 10); // delay of 100ms between characters
    }
  }
}

function deleteMessage(messageDelete) {
  try {
    messageDelete.parentElement.remove();
  } catch (err) {
    console.error('Error deleting message:', err);
  }
}

const form = document.querySelector('form');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const messages = [];
  const messageInputs = document.querySelectorAll('#messages-container .input-group');

  messageInputs.forEach(function (input) {
    const role = input.querySelector('button').dataset.roleType;
    const content = input.querySelector('textarea').value;
    if (!content.trim()) return;
    messages.push({ role, content });
  });

  // stop if there are no messages
  if (messages.length === 0) return;

  const data = {
    messages,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    model: 'gpt-3.5-turbo',
    stream: true,
  };

  console.log(JSON.stringify(data));
});
