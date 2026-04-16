// ============================================================
// popup.js  —  Controls the popup window that appears
// when you click the extension icon in Chrome toolbar
// ============================================================

// The address of our Python backend server
var API_URL = "http://localhost:8000";

// Get references to all the HTML elements in the popup
var scanButton     = document.getElementById("scan-btn");
var apiStatusBadge = document.getElementById("api-status");
var emailStatusBadge = document.getElementById("email-status");
var resultBox      = document.getElementById("result-box");
var resultTitle    = document.getElementById("result-title");
var resultExplanation = document.getElementById("result-explanation");
var resultIndicators  = document.getElementById("result-indicators");
var noEmailMessage = document.getElementById("no-email-msg");


// ============================================================
// FUNCTION 1: Check if the Python backend server is running
// ============================================================

async function checkIfServerIsRunning() {
    try {
        // Try to reach the /health endpoint of our server
        var response = await fetch(API_URL + "/health", {
            signal: AbortSignal.timeout(3000) // Give up after 3 seconds
        });

        if (response.ok) {
            // Server responded — it's online
            apiStatusBadge.textContent = "Online ✓";
            apiStatusBadge.className = "badge badge-ok";
            return true;
        }
    } catch (error) {
        // Could not reach the server
    }

    // Server is offline
    apiStatusBadge.textContent = "Offline ✗";
    apiStatusBadge.className = "badge badge-warn";
    return false;
}


// ============================================================
// FUNCTION 2: Check if the user has an email open right now
// ============================================================

async function checkIfEmailIsOpen() {
    // Get the currently active browser tab
    var tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    var currentTab = tabs[0];

    // If no tab found, return false
    if (currentTab == null) {
        return false;
    }

    // Check if we're on Gmail or Outlook
    var url = currentTab.url || "";
    var isOnEmailSite =
        url.includes("mail.google.com") ||
        url.includes("outlook.live.com") ||
        url.includes("outlook.office.com");

    if (isOnEmailSite == false) {
        // User is not on an email website
        emailStatusBadge.textContent = "Not on Gmail/Outlook";
        emailStatusBadge.className = "badge badge-gray";
        noEmailMessage.style.display = "block";
        return false;
    }

    // Ask the content.js script if an email is currently open
    try {
        var reply = await chrome.tabs.sendMessage(currentTab.id, {
            type: "GET_STATUS"
        });

        if (reply != null && reply.emailOpen == true) {
            // An email is open
            emailStatusBadge.textContent = "Email Detected ✓";
            emailStatusBadge.className = "badge badge-ok";
            noEmailMessage.style.display = "none";
            return true;
        }
    } catch (error) {
        // Could not communicate with content script
    }

    // No email is open
    emailStatusBadge.textContent = "No email open";
    emailStatusBadge.className = "badge badge-gray";
    noEmailMessage.style.display = "block";
    return false;
}


// ============================================================
// FUNCTION 3: Show the scan result in the popup
// ============================================================

function showResult(result) {
    // Calculate phishing probability
    var phishingProbability = 0;
    if (result.is_phishing == true) {
        phishingProbability = result.confidence;
    } else {
        phishingProbability = 1 - result.confidence;
    }

    // Get risk level
    var level = "";
    if (phishingProbability >= 0.65) {
        level = "red";
    } else if (phishingProbability >= 0.30) {
        level = "yellow";
    } else {
        level = "green";
    }

    // Show the result box
    resultBox.style.display = "block";
    resultBox.className = "result-box result-" + level;

    // Set title based on risk level
    var confidencePercent = Math.round(result.confidence * 100);
    if (level == "red") {
        resultTitle.textContent = "🔴 High Risk — Likely Phishing! (" + confidencePercent + "%)";
    } else if (level == "yellow") {
        resultTitle.textContent = "🟡 Moderate Risk — Suspicious (" + confidencePercent + "%)";
    } else {
        resultTitle.textContent = "🟢 Safe — Looks Legitimate (" + confidencePercent + "%)";
    }

    // Set explanation text
    resultExplanation.textContent = result.explanation || "";

    // Show the list of warning indicators
    resultIndicators.innerHTML = "";
    if (result.indicators != null) {
        for (var i = 0; i < result.indicators.length; i++) {
            var listItem = document.createElement("li");
            listItem.textContent = result.indicators[i];
            resultIndicators.appendChild(listItem);
        }
    }
}


// ============================================================
// FUNCTION 4: When the Scan button is clicked
// ============================================================

scanButton.addEventListener("click", async function() {
    // Change button to show loading
    scanButton.textContent = "⏳ Scanning...";
    scanButton.disabled = true;
    resultBox.style.display = "none";

    // Get the currently active tab
    var tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    var currentTab = tabs[0];

    if (currentTab == null) {
        scanButton.textContent = "🔍 Deep-Scan Email";
        scanButton.disabled = false;
        return;
    }

    try {
        // Tell content.js to run the scan
        await chrome.tabs.sendMessage(currentTab.id, { type: "SCAN_EMAIL" });

    } catch (error) {
        // Show error if communication failed
        resultBox.style.display = "block";
        resultBox.className = "result-box result-red";
        resultTitle.textContent = "Error";
        resultExplanation.textContent = "Could not connect to page: " + error.message;
        resultIndicators.innerHTML = "";
    }

    // Reset button
    scanButton.textContent = "🔍 Deep-Scan Email";
    scanButton.disabled = false;
});


// ============================================================
// STARTUP: Run when popup opens
// ============================================================

async function startupChecks() {
    // Check server and email status
    var serverOk = await checkIfServerIsRunning();
    var emailOk  = await checkIfEmailIsOpen();

    // Only enable the scan button if both are ready
    if (serverOk == true && emailOk == true) {
        scanButton.disabled = false;
    }
}

// Run startup checks immediately
startupChecks();
