import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Review() {
  const navigate = useNavigate();
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const savedResults = sessionStorage.getItem('quizResults');
    if (savedResults) {
      const parsed = JSON.parse(savedResults);
      const incorrect = [];
      
      for (const set of parsed.stimulusSets) {
        for (const q of set.questions) {
          if (parsed.answers[q.question] !== q.correctAnswer) {
            incorrect.push({
              ...q,
              period: set.period,
              topics: set.topics,
              userAnswer: parsed.answers[q.question]
            });
          }
        }
      }
      
      setIncorrectQuestions(incorrect);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleNext = () => {
    if (currentIndex < incorrectQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  if (incorrectQuestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-apush-blue mb-4">No Incorrect Answers!</h1>
        <p className="text-xl text-gray-600 mb-8">
          You got all questions correct. Great job!
        </p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const currentQ = incorrectQuestions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="text-apush-blue hover:underline">
          ← Back to Home
        </Link>
        <div className="text-gray-600">
          Question {currentIndex + 1} of {incorrectQuestions.length}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-apush-blue h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / incorrectQuestions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="tag tag-period">Period {currentQ.period}</span>
          <span className="tag tag-skill">{currentQ.skill}</span>
          {currentQ.topics.map(topic => (
            <span key={topic} className="tag tag-topic">{topic}</span>
          ))}
        </div>

        {/* Question */}
        <h2 className="text-xl font-bold text-apush-blue mb-6">
          {currentQ.question}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {Object.entries(currentQ.choices).map(([letter, text]) => {
            const isUserAnswer = currentQ.userAnswer === letter;
            const isCorrect = currentQ.correctAnswer === letter;
            
            let btnClass = 'p-4 border-2 rounded-lg ';
            if (showAnswer) {
              if (isCorrect) {
                btnClass += 'bg-green-100 border-green-500 text-green-800';
              } else if (isUserAnswer) {
                btnClass += 'bg-red-100 border-red-500 text-red-800';
              } else {
                btnClass += 'border-gray-200 text-gray-500';
              }
            } else {
              btnClass += 'border-gray-200';
            }
            
            return (
              <div key={letter} className={btnClass}>
                <span className="font-bold mr-3">{letter}.</span>
                {text}
                {isUserAnswer && !showAnswer && (
                  <span className="ml-2 text-red-600">(Your answer)</span>
                )}
                {isCorrect && showAnswer && (
                  <span className="ml-2 text-green-600">(Correct)</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {showAnswer && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="font-bold text-apush-blue mb-2">Explanation</h3>
            <p className="text-gray-700">{currentQ.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="btn-primary"
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
          
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn-secondary disabled:opacity-50"
          >
            ← Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === incorrectQuestions.length - 1}
            className="btn-secondary disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex flex-wrap gap-2 justify-center mt-6">
        {incorrectQuestions.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i);
              setShowAnswer(false);
            }}
            className={`w-3 h-3 rounded-full ${
              i === currentIndex 
                ? 'bg-apush-blue' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Back to Results */}
      <div className="text-center mt-8">
        <Link to="/results" className="text-apush-blue hover:underline">
          ← View Full Results
        </Link>
      </div>
    </div>
  );
}

export default Review;