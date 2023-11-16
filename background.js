function getOAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(token);
            }
        });
    });
}

// Function to send a message to ChatGPT and get a response
function sendMessageToChatGPT(message, isInitialization, callback) {
    const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/engines/davinci-codex/completions';
    const OPENAI_API_KEY = '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'; // This should be securely handled

    // Prepare the prompt for OpenAI
    let prompt = isInitialization ? `The following is a transcript of a video: ${message}\n\n` : message;

    fetch(OPENAI_API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            prompt: prompt,
            max_tokens: 150
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("ChatGPT response:", data); // Log the API response
        if (callback) {
            callback(data);
        }
    })
    
    .catch(error => {
        console.error('Error:', error);
    });
}

// Listening for messages from content script
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "sendMessage") {
            sendMessageToChatGPT(request.message, request.isInitialization, function(response) {
                sendResponse({ data: response });
            });

            // Return true to indicate you wish to send a response asynchronously
            return true;
        }
    }
);
