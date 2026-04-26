import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [chapters, setChapters] = useState([]);
  const [filters, setFilters] = useState({ periods: [], skills: [], topics: [] });
  const [stats, setStats] = useState(null);
  const [selectedMode, setSelectedMode] = useState('full'); // 'full', 'high-frequency', or 'quick'
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [strictEqual, setStrictEqual] = useState(false);
  const [quizCount, setQuizCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChapters();
    fetchFilters();
    fetchStats();
  }, []);

  const fetchChapters = async () => {
    try {
      const url = selectedMode === 'high-frequency' 
        ? '/api/high-frequency' 
        : '/api/chapters';
      const res = await fetch(url);
      const data = await res.json();
      setChapters(data);
    } catch (err) {
      console.error('Error fetching chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const res = await fetch('/api/filters');
      const data = await res.json();
      setFilters(data);
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/period-stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    setLoading(true);
    fetchChapters();
  };

  const handleStartQuickQuiz = async () => {
    try {
      const res = await fetch(
        `/api/weighted-quiz?count=${quizCount}&highFrequency=${selectedMode === 'high-frequency'}&strictEqual=${strictEqual}`
      );
      const data = await res.json();
      
      // Store quiz data in sessionStorage
      sessionStorage.setItem('quickQuizData', JSON.stringify({
        questions: data.questions,
        mode: selectedMode,
        useWeightedDistribution: data.useWeightedDistribution,
        totalQuestions: data.totalQuestions
      }));
      
      navigate('/quiz/quick');
    } catch (err) {
      console.error('Error starting quick quiz:', err);
    }
  };

  const getPeriodName = (period) => {
    const periodNames = {
      1: 'Period 1: 1491-1607',
      2: 'Period 2: 1607-1754',
      3: 'Period 3: 1754-1800',
      4: 'Period 4: 1800-1848',
      5: 'Period 5: 1844-1877',
      6: 'Period 6: 1865-1898',
      7: 'Period 7: 1898-1945',
      8: 'Period 8: 1945-1980',
      9: 'Period 9: 1980-Present'
    };
    return periodNames[period] || `Period ${period}`;
  };

  const filteredChapters = chapters.filter(ch => {
    if (selectedPeriod !== 'all' && ch.period !== parseInt(selectedPeriod)) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-apush-blue mb-4">
          APUSH MCQ Practice
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Master AP US History with stimulus-based multiple choice questions.
          Practice with authentic AP-style questions covering all nine periods.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-apush-blue mb-6">Choose Your Practice Mode</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Full Chapter Mode */}
          <button
            onClick={() => handleModeChange('full')}
            className={`p-6 rounded-lg border-2 transition-all ${
              selectedMode === 'full' 
                ? 'border-apush-blue bg-blue-50' 
                : 'border-gray-200 hover:border-apush-blue'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📚</span>
              <h3 className="text-xl font-bold text-apush-blue">Full Chapter Mode</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Practice with questions from all 9 APUSH periods by chapter.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="tag tag-period">All Periods 1-9</span>
            </div>
          </button>

          {/* High-Frequency Mode */}
          <button
            onClick={() => handleModeChange('high-frequency')}
            className={`p-6 rounded-lg border-2 transition-all ${
              selectedMode === 'high-frequency' 
                ? 'border-apush-blue bg-blue-50' 
                : 'border-gray-200 hover:border-apush-blue'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🎯</span>
              <h3 className="text-xl font-bold text-apush-blue">High-Frequency Mode</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Prioritize Periods 3-8 (~80% of exam), with optional 1-2 and 9 at lower rate.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="tag tag-period">Periods 3-8 Priority</span>
              <span className="tag tag-skill">Heavily Tested</span>
            </div>
          </button>

          {/* Quick Quiz Mode */}
          <button
            onClick={() => handleModeChange('quick')}
            className={`p-6 rounded-lg border-2 transition-all ${
              selectedMode === 'quick' 
                ? 'border-apush-blue bg-blue-50' 
                : 'border-gray-200 hover:border-apush-blue'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">⚡</span>
              <h3 className="text-xl font-bold text-apush-blue">Quick Quiz</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Mixed questions with weighted distribution based on AP exam frequency.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="tag tag-period">All 9 Periods</span>
              <span className="tag tag-skill">Weighted</span>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Quiz Options */}
      {selectedMode === 'quick' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-apush-blue mb-4">Quick Quiz Settings</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
              <select
                value={quizCount}
                onChange={(e) => setQuizCount(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-apush-blue focus:border-transparent"
              >
                <option value={10}>10 Questions</option>
                <option value={20}>20 Questions</option>
                <option value={30}>30 Questions</option>
                <option value={50}>50 Questions</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distribution Mode</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="strictEqual"
                  checked={strictEqual}
                  onChange={(e) => setStrictEqual(e.target.checked)}
                  className="w-5 h-5 text-apush-blue rounded focus:ring-apush-blue"
                />
                <label htmlFor="strictEqual" className="text-sm text-gray-700">
                  <span className="font-medium">Strict Equal Coverage</span>
                  <span className="text-gray-500 ml-1">(all periods appear evenly)</span>
                </label>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleStartQuickQuiz}
                className="btn-primary w-full"
              >
                Start Quick Quiz →
              </button>
            </div>
          </div>
          
          {/* Weighting Note */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <span className="font-bold">📊 Questions are weighted based on AP exam frequency:</span>
              {' '}Periods 3-8 (~70-80%), Periods 1-2 and 9 (~20-30% combined).
              {strictEqual && ' Strict Equal Coverage enabled - all periods appear evenly.'}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-apush-blue mb-4">Filter Chapters</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-apush-blue focus:border-transparent"
            >
              <option value="all">All Periods</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(p => (
                <option key={p} value={p}>{getPeriodName(p)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-apush-blue mb-6">
          {selectedMode === 'high-frequency' ? 'High-Frequency Chapters' : 
           selectedMode === 'quick' ? 'Available for Practice' : 'Available Chapters'}
        </h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apush-blue mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading chapters...</p>
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-600">No chapters found with current filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChapters.map(chapter => (
              <Link
                key={chapter.id}
                to={`/quiz/${chapter.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 block"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="tag tag-period">Period {chapter.period}</span>
                  {selectedMode === 'high-frequency' && (
                    <span className="tag tag-skill">HF</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-apush-blue mb-2">{chapter.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{chapter.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{chapter.stimulusSetsCount} stimulus sets</span>
                  <span>{chapter.totalQuestions} questions</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats & Weighting Info */}
      {stats && (
        <div className="bg-apush-blue text-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">AP Exam Weighting & Question Distribution</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-apush-gold">{stats.totalQuestions}</div>
              <p className="text-lg mt-2">Total Questions</p>
              <p className="text-sm text-gray-300">In question bank</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-apush-gold">9</div>
              <p className="text-lg mt-2">APUSH Periods</p>
              <p className="text-sm text-gray-300">1491 - Present</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-apush-gold">3</div>
              <p className="text-lg mt-2">Historical Skills</p>
              <p className="text-sm text-gray-300">Causation, CCOT, Comparison</p>
            </div>
          </div>

          {/* Period Distribution */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-bold mb-3">Question Distribution by Period</h3>
            <div className="grid grid-cols-9 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(p => {
                const weight = selectedMode === 'high-frequency' 
                  ? stats.highFrequencyWeights[p] 
                  : stats.periodWeights[p];
                return (
                  <div key={p} className="text-center">
                    <div 
                      className="h-16 rounded flex items-end justify-center pb-1"
                      style={{ 
                        backgroundColor: p >= 3 && p <= 8 ? '#c9a227' : 'rgba(255,255,255,0.3)',
                        height: `${(weight || 0) * 100}%`
                      }}
                    >
                      <span className="text-xs font-bold">{Math.round((weight || 0) * 100)}%</span>
                    </div>
                    <div className="text-xs mt-1">P{p}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-apush-gold rounded"></span>
                Periods 3-8 (~70-80%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-white/30 rounded"></span>
                Periods 1-2, 9 (~20-30%)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;