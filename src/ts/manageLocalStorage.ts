import * as crypto from './cryptography.js';

const LOCAL_STORAGE_API_KEY = 'chatGPTPlaygroundAPIKey';
const LOCAL_STORAGE_SAVE_KEY = 'chatGPTPlaygroundSaveAPIChoice';
const LOCAL_STORAGE_MODEL_KEY = 'chatGPTPlaygroundModel';

// Get the API key from local storage
export function getAPIKey() {
  const encryptedString = localStorage.getItem(LOCAL_STORAGE_API_KEY);
  if (encryptedString) {
    try {
      const decryptedString = crypto.decrypt(encryptedString);
      return decryptedString;
    } catch (error) {
      console.log('Error decrypting API key: ' + error);
      return '';
    }
  }
}

// Save the API key to local storage
export function setAPIKey(apiKey: string) {
  const encryptedString = crypto.encrypt(apiKey);
  localStorage.setItem(LOCAL_STORAGE_API_KEY, encryptedString);
}

// Save the model to local storage
export function setModel(model: string) {
  localStorage.setItem(LOCAL_STORAGE_MODEL_KEY, model);
}

// Get the model from local storage
export function getModel() {
  const model = localStorage.getItem(LOCAL_STORAGE_MODEL_KEY);
  if (model) return model;
}

// Get the user's choice to save the API key to local storage
export function getSaveAPIChoice() {
  const saveAPIKeyChoice = localStorage.getItem(LOCAL_STORAGE_SAVE_KEY);
  if (saveAPIKeyChoice) return saveAPIKeyChoice === 'true';
  return false;
}

// Save the user's choice to save the API key to local storage
export function setSaveAPIChoice(saveAPIKeyChoice: boolean) {
  localStorage.setItem(LOCAL_STORAGE_SAVE_KEY, saveAPIKeyChoice.toString());
  if (!saveAPIKeyChoice) {
    localStorage.removeItem(LOCAL_STORAGE_API_KEY);
  }
}

export function initializeForm(checkbox: HTMLInputElement, inputField: HTMLInputElement) {
  const saveChoice = getSaveAPIChoice();
  checkbox.checked = saveChoice;
  if (saveChoice) {
    const savedKey = getAPIKey();
    if (savedKey) inputField.value = savedKey;
  }
}
