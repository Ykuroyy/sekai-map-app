import { useState, useEffect } from 'react';
import { CountryShape } from './CountryShape';
import { countries, getRandomCountries, type Country } from '../data/countries';
import { getCountryShape } from '../data/countryShapes';

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

  const generateNewQuestion = () => {
    const countriesWithShapes = countries.filter(c => getCountryShape(c.id));
    const randomIndex = Math.floor(Math.random() * countriesWithShapes.length);
    const country = countriesWithShapes[randomIndex];
    
    const wrongOptions = getRandomCountries(3, country.id).filter(c => 
      getCountryShape(c.id)
    );
    const allOptions = [country, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    setCurrentCountry(country);
    setOptions(allOptions);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  useEffect(() => {
    generateNewQuestion();
  }, []);

  const handleOptionClick = (countryId: string) => {
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
    }, 2000);
  };

  const currentShape = currentCountry ? getCountryShape(currentCountry.id) : null;

  if (!currentCountry || !currentShape) {
    return <div>Loading...</div>;
  }

  return (
    <div className="quiz-container">
      <div className="score-display">
        <span>スコア: {score} / {questionCount}</span>
      </div>
      
      <div className="question-section">
        <h2 className="question-text">この国はどこ？</h2>
        <CountryShape 
          shape={currentShape}
          isCorrect={isAnswered && selectedOption === currentCountry.id}
          isSelected={isAnswered && selectedOption !== currentCountry.id}
          onClick={undefined}
        />
      </div>
      
      <div className="options-section">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            disabled={isAnswered}
            className={`option-button ${
              isAnswered && option.id === currentCountry.id
                ? 'correct'
                : isAnswered && option.id === selectedOption
                ? 'incorrect'
                : ''
            }`}
          >
            {option.nameJa}
          </button>
        ))}
      </div>
    </div>
  );
};