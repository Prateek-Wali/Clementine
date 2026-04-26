import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './OnboardingScreen.css';

const OnboardingScreen: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [name, setName] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [sobrietyDate, setSobrietyDate] = useState("");
    const [sponsorName, setSponsorName] = useState("");
    const [sponsorPhone, setSponsorPhone] = useState("");

    const handleContinueToStep2 = () => {
        setCurrentStep(2);
    };

    const handleFinish = () => {
        localStorage.setItem('userName', name);
        localStorage.setItem('userPhone', userPhone);
        localStorage.setItem('sobrietyDate', sobrietyDate);
        localStorage.setItem('sponsorName', sponsorName);
        localStorage.setItem('sponsorPhone', sponsorPhone);
        navigate('/dashboard');
    };

    const buttonAnim = {
        whileHover: { scale: 1.06, transition: { type: "spring" as const, stiffness: 400, damping: 15 } },
        whileTap: { scale: 0.88, y: 3, transition: { type: "spring" as const, stiffness: 600, damping: 20 } }
    };

    return (
        <div className="onboarding-screen">
            {/* Top Navigation */}
            <nav className="onboarding-nav">
                <h1>Clementine</h1>
            </nav>

            {/* Step Indicator */}
            <div className="step-indicator">
                <div className="step-line-short"></div>

                <div className="step">
                    <div className={`step-pill ${currentStep === 1 ? 'active-pill' : 'completed-pill'}`}>
                        {currentStep > 1 && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scale(0.8)' }}>
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        )}
                    </div>
                    <span className={`step-label ${currentStep === 1 ? 'active-label' : ''}`}>You</span>
                </div>

                <div className="step">
                    <div className={`step-pill ${currentStep === 2 ? 'active-pill' : ''}`}></div>
                    <span className={`step-label ${currentStep === 2 ? 'active-label' : ''}`}>Support</span>
                </div>
            </div>

            <div className="onboarding-container">
                {currentStep === 1 ? (
                    <motion.div
                        key="step1"
                        className="onboarding-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <span className="category-tag">STEP 1 OF 2</span>
                        <h2 className="main-heading">Tell us about yourself.</h2>
                        <p className="sub-heading">This stays private. Only you can see this information.</p>

                        <div className="onboarding-form">
                            <div className="form-group">
                                <label>Your first name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Your phone number</label>
                                <input
                                    type="tel"
                                    placeholder="e.g. +1 (555) 000-0000"
                                    value={userPhone}
                                    onChange={(e) => setUserPhone(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Sobriety start date</label>
                                <input
                                    type="date"
                                    value={sobrietyDate}
                                    onChange={(e) => setSobrietyDate(e.target.value)}
                                />
                            </div>

                            <motion.button
                                type="button"
                                className="continue-btn"
                                onClick={handleContinueToStep2}
                                {...buttonAnim}
                            >
                                Continue &rarr;
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        className="onboarding-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <span className="category-tag">STEP 2 OF 2</span>
                        <h2 className="main-heading">Who's got your back?</h2>
                        <p className="sub-heading">This person will be contacted if Clementine detects a high-risk moment.</p>

                        <div className="onboarding-form">
                            <div className="form-group">
                                <label>Sponsor's name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mike"
                                    value={sponsorName}
                                    onChange={(e) => setSponsorName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Sponsor's phone number</label>
                                <input
                                    type="tel"
                                    placeholder="e.g. +1 (555) 000-0000"
                                    value={sponsorPhone}
                                    onChange={(e) => setSponsorPhone(e.target.value)}
                                />
                            </div>

                            <div className="button-row">
                                <motion.button
                                    type="button"
                                    className="back-btn"
                                    onClick={() => setCurrentStep(1)}
                                    {...buttonAnim}
                                >
                                    &larr; Back
                                </motion.button>

                                <motion.button
                                    type="button"
                                    className="continue-btn let-go-btn"
                                    onClick={handleFinish}
                                    {...buttonAnim}
                                >
                                    Let's go &rarr;
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default OnboardingScreen;
