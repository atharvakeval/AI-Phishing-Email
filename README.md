# 🛡️ AI Phishing Email Detector

A real-time AI-powered Chrome Extension that detects phishing emails in Gmail and Outlook.  
Hover over any email → AI scans it instantly → shows **🔴 High Risk / 🟡 Moderate / 🟢 Safe** badge.

---

## 📸 Demo

| Inbox View | Safe Email | Suspicious Email |
|---|---|---|
| Hover badges on email list | Green banner — Looks Legitimate | Yellow banner — Suspicious |

---

## 🚀 Features

- **Hover to scan** — move mouse over any email row and get instant AI risk rating
- **3-level risk system** — Red (dangerous), Yellow (suspicious), Green (safe)
- **Danger score 0–100** — precise scoring using 15+ phishing signal checks
- **Works on Gmail and Outlook** — both supported
- **Manual scan button** — deep scan any open email
- **Real AI reasoning** — not pattern matching, actual LLM analysis
- **Completely free** — uses Groq + Llama 3.3 (no payment needed)

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Chrome Extension | JavaScript (Manifest V3) |
| Backend Server | Python + FastAPI |
| AI Model | Llama 3.3 70B via Groq API |
| Communication | REST API (HTTP POST) |
| Styling | CSS3 |

---

## 📁 Project Structure

```
AI-Phishing-Email-Detector/
│
├── backend/
│   └── api/
│       └── main.py              ← Python FastAPI server (AI logic here)
│
├── extension/
│   └── chrome/
│       ├── manifest.json        ← Chrome extension config
│       ├── background/
│       │   └── background.js    ← Service worker (toolbar badge)
│       ├── content/
│       │   ├── content.js       ← Runs inside Gmail/Outlook (hover detection)
│       │   └── styles.css       ← Badge and banner styling
│       ├── popup/
│       │   ├── popup.html       ← Extension popup UI
│       │   └── popup.js         ← Popup logic
│       └── icons/               ← Extension icons
│
└── README.md
```

---

## ⚙️ How It Works

```
User hovers over email in Gmail
          ↓
content.js reads: sender + subject + preview text
          ↓
Sends to Python server at localhost:8000/predict
          ↓
main.py builds a cybersecurity prompt for Llama AI
          ↓
Llama 3.3 checks 15+ phishing signals and scores the email 0-100:
  +30 = Asks for password/OTP/bank details
  +25 = Threatening language (account will be suspended)
  +20 = Urgency pressure (act now, within 24 hours)
  +20 = Suspicious links not matching company
  -20 = Email uses your real full name
  -15 = Known service (IRCTC, NPTEL, Amazon)
  ... and more
          ↓
Score → Risk Level:
  0–29  = 🟢 Green  (Safe)
  30–85 = 🟡 Yellow (Suspicious)
  86–100 = 🔴 Red   (Phishing)
          ↓
Badge appears on the email row with tooltip explanation
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.10 or higher
- Google Chrome browser
- Free Groq API key (get from console.groq.com)

---

### Step 1 — Get Free API Key

1. Go to **[console.groq.com](https://console.groq.com)**
2. Sign up with any email (no credit card needed)
3. Click **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_`)

---

### Step 2 — Setup Backend

```bash
# Install required Python libraries
pip install fastapi uvicorn groq pydantic
```

Open `backend/api/main.py` and paste your Groq key on line 12:

```python
API_KEY = "gsk_your-key-here"
```

Start the server:

```bash
cd backend/api
python main.py
```

You should see:
```
==================================================
  Phishing Detector — Groq + Llama (Free)
  Server: http://localhost:8000
  Test:   http://localhost:8000/test
==================================================
```

Test the server is working by opening in browser:
```
http://localhost:8000/test
```
Expected response: `{"status": "success", "groq_replied": "Hello."}`

---

### Step 3 — Load Chrome Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension/chrome/` folder
5. The 🛡️ shield icon will appear in your Chrome toolbar

---

### Step 4 — Test It

1. Go to **[mail.google.com](https://mail.google.com)**
2. Hover your mouse over any email row
3. Wait **0.5 seconds** without moving
4. A 🔴 🟡 🟢 badge will appear on the right of the email row
5. Hover over the badge to see full explanation tooltip

---

## 🔴 Risk Level Guide

| Badge | Score | Meaning | Action |
|---|---|---|---|
| 🔴 Red | 86–100 | High Risk — Likely Phishing | Do not click any links, delete the email |
| 🟡 Yellow | 30–85 | Moderate Risk — Suspicious | Be cautious, verify the sender |
| 🟢 Green | 0–29 | Safe — Looks Legitimate | Email appears genuine |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| Badge shows ⚪ white | Python server is not running. Run `python main.py` |
| "Extension context invalidated" | Reload extension at `chrome://extensions` then press F5 on Gmail |
| 500 Internal Server Error | Check your API key is correctly pasted in main.py |
| 429 Rate Limit Error | Groq free tier limit reached. Wait a minute and try again |
| Badges not appearing | Make sure you hover and WAIT 0.5 seconds without moving mouse |

---

## 📊 Phishing Signals Detected

The AI checks these signals to calculate the danger score:

**Increases danger score:**
- Requests for password, OTP, credit card, bank details
- Threatening language (account will be deleted/suspended)
- Urgency pressure (act now, within 24 hours, limited time)
- Suspicious links that don't match the company name
- Prize or lottery offers
- Sender email domain doesn't match the company
- Generic greetings (Dear Customer, Dear User)
- Spelling and grammar mistakes
- Excessive exclamation marks or ALL CAPS

**Decreases danger score:**
- Email uses your real full name
- Order confirmation with real tracking number
- Job application reply with specific company and role
- Email from known Indian services (IRCTC, NPTEL, Aadhaar)
- No links in email
- Professional polite language

---

## 🔒 Privacy

- Email content is sent to your **local Python server only** (localhost:8000)
- Your server then sends the text to **Groq API** for AI analysis
- **No email data is stored anywhere** — each scan is stateless
- The extension only reads emails when you hover over them

---

## 📝 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Check if server is running |
| `/health` | GET | Check server + API key status |
| `/test` | GET | Test Groq AI connection |
| `/predict` | POST | Analyze email and return risk score |

### Example Request
```json
POST http://localhost:8000/predict
{
  "text": "Dear Customer, Your account has been suspended. Click here to verify immediately.",
  "sender": "support@fake-bank.xyz",
  "subject": "URGENT: Account Suspended"
}
```

### Example Response
```json
{
  "is_phishing": true,
  "confidence": 0.93,
  "risk_score": 93,
  "risk_level": "red",
  "explanation": "This email uses urgent threatening language and asks to click a suspicious link.",
  "indicators": [
    "Threatening language: account suspended",
    "Urgency: verify immediately",
    "Suspicious sender domain: fake-bank.xyz"
  ]
}
```

---

## 🛠️ Built With

- **[FastAPI](https://fastapi.tiangolo.com/)** — Python web framework for the backend API
- **[Groq](https://groq.com/)** — Free AI inference platform
- **[Llama 3.3 70B](https://ai.meta.com/blog/meta-llama-3/)** — Meta's open source large language model
- **[Chrome Extensions API](https://developer.chrome.com/docs/extensions/)** — Manifest V3

---

## 👨‍💻 Author

**Atharva Keval**  
3rd Year Engineering Student  
Cybersecurity Project — 2026

---

## 📄 License

This project is built for educational purposes as part of a college cybersecurity project.

---

## 🙏 Acknowledgements

- Groq for providing free AI inference
- Meta for open-sourcing Llama 3.3
- FastAPI for the excellent Python web framework
