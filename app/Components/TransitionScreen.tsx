import React, { useEffect } from 'react';
import { motion, Transition, useAnimation, Variants } from 'framer-motion';
import './TransitionScreen.css';

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
            <linearGradient id={`heartGradient-${size}`} x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor={gradientStops[0]} />
                <stop offset="40%" stopColor={gradientStops[1]} />
                <stop offset="100%" stopColor={gradientStops[2]} />
            </linearGradient>

            <filter id={`sketchy-${size}`} x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.45" xChannelSelector="R" yChannelSelector="G" />
            </filter>

            <pattern id={`hatch-${size}`} width="1.2" height="1.2" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="1.2" stroke="#000000" strokeWidth="0.3" strokeOpacity="0.4" />
            </pattern>
        </defs>

        <path d={HEART_PATH} fill={`url(#heartGradient-${size})`} />
        <path d={INNER_SHADOW_PATH} fill={shadowColor} opacity="0.6" />
        <path d={INNER_SHADOW_PATH} fill={`url(#hatch-${size})`} opacity="0.7" />
        <path
            d={HEART_PATH}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={`url(#sketchy-${size})`}
        />
        <ellipse cx="9.5" cy="6.5" rx="3.5" ry="1.5" transform="rotate(-38 9.5 6.5)" fill="#FFFFFF" opacity="0.9" />
        <circle cx="13.5" cy="5" r="0.8" fill="#FFFFFF" opacity="0.9" />
    </svg>
);

const TransitionScreen: React.FC = () => {
    const smallControls = useAnimation();
    const mediumControls = useAnimation();
    const largeControls = useAnimation();

    useEffect(() => {
        // Redirect logic
        const redirectTimer = setTimeout(() => {
            window.location.href = 'http://localhost:3001/fitbit/auth';
        }, 1500);

        return () => clearTimeout(redirectTimer);
    }, []);

    useEffect(() => {
        // Hearts entrance and pulse animation
        const runAnimations = async () => {
            const entranceTransition = { type: "spring" as const, stiffness: 260, damping: 18 };

            await Promise.all([
                smallControls.start({ scale: 1, opacity: 1, transition: { ...entranceTransition, delay: 0.1 } }),
                mediumControls.start({ scale: 1, opacity: 1, transition: { ...entranceTransition, delay: 0.35 } }),
                largeControls.start({ scale: 1, opacity: 1, transition: { ...entranceTransition, delay: 0.6 } })
            ]);

            const pulseTransition = (delay: number): Transition => ({
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.5, 1],
                delay: delay
            });

            smallControls.start({ scale: [1, 1.04, 1], transition: pulseTransition(0) });
            mediumControls.start({ scale: [1, 1.04, 1], transition: pulseTransition(0.15) });
            largeControls.start({ scale: [1, 1.04, 1], transition: pulseTransition(0.3) });
        };

        runAnimations();
    }, [smallControls, mediumControls, largeControls]);

    const dotVariants: Variants = {
        animate: {
            scale: [0.6, 1.0, 0.6],
            opacity: [0.5, 1, 0.5],
            transition: {
                repeat: Infinity,
                duration: 0.8,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="transition-screen">
            <motion.div
                className="transition-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="transition-logo">Clementine</h1>

                <div className="transition-hearts-container">
                    <motion.div className="heart-wrapper heart-large" initial={{ scale: 0, opacity: 0 }} animate={largeControls}>
                        <HeartSvg size={420} strokeWidth={0.8} gradientStops={["#FCE4EC", "#F8BBD9", "#F06292"]} strokeColor="#F48FB1" shadowColor="#E91E8C" />
                    </motion.div>

                    <motion.div className="heart-wrapper heart-medium" initial={{ scale: 0, opacity: 0 }} animate={mediumControls}>
                        <HeartSvg size={180} strokeWidth={1.5} gradientStops={["#F48FB1", "#E91E8C", "#C2185B"]} strokeColor="#C2185B" shadowColor="#880E4F" />
                    </motion.div>

                    <motion.div className="heart-wrapper heart-small" initial={{ scale: 0, opacity: 0 }} animate={smallControls}>
                        <HeartSvg size={32} strokeWidth={2.2} gradientStops={["#E91E8C", "#C2185B", "#880E4F"]} strokeColor="#880E4F" shadowColor="#4A0024" />
                    </motion.div>
                </div>

                <motion.div
                    className="transition-text-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                >
                    <p className="transition-text">Connecting to your Fitbit...</p>
                </motion.div>

                <motion.div
                    className="transition-dots"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                >
                    <motion.div className="dot" variants={dotVariants} animate="animate" transition={{ delay: 0 }} />
                    <motion.div className="dot" variants={dotVariants} animate="animate" transition={{ delay: 0.2 }} />
                    <motion.div className="dot" variants={dotVariants} animate="animate" transition={{ delay: 0.4 }} />
                </motion.div>

            </motion.div>
        </div>
    );
};

export default TransitionScreen;
