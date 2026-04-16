// ============================================================
// background.js  —  Runs in the background (service worker)
// It updates the small badge icon on the Chrome toolbar
// based on the scan results from content.js
// ============================================================

// Count how many phishing emails were found in this session
var phishingEmailCount = 0;


// ============================================================
// Listen for messages from content.js
// When a scan is done, content.js tells us the result
// ============================================================

chrome.runtime.onMessage.addListener(function(message, sender) {

    // Check if this message is a scan result
    if (message.type == "SCAN_RESULT") {

        var riskLevel = message.riskLevel;

        if (riskLevel == "red") {
            // Dangerous email found — show red badge with count
            phishingEmailCount = phishingEmailCount + 1;
            chrome.action.setBadgeText({
                text: String(phishingEmailCount), // Show the number
                tabId: sender.tab.id
            });
            chrome.action.setBadgeBackgroundColor({
                color: "#d93025" // Red color
            });

        } else if (riskLevel == "yellow") {
            // Suspicious email — show yellow badge with "!"
            chrome.action.setBadgeText({
                text: "!",
                tabId: sender.tab.id
            });
            chrome.action.setBadgeBackgroundColor({
                color: "#f9ab00" // Yellow/orange color
            });

        } else {
            // Safe email — show green badge with checkmark
            chrome.action.setBadgeText({
                text: "✓",
                tabId: sender.tab.id
            });
            chrome.action.setBadgeBackgroundColor({
                color: "#34a853" // Green color
            });
        }
    }
});


// ============================================================
// When user navigates to a new page, reset the badge
// ============================================================

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (changeInfo.status == "loading") {
        // Clear the badge text
        chrome.action.setBadgeText({ text: "", tabId: tabId });
        // Reset count for new page
        phishingEmailCount = 0;
    }
});
