import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [stats, setStats] = useState({
    byPeriod: {},
    bySkill: {},
    incorrectQuestions: []
  });

  useEffect(() => {
    const savedResults = sessionStorage.getItem('quizResults');
    if (savedResults) {
      const parsed = JSON.parse(savedResults);
      setResults(parsed);
      calculateStats(parsed);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const calculateStats = (data) => {
    const byPeriod = {};
    const bySkill = {};
    const incorrectQuestions = [];

    for (const set of data.stimulusSets) {
      const period = set.period;
      if (!byPeriod[period]) byPeriod[period] = { correct: 0, total: 0 };
      
      for (const q of set.questions) {
        const skill = q.skill;
        if (!bySkill[skill]) bySkill[skill] = { correct: 0, total: 0 };
        
        bySkill[skill].total++;
        byPeriod[period].total++;
        
        const userAnswer = data.answers[q.question];
        const isCorrect = userAnswer === q.correctAnswer;
        
        if (isCorrect) {
          bySkill[skill].correct++;
          byPeriod[period].correct++;
        } else {
          incorrectQuestions.push({
            question: q.question,
            userAnswer,
            correctAnswer: q.correctAnswer,
            choices: q.choices,
            explanation: q.explanation,
            period,
            skill,
            topics: set.topics
          });
        }
      }
    }

    setStats({ byPeriod, bySkill, incorrectQuestions });
  };

  const getTotalScore = () => {
    if (!results) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    let total = 0;
    
    for (const set of results.stimulusSets) {
      for (const q of set.questions) {
        total++;
        if (results.answers[q.question] === q.correctAnswer) {
          correct++;
        }
      }
    }
    
    return { 
      correct, 
      total, 
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0 
    };
  };

  const score = getTotalScore();

  if (!results) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apush-blue mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-apush-blue mb-2">Quiz Complete!</h1>
        <p className="text-xl text-gray-600">{results.chapterTitle}</p>
      </div>

      {/* Main Score */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="text-center">
          <div className={`text-6xl font-bold mb-4 ${
            score.percentage >= 80 ? 'text-green-600' :
            score.percentage >= 60 ? 'text-apush-gold' :
            'text-red-600'
          }`}>
            {score.percentage}%
          </div>
          <p className="text-2xl text-gray-700 mb-2">
            {score.correct} out of {score.total} correct
          </p>
          <p className="text-gray-600">
            {score.percentage >= 80 ? 'Excellent work!' :
             score.percentage >= 60 ? 'Good job! Keep practicing.' :
             'Keep studying and try again.'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* By Period */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-apush-blue mb-4">Score by Period</h2>
          <div className="space-y-3">
            {Object.entries(stats.byPeriod).map(([period, data]) => (
              <div key={period} className="flex items-center justify-between">
                <span className="font-medium">Period {period}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (data.correct / data.total) >= 0.8 ? 'bg-green-500' :
                        (data.correct / data.total) >= 0.6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(data.correct / data.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {data.correct}/{data.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Skill */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-apush-blue mb-4">Score by Skill</h2>
          <div className="space-y-3">
            {Object.entries(stats.bySkill).map(([skill, data]) => (
              <div key={skill} className="flex items-center justify-between">
                <span className="font-medium">{skill}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (data.correct / data.total) >= 0.8 ? 'bg-green-500' :
                        (data.correct / data.total) >= 0.6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(data.correct / data.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {data.correct}/{data.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incorrect Questions */}
      {stats.incorrectQuestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-apush-blue">
              Review Incorrect Answers ({stats.incorrectQuestions.length})
            </h2>
            <Link to="/review" className="btn-secondary text-sm">
              Review Mode →
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.incorrectQuestions.slice(0, 3).map((q, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="tag tag-period">Period {q.period}</span>
                  <span className="tag tag-skill">{q.skill}</span>
                  {q.topics.map(t => (
                    <span key={t} className="tag tag-topic">{t}</span>
                  ))}
                </div>
                <p className="font-medium mb-2">{q.question}</p>
                <div className="text-sm">
                  <p className="text-red-600">Your answer: {q.userAnswer}. {q.choices[q.userAnswer]}</p>
                  <p className="text-green-600">Correct: {q.correctAnswer}. {q.choices[q.correctAnswer]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/" className="btn-primary">
          ← Back to Home
        </Link>
        <Link to="/review" className="btn-secondary">
          📝 Review Incorrect Answers
        </Link>
        {results.chapterTitle && (
          <button 
            onClick={() => {
              sessionStorage.removeItem('quizResults');
              navigate('/');
            }}
            className="btn-secondary"
          >
            Start New Quiz
          </button>
        )}
      </div>
    </div>
  );
}

export default Results;