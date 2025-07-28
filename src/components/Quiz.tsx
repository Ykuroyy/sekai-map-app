import { useState, useEffect } from 'react';
import { RealWorldMap } from './RealWorldMap';
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

  const generateNewQuestion = () => {
    const randomIndex = Math.floor(Math.random() * countries.length);
    const country = countries[randomIndex];
    
    const wrongOptions = getRandomCountries(3, country.id);
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

  if (!currentCountry) {
    return <div>Loading...</div>;
  }

  return (
    <div className="quiz-container">
      <div className="score-display">
        <span>スコア: {score} / {questionCount}</span>
      </div>
      
      <div className="question-section">
        <h2 className="question-text">青い国はどこ？地図上でクリックしてください</h2>
        <RealWorldMap
          highlightedCountry={currentCountry.id}
          selectedCountry={selectedOption || undefined}
          isCorrect={isAnswered ? selectedOption === currentCountry.id : undefined}
          onCountryClick={handleOptionClick}
          options={options.map(option => option.id)}
        />
      </div>
      
      <div className="options-list">
        <h3>選択肢:</h3>
        <div className="options-text">
          {options.map((option, index) => (
            <span key={option.id} className="option-text">
              {String.fromCharCode(65 + index)}. {option.nameJa}
              {index < options.length - 1 && '　'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};