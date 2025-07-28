import { useState } from 'react';
import './App.css';
import { Quiz } from './components/Quiz';

function App() {
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const handleScoreUpdate = (_newScore: number) => {
    // スコア更新処理（必要に応じて後で実装）
  };

  const handleQuestionComplete = (isCorrect: boolean) => {
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
    } else {
      setStreak(0);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>世界地図クイズ</h1>
        <div className="stats">
          <span>連続正解: {streak}</span>
          <span>最高記録: {bestStreak}</span>
        </div>
      </header>
      <main className="app-main">
        <Quiz 
          onScoreUpdate={handleScoreUpdate}
          onQuestionComplete={handleQuestionComplete}
        />
      </main>
    </div>
  );
}

export default App;
