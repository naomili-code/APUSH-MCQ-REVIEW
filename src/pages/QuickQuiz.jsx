import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function QuickQuiz() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);

  useEffect(() => {
    // Load quiz data from sessionStorage
    const savedData = sessionStorage.getItem('quickQuizData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setQuizData(parsed);
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (timerEnabled && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerEnabled, timer]);

  const handleAnswerSelect = (questionId, answer) => {
    if (showFeedback) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setShowFeedback(true);
    if (timerEnabled) {
      setTimerEnabled(false);
    }
  };

  const handleNext = () => {
    if (quizData && currentIndex < quizData.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswers({});
      setShowFeedback(false);
    } else {
      // Save results
      const results = {
        chapterTitle: quizData.useWeightedDistribution 
          ? `Quick Quiz (Weighted - ${quizData.mode})` 
          : `Quick Quiz (Equal Coverage)`,
        stimulusSets: groupQuestionsByStimulus(quizData.questions),
        answers,
        timer: timerEnabled ? timer : null
      };
      sessionStorage.setItem('quizResults', JSON.stringify(results));
      navigate('/results');
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setShowFeedback(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Group questions by their stimulus for display
  const groupQuestionsByStimulus = (questions) => {
    // For quick quiz, we'll group by period instead
    const grouped = {};
    for (const q of questions) {
      const period = q.period;
      if (!grouped[period]) {
        grouped[period] = {
          id: `period-${period}`,
          period: period,
          topics: q.topics || [],
          stimulus: {
            type: 'text',
            content: `Questions about Period ${period} topics`
          },
          questions: []
        };
      }
      grouped[period].questions.push(q);
    }
    return Object.values(grouped);
  };

  const calculateScore = () => {
    if (!quizData) return { correct: 0, total: 0 };
    
    let correct = 0;
    let total = quizData.questions.length;
    
    for (const q of quizData.questions) {
      if (answers[q.question] === q.correctAnswer) {
        correct++;
      }
    }
    
    return { correct, total };
  };

  if (!quizData) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apush-blue mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading quiz...</p>
      </div>
    );
  }

  const currentQ = quizData.questions[currentIndex];
  const score = calculateScore();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-apush-blue hover:underline"
        >
          ← Back to Home
        </button>
        
        {timerEnabled && (
          <div className={`text-2xl font-bold ${timer < 60 ? 'text-red-600' : 'text-apush-blue'}`}>
            {formatTime(timer)}
          </div>
        )}
        
        <div className="text-gray-600">
          Question {currentIndex + 1} of {quizData.questions.length}
        </div>
      </div>

      {/* Quiz Info */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-apush-blue">Quick Quiz</h1>
            <p className="text-gray-600">
              {quizData.useWeightedDistribution 
                ? 'Weighted distribution based on AP exam frequency' 
                : 'Equal coverage across all periods'}
            </p>
          </div>
          <div className="text-right">
            <span className="tag tag-period">Period {currentQ.period}</span>
            <span className="tag tag-skill ml-2">{currentQ.skill}</span>
          </div>
        </div>
      </div>

      {/* Stimulus */}
      <div className="stimulus-box">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📄</span>
          <span className="font-semibold text-apush-blue">Stimulus</span>
        </div>
        <p className="text-lg text-gray-800 leading-relaxed">
          {currentQ.stimulus?.content || currentQ.chapterTitle}
        </p>
      </div>

      {/* Question */}
      <div className="question-card">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-apush-blue">
            Question {currentIndex + 1}
          </h3>
          <span className="tag tag-skill">{currentQ.skill}</span>
        </div>
        
        <p className="text-gray-800 mb-4">{currentQ.question}</p>
        
        <div className="space-y-3">
          {Object.entries(currentQ.choices).map(([letter, text]) => {
            const isSelected = answers[currentQ.question] === letter;
            const isCorrect = currentQ.correctAnswer === letter;
            const showCorrect = showFeedback && isCorrect;
            const showIncorrect = showFeedback && isSelected && !isCorrect;
            
            let btnClass = 'answer-btn';
            if (showCorrect) btnClass += ' correct';
            else if (showIncorrect) btnClass += ' incorrect';
            else if (isSelected) btnClass += ' selected';
            
            return (
              <button
                key={letter}
                onClick={() => handleAnswerSelect(currentQ.question, letter)}
                disabled={showFeedback}
                className={btnClass}
              >
                <span className="font-bold mr-3">{letter}.</span>
                {text}
                {showCorrect && <span className="ml-2">✓</span>}
                {showIncorrect && <span className="ml-2">✗</span>}
              </button>
            );
          })}
        </div>
        
        {/* Explanation */}
        {showFeedback && (
          <div className={`mt-4 p-4 rounded-lg ${answers[currentQ.question] === currentQ.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={answers[currentQ.question] === currentQ.correctAnswer ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {answers[currentQ.question] === currentQ.correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
              </span>
              {answers[currentQ.question] !== currentQ.correctAnswer && (
                <span className="text-green-600 font-bold">
                  Correct Answer: {currentQ.correctAnswer}
                </span>
              )}
            </div>
            <p className="text-gray-700">{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {/* Score */}
      {showFeedback && (
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-apush-blue">Current Score</h3>
              <p className="text-gray-600">
                {score.correct} out of {score.total} correct
                {' '}({Math.round((score.correct / score.total) * 100)}%)
              </p>
            </div>
            <div className="text-3xl font-bold text-apush-gold">
              {Math.round((score.correct / score.total) * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mt-6">
        {!showFeedback ? (
          <>
            <button
              onClick={() => {
                setTimer(60 * 15); // 15 minutes
                setTimerEnabled(true);
              }}
              className="btn-secondary"
              disabled={timerEnabled}
            >
              ⏱️ Start 15-min Timer
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={Object.keys(answers).length < 1}
            >
              Submit Answer
            </button>
          </>
        ) : (
          <>
            <button onClick={handleRetry} className="btn-secondary">
              🔄 Retry Question
            </button>
            <button onClick={handleNext} className="btn-primary">
              {currentIndex < quizData.questions.length - 1 
                ? 'Next Question →' 
                : 'View Final Results →'}
            </button>
          </>
        )}
      </div>

      {/* Progress */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-apush-blue mb-4">Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-apush-blue h-4 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / quizData.questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{currentIndex + 1} of {quizData.questions.length} questions</span>
          <span>Total: {score.correct}/{score.total} correct</span>
        </div>
      </div>
    </div>
  );
}

export default QuickQuiz;