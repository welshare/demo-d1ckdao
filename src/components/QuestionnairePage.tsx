import { useState } from 'react';
import { useQuestionnaire } from '../contexts/QuestionnaireContext';
import type { QuestionnaireItem } from '../types/fhir';
import { QuestionRenderer } from './QuestionRenderer';
import './QuestionnairePage.css';

export const QuestionnairePage = () => {
  const { questionnaire, response, isLoading, error } = useQuestionnaire();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  if (isLoading) {
    return <div className="loading">Loading questionnaire...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!questionnaire || !questionnaire.item) {
    return <div className="error">No questionnaire data available</div>;
  }

  // Each top-level group item is a page
  const pages = questionnaire.item.filter(item => item.type === 'group');
  const currentPage = pages[currentPageIndex];

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    console.log('Questionnaire Response:', JSON.stringify(response, null, 2));
    alert('Questionnaire submitted! Check console for response data.');
  };

  const renderQuestions = (items: QuestionnaireItem[]) => {
    return items.map((item) => {
      if (item.type === 'group') {
        // Nested groups (shouldn't happen at this level based on the structure)
        return (
          <div key={item.linkId} className="question-group">
            <h3>{item.text}</h3>
            {item.item && renderQuestions(item.item)}
          </div>
        );
      }
      return <QuestionRenderer key={item.linkId} item={item} />;
    });
  };

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-header">
        <h1>{questionnaire.title}</h1>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentPageIndex + 1) / pages.length) * 100}%` }}
          />
        </div>
        <div className="page-indicator">
          Page {currentPageIndex + 1} of {pages.length}
        </div>
      </div>

      <div className="page-content">
        <h2 className="page-title">{currentPage.text}</h2>
        {currentPage.item && renderQuestions(currentPage.item)}
      </div>

      <div className="navigation-buttons">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentPageIndex === 0}
        >
          Previous
        </button>

        {currentPageIndex < pages.length - 1 ? (
          <button className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        ) : (
          <button className="btn btn-success" onClick={handleSubmit}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
};
