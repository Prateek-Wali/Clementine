import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import RespiratorySystem from './RespiratorySystem';
import './DashboardScreen.css';

const DashboardScreen: React.FC = () => {
    const [alertMessage, setAlertMessage] = useState("");
    const [nearTrigger, setNearTrigger] = useState(false);

    const [displayHeartRate, setDisplayHeartRate] = useState<number | null>(null);
    const baseHRRef = useRef<number>(0);
    const currentHRRef = useRef<number>(0);
    const isReadyRef = useRef<boolean>(false);
    const crisisActiveRef = useRef<boolean>(false);
    const simIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    isReadyRef.current = true;

    // Derived values from displayHeartRate
    const safeHeartRate = displayHeartRate ?? 0;
    const hrv = Math.max(18, Math.min(55, Math.round(55 - (safeHeartRate - 58) * 0.6)));
    const stress = Math.max(8, Math.min(95, Math.round(((safeHeartRate - 68) / 68) * 100 + 20)));
    const hrDisplay = displayHeartRate === null ? '- -' : String(Math.round(displayHeartRate));
    const stressDisplay = String(stress);
    const hrStatus = safeHeartRate >= 60 && safeHeartRate <= 100 ? 'Normal' : 'Elevated';
    const stressStatus = stress < 30 ? 'Low' : stress < 60 ? 'Moderate' : 'High';

    const buttonAnim = {
        whileHover: { scale: 1.06, transition: { type: "spring" as const, stiffness: 400, damping: 15 } },
        whileTap: { scale: 0.88, y: 3, transition: { type: "spring" as const, stiffness: 600, damping: 20 } }
    };

    useEffect(() => {
        const fetchHeartRate = async () => {
            try {
                const res = await fetch('http://localhost:3001/fitbit/heartrate');
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();
                baseHRRef.current = data.heartRate;
                currentHRRef.current = data.heartRate;
                isReadyRef.current = true;
                setDisplayHeartRate(data.heartRate);
            } catch {
                console.log('Fitbit fetch failed');
                baseHRRef.current = 70;
                currentHRRef.current = 70;
                isReadyRef.current = true;
            }
        };

        fetchHeartRate();
    }, []);

    useEffect(() => {
        simIntervalRef.current = setInterval(() => {
            if (!isReadyRef.current) return;
            if (crisisActiveRef.current) return;
            
            const change = Math.random() < 0.5 ? -1 : 1;
            const next = currentHRRef.current + change;

            const min = baseHRRef.current - 5;
            const max = baseHRRef.current + 5;
            const clamped = Math.max(min, Math.min(max, next));

            currentHRRef.current = clamped;
            setDisplayHeartRate(Math.round(clamped));
        }, 4000);

        return () => {
            if (simIntervalRef.current) {
                clearInterval(simIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.code !== 'Space') return;
            if (!isReadyRef.current) return;
            if (crisisActiveRef.current) return;

            console.log("SPACEBAR HIT — triggering analyze"); 
            crisisActiveRef.current = true;
            navigator.geolocation.getCurrentPosition(async (pos) => {
            const res = await fetch("http://localhost:3000/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                heartRate: 118,
                baseline: baseHRRef.current,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                }),
            });
            const result = await res.json();
            setAlertMessage(result.userMessage);
            if (result.risk === "high" || result.risk === "critical") {
                setNearTrigger(true);
            }
            });

            const startHR = currentHRRef.current;
            const targetHR = 118;
            const totalSteps = 20;
            const stepSize = (targetHR - startHR) / totalSteps;
            let steps = 0;

            const rampInterval = setInterval(() => {
                steps++;
                const next = Math.round(startHR + stepSize * steps);
                currentHRRef.current = next;
                setDisplayHeartRate(next);

                if (steps >= totalSteps) {
                    clearInterval(rampInterval);
                    currentHRRef.current = 118;
                    setDisplayHeartRate(118);

                    setTimeout(() => {
                        const returnTarget = baseHRRef.current;
                        const returnSteps = 20;
                        const returnStepSize = (118 - returnTarget) / returnSteps;
                        let returnCount = 0;

                        const returnInterval = setInterval(() => {
                            returnCount++;
                            const next = Math.round(118 - returnStepSize * returnCount);
                            currentHRRef.current = next;
                            setDisplayHeartRate(next);

                            if (returnCount >= returnSteps) {
                                clearInterval(returnInterval);
                                currentHRRef.current = returnTarget;
                                setDisplayHeartRate(returnTarget);
                                crisisActiveRef.current = false;
                            }
                        }, 600);
                    }, 5000);
                }
            }, 600);
        };

        window.addEventListener('keydown', handler);

        return () => window.removeEventListener('keydown', handler);
    }, []);

    // ─── WAVEFORM CANVAS ─────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let offset = 0;

        const draw = () => {
            const amplitude = (currentHRRef.current - 50) / 80 * 20 + 5;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.strokeStyle = '#C2185B';
            ctx.lineWidth = 2;

            for (let x = 0; x < canvas.width; x++) {
                const y = Math.sin((x + offset) * 0.05) * amplitude + canvas.height / 2;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            offset += 2;
            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <div className="dashboard-screen">
            {/* Top Navigation */}
            <nav className="dash-nav">
                <div className="nav-left">
                    <Link to="/dashboard">DASHBOARD</Link>
                    <Link to="#">PROFILE</Link>
                </div>
                <div className="nav-center">
                    <h1>Clementine</h1>
                </div>
            </nav>

            {/* Main Layout */}
            <div className="dashboard-content">

                {/* Left Column: Biometrics */}
                <motion.div
                    className="dash-column panel-card"
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                >
                    <span className="panel-label">LIVE BIOMETRICS</span>
                    <div className="divider"></div>

                    <div className="metric-section">
                        <span className="metric-label">Heart Rate</span>
                        <div className="metric-value-row">
                            <span className="huge-number">{hrDisplay}</span>
                            <span className="metric-unit">BPM</span>
                        </div>
                        <canvas ref={canvasRef} width={280} height={40} className="waveform-canvas"></canvas>
                        {hrStatus && (
                            <div className={`status-pill ${hrStatus === 'Normal' ? 'status-normal' : 'status-warning'}`}>
                                <span className={`dot ${hrStatus === 'Normal' ? 'green-dot' : 'yellow-dot'}`}></span>
                                {hrStatus}
                            </div>
                        )}
                    </div>

                    <div className="divider"></div>

                    <div className="metric-section">
                        <span className="metric-label">Stress Level</span>
                        <div className="metric-value-row">
                            <span className="huge-number">{stressDisplay}</span>
                            <span className="metric-unit">%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${stress}%` }}></div>
                        </div>
                        {stressStatus && (
                            <div className={`status-pill ${stressStatus === 'Low' ? 'status-normal' : 'status-warning'}`}>
                                <span className={`dot ${stressStatus === 'Low' ? 'green-dot' : 'yellow-dot'}`}></span>
                                {stressStatus}
                            </div>
                        )}
                    </div>

                    <div className="divider"></div>

                    <div className="last-updated-row">
                        <motion.div
                            className="ping-dot"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </motion.div>
                        <span>Updated just now</span>
                    </div>
                </motion.div>

                {/* Center Column: 3D Scene Placeholder */}
                <motion.div
                    className="dash-column center-column panel-card"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                >
                    <RespiratorySystem heartRate={safeHeartRate} />
                    <span className="placeholder-text">RESPIRATORY SYSTEM</span>
                </motion.div>

                {/* Right Column: Support & Location */}
                <motion.div
                    className="dash-column panel-card"
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
                >
                    <span className="panel-label">SUPPORT NETWORK</span>

                    <div className="sponsor-card">
                        <div className="sponsor-header">
                            <div className="avatar">JP</div>
                            <div className="sponsor-info">
                                <span className="sponsor-name">Jeet Paldiya</span>
                                <span className="sponsor-role">Sponsor &middot; Available</span>
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <span className="panel-label">LOCATION STATUS</span>
                    <div className={`location-card ${nearTrigger ? 'location-card-risk' : ''}`}>
                    <svg className="location-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <div className="location-info">
                        <span className="location-title">
                            {nearTrigger ? '⚠️ Trigger Location Nearby' : 'Safe Zone'}
                        </span>
                        <span className="location-subtitle">
                            {nearTrigger ? 'High risk area detected' : 'No trigger locations nearby'}
                        </span>
                    </div>
                </div>

                    <div className="divider"></div>

                    <span className="panel-label">LAST ALERT</span>
                    <div className="alert-card">
                        <span className="alert-text">No alerts today</span>
                        <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </div>
                </motion.div>

            </div>
            {/* Alert Overlay */}
            {alertMessage && (
                <div style={{
                    position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                    background: '#C2185B', color: 'white', padding: '16px 24px', borderRadius: 8,
                    maxWidth: 400, textAlign: 'center', zIndex: 999
                }}>
                    {alertMessage}
                </div>
            )}
        </div>
    );
};

export default DashboardScreen;
