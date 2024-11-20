// Store the most recent password and original URL per tab
const tabData = new Map();

// Helper to extract password and original URL from parameters
function getPasswordAndUrl(url) {

  const params = new URL(url).searchParams;

  return {
    password: params.get('password') || params.get('p'),
    originalUrl: url.split('?')[0] // Original URL without query params
  };

}

// Capture password and original URL on initial navigation
chrome.webNavigation.onBeforeNavigate.addListener((details) => {

  if (details.frameId === 0) {

    const { password, originalUrl } = getPasswordAndUrl(details.url);

    if (password) {
      tabData.set(details.tabId, { password, originalUrl });
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
      const tabInfo = tabData.get(details.tabId);

      if (tabInfo?.password) {
        // Inject content script with password data
        chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          func: fillAndSubmitPassword,
          args: [tabInfo.password]
        });
      }
    }

    // Detect if redirected to the index page
    if (poweredBy?.toLowerCase() === 'shopify' && currentPath === '/') {

      const tabInfo = tabData.get(details.tabId);

      if (tabInfo?.originalUrl) {

        // Redirect to the original URL
        chrome.tabs.update(details.tabId, { url: tabInfo.originalUrl });
        tabData.delete(details.tabId); // Clear data after redirection

      }
    }

  } catch (error) {

    console.error('Error:', error);

  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {

  tabData.delete(tabId);

});

function fillAndSubmitPassword(password) {

  const passwordSelector = 'form[action="/password"] input[type="password"][id="password"][name="password"]';
  const passwordInput = document.querySelector(passwordSelector);
  const form = document.querySelector('form[action="/password"]');

  if (passwordInput && form) {
    passwordInput.value = password;
    form.submit();
  }
}
