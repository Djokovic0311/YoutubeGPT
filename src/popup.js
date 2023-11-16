document.addEventListener('DOMContentLoaded', function() {
    var openChatButton = document.getElementById('open-chat');
    var closeChatButton = document.getElementById('close-chat');

    // When the "Open Chat Window" button is clicked
    openChatButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "openChat"});
        });
    });

    // When the "Close Chat Window" button is clicked
    closeChatButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "closeChat"});
        });
    });
});
