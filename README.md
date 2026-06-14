# Clementine

> **First Place — Health & Wellbeing Track**
> Anthropic x NJIT Claude Builder Club Hackathon · April 2025
> Part of a global event across 78 universities in 12 countries

---

## The Problem

Every year, millions of people in addiction recovery relapse. Research shows that the window where intervention matters most is measured in **minutes, not hours**. When someone in recovery encounters a trigger — a familiar location, a stressful moment, a Friday evening — their body responds before their mind has made any decisions. Heart rate climbs. The autonomic nervous system shifts. A craving takes hold.

The people who could help — sponsors, family members, counselors — often don't know any of this is happening until it's too late.

**Clementine is the layer between the hard moment and the person who cares about you.**

---

## What It Does

Clementine is a real-time relapse prevention system built for people in addiction recovery. It monitors two signals simultaneously:

**1. Biometric data** — Live heart rate from a Fitbit wearable, updating continuously throughout the day. When heart rate elevates significantly above a personal baseline, Clementine registers a physiological stress response.

**2. GPS location** — The user's device location, checked every 90 seconds against a personal map of trigger locations they set up during onboarding. Places tied to past substance use — a specific bar, a neighborhood, a liquor store.

When both signals align — elevated biometrics *and* proximity to a trigger location — Clementine sends the combined data to **Claude AI** for risk assessment. Claude reasons about the full context: the user's name, days sober, time of day, heart rate relative to baseline, and how close they are to the trigger. If it determines the moment is high risk, two things happen simultaneously:

- **A personalized SMS is sent to the user's sponsor** — not a robotic alert, but a warm human message written by Claude: *"Hey Mike, John might need your support right now — worth a quick call."*
- **A grounding message is sent directly to the user's own phone** — a short personal reminder of how far they've come and an invitation to breathe before doing anything else.

The goal is simple: open a window of time between the impulse and the action.

---

## Demo

The live demo flow:

1. User opens Clementine and completes a 2-step onboarding — name, phone number, sobriety start date, sponsor name and phone
2. Dashboard loads with live biometric data from Fitbit, a Three.js respiratory system that breathes in sync with heart rate, and real-time location monitoring
3. As heart rate climbs and the user approaches a trigger location, Claude assesses the risk
4. Two SMS messages fire simultaneously — one to the sponsor, one to the user's own phone
5. A real text message arrives on a phone sitting in front of you

---

## The Science

Clementine is built on documented clinical research, not assumptions.

When a person in recovery encounters an environmental trigger, the brain activates the same threat-response system as physical danger — a phenomenon called **cue-induced craving**. This produces a measurable physiological cascade: the sympathetic nervous system fires, cortisol and adrenaline release into the bloodstream, and heart rate elevates noticeably. This happens *before* conscious decision-making begins.

Research backing this approach includes work from **Penn Medicine**, **NIDA (National Institute on Drug Abuse)**, and the **NIAAA (National Institute on Alcohol Abuse and Alcoholism)** — all of which have validated wearable biometric monitoring as a meaningful early-warning system for relapse.

Heart rate alone is noisy — you could be exercising or stressed about work. But heart rate spiking *while near a personally flagged trigger location* maps directly to what clinicians call a high-risk moment. That combination is what Clementine listens for.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| 3D Visualization | Three.js |
| Animations | Framer Motion |
| AI Risk Assessment | Anthropic Claude API |
| SMS Alerts | Twilio REST API |
| Biometric Data | Fitbit Web API (OAuth 2.0) |
| Location | Browser Geolocation API |
| User Data | Firebase Firestore |
| Backend | Node.js + Express |
| Styling | Custom CSS + inline React styles |

---

## What We Built in 10 Hours

- An anime-inspired landing page with layered animated hearts built in Framer Motion
- A 2-step onboarding flow collecting user and sponsor information
- A full dashboard with a **Three.js respiratory system** — a wireframe transparent body with lungs that expand and contract in sync with live heart rate, and a pulsing heart sphere at the center
- Live biometric display pulling real heart rate data from the Fitbit API
- A hybrid simulation system that keeps the heart rate display feeling live between API updates
- Claude-powered risk assessment generating personalized messages using the user's real name, sponsor's name, and context
- Dual Twilio SMS delivery — one message to the sponsor, one grounding message to the user's own phone
- A research summary documenting the clinical science behind the biometric approach
- A complete Express backend with Fitbit OAuth 2.0, Claude API integration, and Twilio

---

## Obstacles We Overcame

