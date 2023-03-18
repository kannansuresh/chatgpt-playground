// import { stopStream } from './openAI';
export function resizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.rows = textarea.value.split('\n').length > 1 ? textarea.value.split('\n').length : 1;
    ensureButtonInView();
}
function ensureButtonInView() {
    const button = document.getElementById('stopGenerationBtn');
    if (!button)
        return;
    const buttonRect = button.getBoundingClientRect();
    const inViewPort = buttonRect.top >= 0 && buttonRect.left >= 0 && buttonRect.bottom <= window.innerHeight && buttonRect.right <= window.innerWidth;
    if (!inViewPort) {
        button.scrollIntoView({ behavior: 'smooth', block: 'center' }); // scroll to element
    }
}
export function deleteMessage(messageToDelete) {
    try {
        messageToDelete.parentElement?.remove();
    }
    catch (err) {
        console.error('Error deleting message:', err);
    }
}
export function disableOrEnableElements(disable = true) {
    const buttons = document.querySelectorAll('button');
    const textAreas = document.querySelectorAll('textarea');
    const elements = [...buttons, ...textAreas];
    const filteredElements = Array.from(elements).filter(element => !element.classList.contains('is-disabled'));
    filteredElements.forEach(element => {
        element.disabled = disable;
    });
}
export function addSpinner(messagesContainer) {
    disableOrEnableElements(true);
    const placeholderDiv = document.createElement('div');
    placeholderDiv.id = 'placeholderDiv';
    const stopGeneratingButton = document.createElement('button');
    stopGeneratingButton.className = 'btn btn-danger btn-sm mb-2 mt-2';
    stopGeneratingButton.textContent = 'Stop Generating';
    stopGeneratingButton.style.display = 'block';
    stopGeneratingButton.type = 'button';
    stopGeneratingButton.id = 'stopGenerationBtn';
    const loadingParagraph = document.createElement('p');
    loadingParagraph.textContent = 'Fetching response';
    loadingParagraph.className = 'loading';
    placeholderDiv.appendChild(loadingParagraph);
    placeholderDiv.appendChild(stopGeneratingButton);
    messagesContainer.appendChild(placeholderDiv);
    return placeholderDiv;
}
export function removeSpinner() {
    const spinnerDiv = document.getElementById('placeholderDiv');
    if (spinnerDiv)
        spinnerDiv.remove();
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
export function createDownloadLink(filename, data, type) {
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
export function showModal(titleString = '', bodyString = '', buttonString = '', closeButtonString = 'Close', buttonFunction = null) {
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    const button = document.getElementById('modalButton');
    const closeButton = document.getElementById('modalCloseButton');
    title.textContent = titleString;
    body.innerHTML = bodyString;
    button.textContent = buttonString;
    closeButton.textContent = closeButtonString || 'Close';
    if (!buttonString) {
        button.style.display = 'none';
    }
    else {
        button.style.display = 'block';
        if (buttonFunction != null) {
            button.addEventListener('click', e => {
                buttonFunction('adfree.html');
            });
        }
    }
    // @ts-ignore
    const myModal = new bootstrap.Modal(document.getElementById('modal'));
    // @ts-ignore
    myModal.show();
}
// function to navigate to a url
export const navigateTo = (url) => {
    window.location.href = url;
};
export function getPreviewHtml(text) {
    // const regex = /(?<!\n)\n(?!\n)/g;
    // const cleanedText = text.replace(regex, '<br>');
    // @ts-ignore
    return marked.parse(text);
}
