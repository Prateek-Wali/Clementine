require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

console.log('Client ID loaded:', process.env.FITBIT_CLIENT_ID ? 'YES' : 'NO');
console.log('Client Secret loaded:', process.env.FITBIT_CLIENT_SECRET ? 'YES' : 'NO');


const express = require('express');
const axios = require('axios');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

// Store tokens in memory for hackathon
let storedTokens = {
    accessToken: null,
    refreshToken: null
};

// ─── STEP 1: Redirect user to Fitbit login ────────────────────────────────
app.get('/fitbit/auth', (req, res) => {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.FITBIT_CLIENT_ID,
        redirect_uri: process.env.FITBIT_REDIRECT_URI,
        scope: 'heartrate activity',
        expires_in: '604800',
    });

    res.redirect(
        `https://www.fitbit.com/oauth2/authorize?${params}`
    );
});

// ─── STEP 2: Fitbit sends user back here with a code ─────────────────────
app.get('/fitbit/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('No code received from Fitbit');
    }

    try {
        const credentials = Buffer.from(
            `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
        ).toString('base64');

        const response = await axios.post(
            'https://api.fitbit.com/oauth2/token',
            new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.FITBIT_REDIRECT_URI,
            }),
            {
                headers: {
                    Authorization: `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        storedTokens.accessToken = response.data.access_token;
        storedTokens.refreshToken = response.data.refresh_token;

        console.log('Fitbit auth successful — token stored');

        // Send user back to frontend onboarding flow
        res.redirect('http://localhost:5173/onboarding');

    } catch (err) {
        console.error(
            'Token exchange failed:',
            err.response?.data || err.message
        );
        res.status(500).send('Auth failed — check your Client ID and Secret');
    }
});

// ─── STEP 3: Refresh token when it expires ───────────────────────────────
async function refreshAccessToken() {
    const credentials = Buffer.from(
        `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
        'https://api.fitbit.com/oauth2/token',
        new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: storedTokens.refreshToken,
        }),
        {
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    storedTokens.accessToken = response.data.access_token;
    storedTokens.refreshToken = response.data.refresh_token;
    console.log('Token refreshed successfully');
}

// ─── STEP 4: Fetch live heart rate ───────────────────────────────────────
app.get('/fitbit/heartrate', async (req, res) => {
    if (!storedTokens.accessToken) {
        return res.status(401).json({
            error: 'Not authenticated — visit /fitbit/auth first'
        });
    }

    try {
        const response = await axios.get(
            'https://api.fitbit.com/1/user/-/activities/heart/date/today/1d/1min.json',
            {
                headers: {
                    Authorization: `Bearer ${storedTokens.accessToken}`
                }
            }
        );

        const dataset =
            response.data['activities-heart-intraday']?.dataset;

        if (!dataset || dataset.length === 0) {
            return res.status(404).json({
                error: 'No heart rate data yet — wear your Fitbit and move around'
            });
        }

        const latest = dataset[dataset.length - 1];

        res.json({
            heartRate: latest.value,
            timestamp: latest.time,
        });

    } catch (err) {
        // Token expired — refresh and retry
        if (err.response?.status === 401) {
            try {
                await refreshAccessToken();
                const retry = await axios.get(
                    'https://api.fitbit.com/1/user/-/activities/heart/date/today/1d/1min.json',
                    {
                        headers: {
                            Authorization: `Bearer ${storedTokens.accessToken}`
                        }
                    }
                );
                const dataset =
                    retry.data['activities-heart-intraday']?.dataset;
                const latest = dataset[dataset.length - 1];
                return res.json({
                    heartRate: latest.value,
                    timestamp: latest.time
                });
            } catch (refreshErr) {
                return res.status(500).json({
                    error: 'Token refresh failed'
                });
            }
        }
        console.error(
            'Heart rate fetch failed:',
            err.response?.data || err.message
        );
        res.status(500).json({ error: 'Failed to fetch heart rate' });
    }
});

app.listen(3001, () => {
    console.log('Clementine backend running on http://localhost:3001');
});