import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AboutScreen.css';

const AboutScreen: React.FC = () => {
    const navigate = useNavigate();

    const buttonAnim = {
        whileHover: { scale: 1.06, transition: { type: "spring" as const, stiffness: 400, damping: 15 } },
        whileTap: { scale: 0.88, y: 3, transition: { type: "spring" as const, stiffness: 600, damping: 20 } }
    };

    return (
        <div className="about-screen">
            {/* Top Navigation */}
            <nav className="about-nav">
                <div className="nav-left">
                    <motion.button className="back-btn" onClick={() => navigate('/')} {...buttonAnim}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-icon">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back
                    </motion.button>
                    <div className="nav-links">
                        <motion.div {...buttonAnim}>
                            <Link to="/" style={{ display: 'block' }}>Home</Link>
                        </motion.div>
                        <motion.div {...buttonAnim}>
                            <Link to="/about" style={{ display: 'block' }}>About</Link>
                        </motion.div>
                    </div>
                </div>
                <div className="nav-center">
                    <h1>Clementine</h1>
                </div>
                <div className="nav-right">
                    {/* Empty to balance flex layout */}
                </div>
            </nav>

            <main className="about-content">
                <div className="essay-container">
                    <div className="essay-header">
                        <span className="category-tag">ABOUT CLEMENTINE</span>
                        <h2 className="essay-title">Built for the moment before the moment.</h2>
                    </div>

                    <section className="essay-section">
                        <h3>What is Clementine?</h3>
                        <p>
                            Clementine is a real-time relapse prevention system built for people
                            in addiction recovery. It runs quietly in the background of your life,
                            watching two things: how your body is responding to the world around
                            you, and where you are. When those two signals align in a way that
                            suggests you might be heading toward a high-risk moment, Clementine
                            acts — not by lecturing you, but by quietly reaching out to the person
                            in your life who is there to help.
                        </p>
                    </section>

                    <section className="essay-section">
                        <h3>How does it know?</h3>
                        <p>
                            Clementine connects to your Fitbit to monitor your heart rate
                            continuously. When you are stressed or experiencing a craving, your
                            body responds before your mind has made any decisions — your heart
                            rate climbs, your nervous system shifts into a heightened state. At
                            the same time, Clementine checks your GPS location against a personal
                            map of trigger locations you set up during onboarding. A spike in your
                            heart rate while you are near a place that has been difficult for you
                            before is a meaningful signal. That combination is what Clementine
                            listens for.
                        </p>
                    </section>

                    <section className="essay-section">
                        <h3>What happens when it detects something?</h3>
                        <p>
                            If Clementine assesses the moment as high risk, it does two things
                            simultaneously. It sends a warm, personalized text message to your
                            sponsor or chosen support person — written by AI to feel human, not
                            automated. And it shows you a grounding message directly on your
                            screen: a short, personal reminder of how far you have come and an
                            invitation to take a breath before doing anything else. Your sponsor
                            gets a nudge. You get a moment of stillness. The goal is to open a
                            window of time between the impulse and the action.
                        </p>
                    </section>

                    <section className="essay-section">
                        <h3>Who is this for?</h3>
                        <p>
                            Clementine is built for anyone working to leave an addiction behind —
                            alcohol, opioids, stimulants, or anything else that has taken up too
                            much space in their life. It is also for the sponsors, family members,
                            and friends who want to show up but do not always know when they are
                            needed. Recovery is not a solo journey. Clementine is the layer
                            between the hard moment and the person who cares about you.
                        </p>
                    </section>

                    <section className="essay-section">
                        <h3>What Clementine is not.</h3>
                        <p>
                            Clementine is not a replacement for therapy, for AA, for your sponsor,
                            or for any other part of your recovery. It does not claim to know with
                            certainty what you are feeling. It cannot see inside your home or
                            intercept a delivery. It is one layer of support — the layer that
                            watches when no one else is watching, and calls for help when the
                            signals say it might be time. Used alongside everything else you are
                            already doing, it is one more reason not to be alone in a hard moment.
                        </p>
                    </section>

                    <section className="essay-section">
                        <h3>A note on privacy.</h3>
                        <p>
                            Your biometric data and location never leave your device in a way
                            that is visible to anyone other than you and the people you choose.
                            Your sponsor only receives a text message when Clementine decides the
                            moment is serious enough to warrant it. You are always in control of
                            who is in your support network, which locations are flagged, and what
                            your baseline looks like. Clementine works for you.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AboutScreen;
