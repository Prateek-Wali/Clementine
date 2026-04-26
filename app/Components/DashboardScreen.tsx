import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import RespiratorySystem from './RespiratorySystem';
import './DashboardScreen.css';

const POLL_INTERVAL_MS = 5_000;

const DashboardScreen: React.FC = () => {
    const [displayHeartRate, setDisplayHeartRate] = useState<number>(72);
    const isSimulatingRef = useRef<boolean>(true);
    const simulatedHRRef = useRef<number>(72);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const crisisRef = useRef<boolean>(false);
    const displayHrRef = useRef<number>(72);
    const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fitbitIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Keep ref in sync so intervals/timeouts always read latest value
    useEffect(() => {
        displayHrRef.current = displayHeartRate;
    }, [displayHeartRate]);

    // Derived values from displayHeartRate
    const hrv = Math.max(18, Math.min(55, Math.round(55 - (displayHeartRate - 58) * 0.6)));
    const stress = Math.max(8, Math.min(95, Math.round(((displayHeartRate - 68) / 68) * 100 + 20)));
    const hrDisplay = String(Math.round(displayHeartRate));
    const stressDisplay = String(stress);
    const hrStatus = displayHeartRate >= 60 && displayHeartRate <= 100 ? 'Normal' : 'Elevated';
    const stressStatus = stress < 30 ? 'Low' : stress < 60 ? 'Moderate' : 'High';

    const buttonAnim = {
        whileHover: { scale: 1.06, transition: { type: "spring" as const, stiffness: 400, damping: 15 } },
        whileTap: { scale: 0.88, y: 3, transition: { type: "spring" as const, stiffness: 600, damping: 20 } }
    };

    // ─── SIMULATION ENGINE ────────────────────────────────────────────
    useEffect(() => {
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
        }
        simulationIntervalRef.current = setInterval(() => {
            if (!isSimulatingRef.current) return;

            const drift = Math.random() * 3 - 1.5;
            let next = simulatedHRRef.current + drift;
            if (next > 82) next = 82;
            if (next < 58) next = 58;
            simulatedHRRef.current = next;
            setDisplayHeartRate(Math.round(next));
        }, 2000);

        return () => {
            if (simulationIntervalRef.current) {
                clearInterval(simulationIntervalRef.current);
                simulationIntervalRef.current = null;
            }
        };
    }, []);

    // ─── REAL DATA FETCH ──────────────────────────────────────────────
    useEffect(() => {
        const fetchHeartRate = async () => {
            try {
                const res = await fetch('http://localhost:3001/fitbit/heartrate');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const bpm = data?.heartRate ?? data?.bpm ?? data?.value;
                if (typeof bpm === 'number') {
                    console.log(`Real Fitbit data received: ${bpm} BPM`);
                    simulatedHRRef.current = bpm;
                    isSimulatingRef.current = false;
                    setDisplayHeartRate(bpm);
                    setTimeout(() => { isSimulatingRef.current = true; }, 3000);
                }
            } catch {
                console.log('Fitbit fetch failed, continuing simulation');
            }
        };

        fetchHeartRate();
        if (fitbitIntervalRef.current) {
            clearInterval(fitbitIntervalRef.current);
        }
        fitbitIntervalRef.current = setInterval(fetchHeartRate, POLL_INTERVAL_MS);
        return () => {
            if (fitbitIntervalRef.current) {
                clearInterval(fitbitIntervalRef.current);
                fitbitIntervalRef.current = null;
            }
        };
    }, []);

    // ─── CRISIS SIMULATION (spacebar) ─────────────────────────────────
    const triggerCrisis = useCallback(() => {
        if (crisisRef.current) return; // already running
        crisisRef.current = true;
        isSimulatingRef.current = false;

        const startBpm = displayHrRef.current;
        const peakBpm = 118;
        const restBpm = 72;

        // Phase 1: Ramp UP over ~20s (every 1200ms, +3 BPM)
        const rampUpSteps = Math.ceil((peakBpm - startBpm) / 3);
        const rampUpIncrement = (peakBpm - startBpm) / rampUpSteps;
        let step = 0;

        const rampUpId = setInterval(() => {
            step++;
            const next = Math.min(peakBpm, startBpm + rampUpIncrement * step);
            setDisplayHeartRate(Math.round(next));
            if (next >= peakBpm) {
                clearInterval(rampUpId);

                // Phase 2: HOLD at 118 for 10s with ±1 jitter
                const holdId = setInterval(() => {
                    const jitter = (Math.random() - 0.5) * 2; // ±1
                    setDisplayHeartRate(Math.round(peakBpm + jitter));
                }, 800);

                setTimeout(() => {
                    clearInterval(holdId);

                    // Phase 3: Ramp DOWN over ~25s (every 1500ms, -2 BPM)
                    const rampDownSteps = Math.ceil((peakBpm - restBpm) / 2);
                    const rampDownDecrement = (peakBpm - restBpm) / rampDownSteps;
                    let downStep = 0;

                    const rampDownId = setInterval(() => {
                        downStep++;
                        const next = Math.max(restBpm, peakBpm - rampDownDecrement * downStep);
                        setDisplayHeartRate(Math.round(next));
                        if (next <= restBpm) {
                            clearInterval(rampDownId);
                            crisisRef.current = false;
                            simulatedHRRef.current = restBpm;
                            isSimulatingRef.current = true;
                        }
                    }, 1500);
                }, 10000);
            }
        }, 1200);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat) {
                // Prevent scrolling
                e.preventDefault();
                triggerCrisis();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [triggerCrisis]);

    // ─── WAVEFORM CANVAS ─────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let offset = 0;

        const draw = () => {
            const amplitude = (displayHrRef.current - 50) / 80 * 20 + 5;

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
                <div className="nav-right">
                    <motion.button className="call-btn" {...buttonAnim}>Call Sponsor</motion.button>
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
                    <RespiratorySystem heartRate={displayHeartRate} />
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
                            <div className="avatar">JM</div>
                            <div className="sponsor-info">
                                <span className="sponsor-name">James M.</span>
                                <span className="sponsor-role">Sponsor &middot; Available</span>
                            </div>
                        </div>
                        <motion.button className="call-sponsor-btn" {...buttonAnim}>Call James</motion.button>
                        <motion.button className="message-sponsor-btn" {...buttonAnim}>Send Message</motion.button>
                    </div>

                    <div className="divider"></div>

                    <span className="panel-label">LOCATION STATUS</span>
                    <div className="location-card">
                        <svg className="location-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <div className="location-info">
                            <span className="location-title">Safe Zone</span>
                            <span className="location-subtitle">No trigger locations nearby</span>
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
        </div>
    );
};

export default DashboardScreen;
