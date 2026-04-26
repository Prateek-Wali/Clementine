"use client";
import React, { useEffect, useState } from 'react';
import { motion, Transition, useAnimation } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './HeartScreen.css';

const HEART_PATH = "M16 27.5C16 27.5 3 18.5 3 10C3 5.5 7 2.5 11 2.5C14 2.5 15.5 4.5 16 6C16.5 4.5 18 2.5 21 2.5C25 2.5 29 5.5 29 10C29 18.5 16 27.5 16 27.5Z";
const INNER_SHADOW_PATH = "M16 27C16 27 27.5 18.5 27.5 10C27.5 7 25 4 22 3.5C24.5 4.5 26 7 26 10C26 17.5 16 25.5 16 25.5Z";

type HeartSvgProps = {
    size: number;
    strokeWidth?: number;
    gradientStops: [string, string, string];
    strokeColor: string;
    shadowColor: string;
};

const HeartSvg = ({ size, strokeWidth = 2, gradientStops, strokeColor, shadowColor }: HeartSvgProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            {/* Smooth gradient fill */}
            <linearGradient id={`heartGradient-${size}`} x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor={gradientStops[0]} />
                <stop offset="40%" stopColor={gradientStops[1]} />
                <stop offset="100%" stopColor={gradientStops[2]} />
            </linearGradient>

            {/* SVG Filter for Sketchy / Hand-drawn lines */}
            <filter id={`sketchy-${size}`} x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.45" xChannelSelector="R" yChannelSelector="G" />
            </filter>

            {/* Hatching Pattern for the cel-shaded shadow */}
            <pattern id={`hatch-${size}`} width="1.2" height="1.2" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="1.2" stroke="#000000" strokeWidth="0.3" strokeOpacity="0.4" />
            </pattern>
        </defs>

        {/* Main Heart Shape Fill (Smooth) */}
        <path
            d={HEART_PATH}
            fill={`url(#heartGradient-${size})`}
        />

        {/* Cel-shaded bottom-right inner shadow (Base color) */}
        <path
            d={INNER_SHADOW_PATH}
            fill={shadowColor}
            opacity="0.6"
        />

        {/* Hatching texture overlay for the shadow */}
        <path
            d={INNER_SHADOW_PATH}
            fill={`url(#hatch-${size})`}
            opacity="0.7"
        />

        {/* Sketchy Hand-drawn Border */}
        <path
            d={HEART_PATH}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={`url(#sketchy-${size})`}
        />

        {/* Glossy highlight (top left oval) - Kept smooth */}
        <ellipse
            cx="9.5" cy="6.5" rx="3.5" ry="1.5"
            transform="rotate(-38 9.5 6.5)"
            fill="#FFFFFF"
            opacity="0.9"
        />

        {/* Extra tiny highlight dot for polish */}
        <circle cx="13.5" cy="5" r="0.8" fill="#FFFFFF" opacity="0.9" />
    </svg>
);

