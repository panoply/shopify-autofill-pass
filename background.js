// Store the most recent password per tab
const tabPasswords = new Map();

// Helper to extract password from URL params
function getPasswordFromUrl(url) {

  const params = new URL(url).searchParams;

  return params.get('password') || params.get('p');

}

// Capture password on initial navigation
chrome.webNavigation.onBeforeNavigate.addListener((details) => {

  if (details.frameId === 0) {

    const password = getPasswordFromUrl(details.url);

    if (password) {

      tabPasswords.set(details.tabId, password);

    }

  }
});

// Handle completed navigation
chrome.webNavigation.onCompleted.addListener(async (details) => {
  try {
    if (details.frameId !== 0) return; // Only handle main frame

    const url = new URL(details.url);
    const currentPath = url.pathname;

    // Check if this is a password page
    const response = await fetch(details.url);
    const poweredBy = response.headers.get('powered-by');

    if (poweredBy?.toLowerCase() === 'shopify' && currentPath === '/password') {
      const password = tabPasswords.get(details.tabId);

      if (password) {
        // Inject content script with password data
        chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          func: fillAndSubmitPassword,
          args: [password]
        });

        // Clear the password after use
        tabPasswords.delete(details.tabId);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {

  tabPasswords.delete(tabId);

});


function fillAndSubmitPassword(password) {

  const passwordSelector = 'form[action="/password"] input[type="password"][id="password"][name="password"]'
  const passwordInput = document.querySelector(passwordSelector);
  const form = document.querySelector('form[action="/password"]');

  if (passwordInput && form) {
    passwordInput.value = password;
    form.submit();
  }

}