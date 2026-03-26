import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle, ChevronRight, Award } from 'lucide-react';

export default function QuizView({ quizData }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // Some AI models wrap the questions array in an object, just ensure we have the array
    const questions = Array.isArray(quizData) ? quizData : (quizData.questions || []);

    if (!questions || questions.length === 0) {
        return <div style={{ padding: '1rem', color: 'var(--error)' }}>Could not parse quiz data.</div>;
    }

    const currentQ = questions[currentIndex];

    const handleSelect = (option) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);
        if (option === currentQ.answer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setShowHint(false);
        } else {
            setIsFinished(true);
        }
    };

    if (isFinished) {
        return (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--surface-container-low)', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Award size={48} color="var(--primary)" />
                <h3 className="text-title-lg">Quiz Complete</h3>
                <p className="text-display-md" style={{ color: 'var(--primary)' }}>{score} / {questions.length}</p>
                <div style={{ marginTop: '1rem', width: '100%', height: '8px', backgroundColor: 'var(--surface-variant)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(score / questions.length) * 100}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.5s ease' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface-muted)' }}>
                    Question {currentIndex + 1} of {questions.length}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                    Score: {score}
                </span>
            </div>

            {/* Question */}
            <h4 className="text-title-md" style={{ fontWeight: 700 }}>{currentQ.question}</h4>

            {/* Hint Button */}
            {!showHint && !isAnswered && currentQ.hint && (
                <button 
                    onClick={() => setShowHint(true)}
                    className="btn btn-ghost"
                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 0' }}
                >
                    <HelpCircle size={16} /> Show Hint
                </button>
            )}

            {/* Hint Display */}
            <AnimatePresence>
                {showHint && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--surface-container-high)', borderRadius: '0.75rem', fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--on-surface-muted)' }}
                    >
                        {currentQ.hint}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentQ.options.map((opt, idx) => {
                    let bgColor = 'var(--surface-container-highest)';
                    let icon = null;
                    let borderColor = 'transparent';

                    if (isAnswered) {
                        if (opt === currentQ.answer) {
                            bgColor = 'rgba(82, 139, 109, 0.15)'; // Success tint
                            borderColor = 'var(--secondary)';
                            icon = <CheckCircle2 size={18} color="var(--secondary)" />;
                        } else if (opt === selectedOption) {
                            bgColor = 'rgba(146, 58, 35, 0.15)'; // Error tint
                            borderColor = 'var(--error)';
                            icon = <XCircle size={18} color="var(--error)" />;
                        } else {
                            bgColor = 'transparent'; // Mute others
                        }
                    } else if (opt === selectedOption) {
                        bgColor = 'var(--primary-container)';
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(opt)}
                            disabled={isAnswered}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1rem', borderRadius: '1rem', border: `1px solid ${borderColor}`,
                                backgroundColor: bgColor, cursor: isAnswered ? 'default' : 'pointer',
                                textAlign: 'left', fontWeight: 500, fontSize: '0.95rem',
                                color: isAnswered && opt !== currentQ.answer && opt !== selectedOption ? 'var(--on-surface-muted)' : 'var(--on-surface)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>{opt}</span>
                            {icon}
                        </button>
                    );
                })}
            </div>

            {/* Actions */}
            <AnimatePresence>
                {isAnswered && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}
                    >
                        <button 
                            onClick={handleNext}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '1rem' }}
                        >
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ChevronRight size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
