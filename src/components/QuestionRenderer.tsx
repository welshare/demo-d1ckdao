import type { QuestionnaireItem } from '../types/fhir';
import { useQuestionnaire } from '../contexts/QuestionnaireContext';
import './QuestionRenderer.css';

interface QuestionRendererProps {
  item: QuestionnaireItem;
}

export const QuestionRenderer = ({ item }: QuestionRendererProps) => {
  const { updateAnswer, getAnswer } = useQuestionnaire();
  const currentAnswer = getAnswer(item.linkId);

  const handleChoiceChange = (valueCoding: any, valueInteger?: number) => {
    updateAnswer(item.linkId, { valueCoding, valueInteger });
  };

  const handleIntegerChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      updateAnswer(item.linkId, { valueInteger: numValue });
    }
  };

  const handleDecimalChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateAnswer(item.linkId, { valueDecimal: numValue });
    }
  };

  const handleStringChange = (value: string) => {
    updateAnswer(item.linkId, { valueString: value });
  };

  const handleBooleanChange = (value: boolean) => {
    updateAnswer(item.linkId, { valueBoolean: value });
  };

  const renderQuestion = () => {
    switch (item.type) {
      case 'choice':
        return (
          <div className="question-choice">
            {item.answerOption?.map((option, index) => {
              const isSelected = currentAnswer?.valueCoding?.code === option.valueCoding?.code;
              return (
                <label key={index} className={`choice-option ${isSelected ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={item.linkId}
                    value={option.valueCoding?.code}
                    checked={isSelected}
                    onChange={() => handleChoiceChange(option.valueCoding, option.valueInteger)}
                  />
                  <span className="choice-label">{option.valueCoding?.display}</span>
                </label>
              );
            })}
          </div>
        );

      case 'integer':
        return (
          <input
            type="number"
            className="question-input"
            value={currentAnswer?.valueInteger ?? ''}
            onChange={(e) => handleIntegerChange(e.target.value)}
            placeholder="Enter a number"
            step="1"
          />
        );

      case 'decimal':
        return (
          <input
            type="number"
            className="question-input"
            value={currentAnswer?.valueDecimal ?? ''}
            onChange={(e) => handleDecimalChange(e.target.value)}
            placeholder="Enter a number"
            step="0.1"
          />
        );

      case 'string':
      case 'text':
        return (
          <input
            type="text"
            className="question-input"
            value={currentAnswer?.valueString ?? ''}
            onChange={(e) => handleStringChange(e.target.value)}
            placeholder="Enter your answer"
          />
        );

      case 'boolean':
        return (
          <div className="question-choice">
            <label className={`choice-option ${currentAnswer?.valueBoolean === true ? 'selected' : ''}`}>
              <input
                type="radio"
                name={item.linkId}
                checked={currentAnswer?.valueBoolean === true}
                onChange={() => handleBooleanChange(true)}
              />
              <span className="choice-label">Yes</span>
            </label>
            <label className={`choice-option ${currentAnswer?.valueBoolean === false ? 'selected' : ''}`}>
              <input
                type="radio"
                name={item.linkId}
                checked={currentAnswer?.valueBoolean === false}
                onChange={() => handleBooleanChange(false)}
              />
              <span className="choice-label">No</span>
            </label>
          </div>
        );

      default:
        return <div className="unsupported-type">Unsupported question type: {item.type}</div>;
    }
  };

  return (
    <div className="question-container">
      <div className="question-text">
        {item.text}
        {item.required && <span className="required-indicator">*</span>}
      </div>
      {renderQuestion()}
    </div>
  );
};