const HeartScreen: React.FC = () => {
    const router = useRouter();

    const [visibleText, setVisibleText] = useState("");
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const fullMessage = "Hey Mike, John might need your support right now. He's having a tough moment — worth giving him a call in the next few minutes.";

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>;

        const startDelay = setTimeout(() => {
            let currentIndex = 0;
            intervalId = setInterval(() => {
                if (currentIndex < fullMessage.length) {
                    setVisibleText(fullMessage.substring(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(intervalId);
                    setIsTypingComplete(true);
                }
            }, 35);
        }, 1200);

        return () => {
            clearTimeout(startDelay);
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const smallControls = useAnimation();
    const mediumControls = useAnimation();
    const largeControls = useAnimation();

    useEffect(() => {
        const runAnimations = async () => {
            const entranceTransition = { type: "spring" as const, stiffness: 260, damping: 18 };

            // Animate entrances simultaneously
            await Promise.all([
                smallControls.start({ scale: 1, opacity: 1, transition: { ...entranceTransition, delay: 0.1 } }),
                mediumControls.start({ scale: 1, opacity: 1, transition: { ...entranceTransition, delay: 0.35 } }),
                largeControls.start({ scale: 1, opacity: 1, transition: { ...entranceTransition, delay: 0.6 } })
            ]);

            // Hand off to continuous heartbeat pulse loop
            smallControls.start({ scale: [1, 1.04, 1], transition: pulseTransition(0) });
            mediumControls.start({ scale: [1, 1.04, 1], transition: pulseTransition(0.15) });
            largeControls.start({ scale: [1, 1.04, 1], transition: pulseTransition(0.3) });
        };

        runAnimations();
    }, [smallControls, mediumControls, largeControls]);

    const buttonAnim = {
        whileHover: { scale: 1.06, transition: { type: "spring" as const, stiffness: 400, damping: 15 } },
        whileTap: { scale: 0.88, y: 3, transition: { type: "spring" as const, stiffness: 600, damping: 20 } }
    };

    // Framer Motion shared animation config
    const pulseTransition = (delay: number): Transition => ({
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        delay: delay
    });

    return (
        <div className="heart-screen">

            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="nav-left">
                    <motion.div {...buttonAnim}>
                        <Link href="/" style={{ display: 'block' }}>Home</Link>
                    </motion.div>
                    <motion.div {...buttonAnim}>
                        <Link href="/about" style={{ display: 'block' }}>About</Link>
                    </motion.div>
                </div>
                <div className="nav-center">
                    <h1>Clementine</h1>
                </div>
                <div className="nav-right">
                    <motion.button className="sign-in-btn" onClick={() => router.push('/transition')} {...buttonAnim}>Sign In</motion.button>
                </div>
            </nav>

            <div className="content-container">

                {/* Left Panel: App Description */}
                <motion.div
                    className="left-panel"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                >
                    <div className="left-content">
                        <span className="category-tag">Recovery Support</span>
                        <h2 className="main-heading">Your lifeline in the moments that matter.</h2>
                        <p className="description">
                            Clementine monitors your body and location in real time. When it detects a high-risk moment of a relapse, it reaches out to the people who care about you — before you have to ask.
                        </p>
                        <div className="button-group">
                            <motion.button className="btn-primary" onClick={() => router.push('/transition')} {...buttonAnim}>Get Started</motion.button>
                            <motion.button className="btn-secondary" onClick={() => router.push('/about')} {...buttonAnim}>Learn More</motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Center Panel: Hearts */}
                <div className="center-panel">
                    {/* 420x420 Large Heart (Outermost) */}
                    <motion.div
                        className="heart-wrapper heart-large"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={largeControls}
                    >
                        <HeartSvg
                            size={420}
                            strokeWidth={0.8}
                            gradientStops={["#FCE4EC", "#F8BBD9", "#F06292"]}
                            strokeColor="#F48FB1"
                            shadowColor="#E91E8C"
                        />
                    </motion.div>

                    {/* 180x180 Medium Heart */}
                    <motion.div
                        className="heart-wrapper heart-medium"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={mediumControls}
                    >
                        <HeartSvg
                            size={180}
                            strokeWidth={1.5}
                            gradientStops={["#F48FB1", "#E91E8C", "#C2185B"]}
                            strokeColor="#C2185B"
                            shadowColor="#880E4F"
                        />
                    </motion.div>

                    {/* 32x32 Small Center Heart (Innermost) */}
                    <motion.div
                        className="heart-wrapper heart-small"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={smallControls}
                    >
                        <HeartSvg
                            size={32}
                            strokeWidth={2.2}
                            gradientStops={["#E91E8C", "#C2185B", "#880E4F"]}
                            strokeColor="#880E4F"
                            shadowColor="#4A0024"
                        />
                    </motion.div>
                </div>

                {/* Right Panel: iMessage */}
                <motion.div
                    className="right-panel"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
                >
                    <div className="imessage-container">
                        <div className="imessage-header">
                            <span>iMessage</span>
                            <span>Risk level: Low</span>
                            <span>now</span>
                        </div>

                        <div className="imessage-body">
                            <div className="imessage-bubble">
                                {visibleText}
                                {!isTypingComplete && (
                                    <motion.span
                                        initial={{ opacity: 1 }}
                                        animate={{ opacity: 0 }}
                                        transition={{ repeat: Infinity, duration: 0.5, repeatType: "reverse" }}
                                    >
                                        |
                                    </motion.span>
                                )}
                            </div>
                        </div>

                        <motion.div
                            className="imessage-footer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isTypingComplete ? 1 : 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            Sent automatically by Clementine
                        </motion.div>
                    </div>
                </motion.div>

            </div>

        </div>
    );
};

export default HeartScreen;
