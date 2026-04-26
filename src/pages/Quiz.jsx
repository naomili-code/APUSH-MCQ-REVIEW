import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Quiz() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  
  const [chapter, setChapter] = useState(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [shuffled, setShuffled] = useState(false);

  useEffect(() => {
    fetchChapter();
  }, [chapterId]);

  useEffect(() => {
    let interval;
    if (timerEnabled && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerEnabled, timer]);

  const fetchChapter = async () => {
    try {
      const res = await fetch(`/api/chapters/${chapterId}`);
      const data = await res.json();
      setChapter(data);
    } catch (err) {
      console.error('Error fetching chapter:', err);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleShuffle = () => {
    if (chapter) {
      const shuffledSets = shuffleArray(chapter.stimulusSets);
      setChapter({ ...chapter, stimulusSets: shuffledSets });
      setShuffled(true);
    }
  };

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
    if (chapter && currentSetIndex < chapter.stimulusSets.length - 1) {
      setCurrentSetIndex(prev => prev + 1);
      setAnswers({});
      setShowFeedback(false);
    } else {
      // Save results to sessionStorage for Results page
      const results = {
        chapterTitle: chapter.title,
        stimulusSets: chapter.stimulusSets,
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

  const calculateScore = () => {
    if (!chapter) return { correct: 0, total: 0 };
    
    let correct = 0;
    let total = 0;
    
    for (const set of chapter.stimulusSets) {
      for (const q of set.questions) {
        total++;
        if (answers[q.question] === q.correctAnswer) {
          correct++;
        }
      }
    }
    
    return { correct, total };
  };

  const getScoreBySet = (set) => {
    let correct = 0;
    let total = set.questions.length;
    
    for (const q of set.questions) {
      if (answers[q.question] === q.correctAnswer) {
        correct++;
      }
    }
    
    return { correct, total };
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apush-blue mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading quiz...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Chapter not found.</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Back to Home
        </button>
      </div>
    );
  }

  const currentSet = chapter.stimulusSets[currentSetIndex];
  const score = calculateScore();
  const setScore = getScoreBySet(currentSet);

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
          Set {currentSetIndex + 1} of {chapter.stimulusSets.length}
        </div>
      </div>

      {/* Chapter Title */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-apush-blue">{chapter.title}</h1>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="tag tag-period">Period {currentSet.period}</span>
          {currentSet.topics.map(topic => (
            <span key={topic} className="tag tag-topic">{topic}</span>
          ))}
        </div>
      </div>

      {/* Stimulus */}
      <div className="stimulus-box">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">
            {currentSet.stimulus.type === 'text' ? '📄' : 
             currentSet.stimulus.type === 'image' ? '🖼️' : '📊'}
          </span>
          <span className="font-semibold text-apush-blue">Stimulus</span>
        </div>
        <p className="text-lg text-gray-800 leading-relaxed">
          {currentSet.stimulus.content}
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {currentSet.questions.map((q, qIndex) => (
          <div key={qIndex} className="question-card">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-apush-blue">
                Question {qIndex + 1}
              </h3>
              <span className="tag tag-skill">{q.skill}</span>
            </div>
            
            <p className="text-gray-800 mb-4">{q.question}</p>
            
            <div className="space-y-3">
              {Object.entries(q.choices).map(([letter, text]) => {
                const isSelected = answers[q.question] === letter;
                const isCorrect = q.correctAnswer === letter;
                const showCorrect = showFeedback && isCorrect;
                const showIncorrect = showFeedback && isSelected && !isCorrect;
                
                let btnClass = 'answer-btn';
                if (showCorrect) btnClass += ' correct';
                else if (showIncorrect) btnClass += ' incorrect';
                else if (isSelected) btnClass += ' selected';
                
                return (
                  <button
                    key={letter}
                    onClick={() => handleAnswerSelect(q.question, letter)}
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
              <div className={`mt-4 p-4 rounded-lg ${answers[q.question] === q.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={answers[q.question] === q.correctAnswer ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {answers[q.question] === q.correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
                  </span>
                  {answers[q.question] !== q.correctAnswer && (
                    <span className="text-green-600 font-bold">
                      Correct Answer: {q.correctAnswer}
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{q.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Set Score */}
      {showFeedback && (
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-apush-blue">Set Score</h3>
              <p className="text-gray-600">
                {setScore.correct} out of {setScore.total} correct
                {' '}({Math.round((setScore.correct / setScore.total) * 100)}%)
              </p>
            </div>
            <div className="text-3xl font-bold text-apush-gold">
              {Math.round((setScore.correct / setScore.total) * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mt-6">
        {!showFeedback ? (
          <>
            <button
              onClick={handleShuffle}
              className="btn-secondary"
              disabled={shuffled}
            >
              {shuffled ? 'Shuffled ✓' : '🔀 Shuffle Questions'}
            </button>
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
              disabled={Object.keys(answers).length < currentSet.questions.length}
            >
              Submit Answers
            </button>
          </>
        ) : (
          <>
            <button onClick={handleRetry} className="btn-secondary">
              🔄 Retry This Set
            </button>
            <button onClick={handleNext} className="btn-primary">
              {currentSetIndex < chapter.stimulusSets.length - 1 
                ? 'Next Stimulus Set →' 
                : 'View Final Results →'}
            </button>
          </>
        )}
      </div>

      {/* Progress */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-apush-blue mb-4">Overall Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-apush-blue h-4 rounded-full transition-all duration-300"
            style={{ width: `${((currentSetIndex + 1) / chapter.stimulusSets.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{currentSetIndex + 1} of {chapter.stimulusSets.length} stimulus sets</span>
          <span>Total: {score.correct}/{score.total} correct</span>
        </div>
      </div>
    </div>
  );
}

export default Quiz;