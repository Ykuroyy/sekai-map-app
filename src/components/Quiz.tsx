import { useState, useEffect } from 'react';
import { Globe3D } from './Globe3D';
import { countries, getRandomCountries, type Country } from '../data/countries';

interface QuizProps {
  onScoreUpdate: (score: number) => void;
  onQuestionComplete: (isCorrect: boolean) => void;
}

export const Quiz = ({ onScoreUpdate, onQuestionComplete }: QuizProps) => {
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [options, setOptions] = useState<Country[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);

  const generateNewQuestion = () => {
    const randomIndex = Math.floor(Math.random() * countries.length);
    const country = countries[randomIndex];
    
    const wrongOptions = getRandomCountries(3, country.id);
    const allOptions = [country, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    setCurrentCountry(country);
    setOptions(allOptions);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsGlobeReady(false);
    setShowQuestion(false);
  };

  useEffect(() => {
    generateNewQuestion();
  }, []);

  const handleAnswerClick = (countryId: string) => {
    if (isAnswered) return;
    
    setSelectedOption(countryId);
    setIsAnswered(true);
    
    const isCorrect = countryId === currentCountry?.id;
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      onScoreUpdate(newScore);
    }
    
    setQuestionCount(questionCount + 1);
    onQuestionComplete(isCorrect);
    
    setTimeout(() => {
      generateNewQuestion();
    }, 3000);
  };

  if (!currentCountry) {
    return <div>Loading...</div>;
  }

  return (
    <div className="quiz-container">
      <div className="score-display">
        <span>スコア: {score} / {questionCount}</span>
      </div>
      
      <div className="question-section">
        {!isGlobeReady && !showQuestion && (
          <h2 className="question-text">地球儀が回転中...</h2>
        )}
        {isGlobeReady && showQuestion && (
          <h2 className="question-text">正面に来た国はどこでしょう？</h2>
        )}
        
        <Globe3D
          targetCountry={showQuestion ? currentCountry.id : undefined}
          selectedCountry={selectedOption || undefined}
          isCorrect={isAnswered ? selectedOption === currentCountry.id : undefined}
          onGlobeReady={() => {
            setIsGlobeReady(true);
            setTimeout(() => {
              setShowQuestion(true);
            }, 1000);
          }}
        />
      </div>
      
      {showQuestion && (
        <div className="answer-buttons">
          {options.map((option, index) => (
            <button
              key={option.id}
              className={`answer-button ${
                isAnswered && option.id === selectedOption
                  ? selectedOption === currentCountry.id
                    ? 'correct'
                    : 'incorrect'
                  : ''
              } ${
                isAnswered && option.id === currentCountry.id && option.id !== selectedOption
                  ? 'correct-answer'
                  : ''
              }`}
              onClick={() => handleAnswerClick(option.id)}
              disabled={isAnswered}
            >
              {String.fromCharCode(65 + index)}. {option.nameJa}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};