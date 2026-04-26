import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import QuickQuiz from './pages/QuickQuiz';
import Results from './pages/Results';
import Review from './pages/Review';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-stone-50">
        <header className="bg-apush-blue text-white py-4 shadow-lg">
          <div className="container mx-auto px-4">
            <a href="/" className="text-2xl font-bold flex items-center gap-2">
              <span className="text-apush-gold">⚖</span> 
              APUSH MCQ Practice
            </a>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/:chapterId" element={<Quiz />} />
            <Route path="/quiz/quick" element={<QuickQuiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/review" element={<Review />} />
          </Routes>
        </main>
        
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">
              APUSH MCQ Practice — Preparing students for the AP US History Exam
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Periods 1-9 | Causation • Continuity and Change Over Time • Comparison
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;