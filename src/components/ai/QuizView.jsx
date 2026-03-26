import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle, ChevronRight, Award } from 'lucide-react';

// Styles
import './QuizView.css';

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
            <div className="card quiz-finished-card">
                <Award size={48} color="var(--primary)" />
                <h3 className="text-title-lg">Quiz Complete</h3>
                <p className="text-display-md quiz-score-display">{score} / {questions.length}</p>
                <div className="quiz-progress-track">
                    <div 
                        className="quiz-progress-fill"
                        style={{ width: `${(score / questions.length) * 100}%` }} 
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="card quiz-view-card">
            {/* Header */}
            <div className="quiz-header">
                <span className="quiz-info-label">
                    Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="quiz-score-label">
                    Score: {score}
                </span>
            </div>

            {/* Question */}
            <h4 className="text-title-md quiz-question-text">{currentQ.question}</h4>

            {/* Hint Button */}
            {!showHint && !isAnswered && currentQ.hint && (
                <button 
                    onClick={() => setShowHint(true)}
                    className="btn btn-ghost quiz-hint-btn"
                >
                    <HelpCircle size={16} /> Show Hint
                </button>
            )}

            {/* Hint Display */}
            <AnimatePresence>
                {showHint && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="quiz-hint-box"
                    >
                        {currentQ.hint}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Options */}
            <div className="quiz-options-list">
                {currentQ.options.map((opt, idx) => {
                    let optionStatusClass = 'default';
                    let icon = null;

                    if (isAnswered) {
                        if (opt === currentQ.answer) {
                            optionStatusClass = 'correct';
                            icon = <CheckCircle2 size={18} color="var(--secondary)" />;
                        } else if (opt === selectedOption) {
                            optionStatusClass = 'incorrect';
                            icon = <XCircle size={18} color="var(--error)" />;
                        } else {
                            optionStatusClass = 'muted';
                        }
                    } else if (opt === selectedOption) {
                        optionStatusClass = 'selected-pending';
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(opt)}
                            disabled={isAnswered}
                            className={`quiz-option-btn ${optionStatusClass}`}
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
                        className="quiz-footer"
                    >
                        <button 
                            onClick={handleNext}
                            className="btn btn-primary quiz-next-btn"
                        >
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ChevronRight size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
