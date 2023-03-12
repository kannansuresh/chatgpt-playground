export function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
  textarea.rows = textarea.value.split('\n').length > 1 ? textarea.value.split('\n').length : 1;
}

export function deleteMessage(messageToDelete: HTMLButtonElement) {
  try {
    messageToDelete.parentElement?.remove();
  } catch (err) {
    console.error('Error deleting message:', err);
  }
}

export function disableOrEnableElements(disable = true) {
  const buttons = document.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
  const textAreas = document.querySelectorAll('textarea') as NodeListOf<HTMLTextAreaElement>;
  const elements = [...buttons, ...textAreas];
  const filteredElements = Array.from(elements).filter(element => !element.classList.contains('is-disabled'));
  filteredElements.forEach(element => {
    element.disabled = disable;
  });
}

export function addSpinner(messagesContainer: HTMLDivElement) {
  disableOrEnableElements(true);
  const placeholderDiv = document.createElement('div');
  placeholderDiv.id = 'placeholderDiv';

  placeholderDiv.className = 'd-flex align-items-center';

  const loadingParagraph = document.createElement('p');
  loadingParagraph.textContent = 'Fetching response...';

  const spinnerDiv = document.createElement('div');
  spinnerDiv.className = 'spinner-border ms-auto';
  spinnerDiv.setAttribute('role', 'status');
  spinnerDiv.setAttribute('aria-hidden', 'true');

  placeholderDiv.appendChild(loadingParagraph);
  placeholderDiv.appendChild(spinnerDiv);

  messagesContainer.appendChild(placeholderDiv);
}

export function removeSpinner() {
  const spinnerDiv = document.getElementById('placeholderDiv');
  if (spinnerDiv) spinnerDiv.remove();
  disableOrEnableElements(false);
}

export function getDateTimeStrings() {
  const now = new Date();
  const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  // @ts-ignore
  const dateString = now.toLocaleDateString(undefined, dateOptions).replace(/\//g, '-');
  // @ts-ignore
  const timeString = now.toLocaleTimeString(undefined, timeOptions).replace(/:/g, '-');
  return { dateString, timeString };
}

export function createDownloadLink(filename: string, data: any, type: string) {
  const blob = new Blob([data], {
    type,
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}
