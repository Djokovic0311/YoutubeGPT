// Inject Chat Window into YouTube page
function injectChatWindow() {
    const chatWindowHTML = `
        <div id="chatgpt-container" style="position: fixed; bottom: 10px; right: 10px; z-index: 1000;">
            <div id="chatgpt-messages" style="max-height: 300px; overflow-y: auto; background: white; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                <!-- Messages will be shown here -->
            </div>
            <input type="text" id="chatgpt-input" placeholder="Ask ChatGPT..." style="width: 100%; padding: 5px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatWindowHTML);
    document.getElementById('chatgpt-input').addEventListener('keypress', handleInputKeypress);
}

// Extract the video ID from the YouTube URL
function getYouTubeVideoID() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}



// Fetch the transcript for a given video ID
function fetchTranscript(videoID) {
    const YOUTUBE_API_KEY = 'AIzaSyC8tDd-PZ0PE2Lymv3_u0DA4nKb8BUt28w'; // Replace with your actual YouTube Data API key
    const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoID}&key=${YOUTUBE_API_KEY}`;

    return fetch(YOUTUBE_API_URL)
        .then(response => response.json())
        .then(data => {
            // Check if transcripts are available
            if (!data.items || data.items.length === 0) {
                console.log("No transcripts available for this video.");
                return "";
            }

            // Assuming the first item is the desired transcript
            const transcriptId = data.items[0].id;

            // Now fetch the actual transcript content using the transcript ID
            return fetch(`https://www.googleapis.com/youtube/v3/captions/${transcriptId}?key=${YOUTUBE_API_KEY}`)
                .then(response => response.json())
                .then(transcriptData => {
                    // Process and return the transcript content
                    // You might need to decode or process the transcriptData.content depending on the format
                    return transcriptData.content; // This is a placeholder, adjust based on actual response structure
                });
        })
        .catch(error => {
            console.error('Error fetching transcript:', error);
            return "";
        });

}

// Initialize ChatGPT with the YouTube transcript
function initializeChatGPTWithContext(transcript) {
    sendMessageToBackgroundScript(transcript, true);
}

// Handle the Enter key in the input box
function handleInputKeypress(event) {
    if (event.key === 'Enter') {
        const inputElement = event.target;
        const message = inputElement.value;
        inputElement.value = '';
        addMessageToChatWindow('You', message);
        sendMessageToBackgroundScript(message);
    }
}

// Send a message to the background script
function sendMessageToBackgroundScript(message, isInitialization = false) {
    chrome.runtime.sendMessage({action: "sendMessage", message: message, isInitialization: isInitialization}, function(response) {
        if (response && response.data && !isInitialization) {
            addMessageToChatWindow('ChatGPT', response.data.reply);
        }
    });
}

// Add a message to the chat window
function addMessageToChatWindow(sender, message) {
    const messagesContainer = document.getElementById('chatgpt-messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender}: ${message}`;
    messagesContainer.appendChild(messageElement);
}

// Start the script
injectChatWindow();
const videoID = getYouTubeVideoID();
if (videoID) {
    fetchTranscript(videoID).then(transcript => {
        initializeChatGPTWithContext(transcript);
    });
}