**The Fitbit real-time problem**
Fitbit's API was designed for daily health summaries, not live streaming. Even with the intraday heart rate endpoint, data has a sync delay of several minutes. We solved this with a hybrid system: the app fetches the real Fitbit value once on load, then simulates natural ±1-2 BPM variation from that baseline to keep the display feeling live. When new real data arrives it snaps to the true value and resumes simulation from there.

**OAuth complexity under time pressure**
Setting up Fitbit's OAuth 2.0 Authorization Code Flow correctly — with the right app type (Personal, not Server), redirect URIs, token exchange, and refresh logic — took significant debugging time. The key issue was that our `.env` credentials weren't loading due to dotenv path resolution. We fixed this by using `__dirname` to give dotenv an explicit path.

**Three.js in a React component**
Integrating a Three.js scene into a React TypeScript component with proper cleanup, responsive resizing, and animation loop management required careful use of `useRef` and `useEffect` to avoid memory leaks and stale closures. The respiratory system went through three complete rewrites during the hackathon before landing on the transparent wireframe holographic aesthetic that became the visual centerpiece of the app.

**Stale closure bugs in React**
The heart rate simulation system had a subtle but painful bug: React's `useState` inside `setInterval` creates a stale closure that never sees state updates. Multiple intervals were stacking on top of each other on each Fitbit data refresh, causing the heart rate to jump by 15+ BPM per tick. We solved this by moving all mutable simulation state into `useRef` values, which are always current regardless of when the closure was created.

**Building something emotionally right, not just technically right**
The hardest part of this project wasn't the code. It was making sure the product felt human. Addiction recovery is deeply personal. Every word in the app — the onboarding copy, the grounding messages, the sponsor alerts — went through multiple iterations to make sure it felt like a caring friend, not a clinical system. That attention to tone is what made judges connect with it.

---

## What's Next for Clementine

**Real-time biometrics via Web Bluetooth**
The Fitbit API's sync delay is a fundamental limitation. The next version of Clementine will use the **Web Bluetooth API** to connect directly to BLE-compatible heart rate monitors (Polar H10, Wahoo TICKR, and others), streaming live data directly to the browser with no sync delay and no OAuth flow required.

**HRV as a second signal**
Heart Rate Variability is a more sensitive indicator of stress and craving states than raw heart rate. The next version will incorporate real-time HRV alongside heart rate for a significantly more accurate risk model.

**Firebase user persistence**
Currently user data is stored in `localStorage`. The production version will use Firebase Firestore for persistent user profiles, allowing the app to remember trigger locations, sponsor info, and historical alert data across sessions and devices.

**Multi-addiction support**
The current build is scoped to alcohol recovery for clarity of demo. The underlying system — biometrics plus location plus Claude reasoning — works identically for opioids, stimulants, gambling, and other location-based addiction triggers. Expanding the onboarding to support multiple addiction types is a near-term priority.

**Escalation logic**
If the user doesn't respond within 10 minutes of a high-risk alert and biometrics remain elevated, Clementine should escalate — sending a second message, alerting a secondary contact, or in critical cases, providing emergency resources. This logic is designed but not yet implemented.

**Pattern learning over time**
With enough historical data, Clementine can learn a user's personal high-risk patterns — which times of day, which days of the week, which environmental conditions correlate with craving events — and proactively surface that context before the biometrics even spike.

**Native mobile app**
A web app cannot run reliably in the background on a phone. A React Native version with background location services and native BLE Bluetooth support would make Clementine a true always-on monitoring tool rather than a browser tab.

---

## Running Locally

### Prerequisites
- Node.js 18+
- A Fitbit developer account with a Personal app registered at dev.fitbit.com
- An Anthropic API key
- A Twilio account with a phone number
- A Firebase project with Firestore enabled

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/clementine.git
cd clementine

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Create server/.env
touch .env
```

Add to `server/.env`:
```env
FITBIT_CLIENT_ID=your_client_id
FITBIT_CLIENT_SECRET=your_client_secret
FITBIT_REDIRECT_URI=http://localhost:3001/fitbit/callback
ANTHROPIC_API_KEY=your_anthropic_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

### Run

```bash
# Terminal 1 — Backend
cd server
node index.js

# Terminal 2 — Frontend
cd ..
npm run dev
```

Open `http://localhost:5173`, click Get Started, complete Fitbit auth, and the dashboard will load with your live biometric data.

*Built with care at the NJIT Claude Builder Club Hackathon · April 2025*
*🏆 First Place — Health & Wellbeing Track*
