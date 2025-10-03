import { useState, useEffect, useRef } from "react";
import { useWelshare, WelshareLogo } from "@welshare/react";
import { Schemas } from "@welshare/react";
import { useQuestionnaire } from "../contexts/QuestionnaireContext";
import type { QuestionnaireItem } from "../types/fhir";
import { QuestionRenderer } from "./QuestionRenderer";
import "./QuestionnairePage.css";

export const QuestionnairePage = () => {
  const { questionnaire, response, isLoading, error } = useQuestionnaire();
  const { isConnected, openWallet, submitData, isSubmitting } = useWelshare({
    applicationId: import.meta.env.VITE_APP_ID,
    apiBaseUrl: "https://staging.wallet.welshare.app",
    environment: import.meta.env.VITE_ENVIRONMENT,
  });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const wasSubmitting = useRef(false);

  useEffect(() => {
    if (wasSubmitting.current && !isSubmitting) {
      setSubmitted(true);
    }
    wasSubmitting.current = isSubmitting;
  }, [isSubmitting]);

  if (isLoading) {
    return <div className="loading">Loading questionnaire...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!questionnaire || !questionnaire.item) {
    return <div className="error">No questionnaire data available</div>;
  }

  if (submitted) {
    return (
      <div className="questionnaire-page">
        <div className="questionnaire-header">
          <h1>Thank You!</h1>
        </div>
        <div className="page-content">
          <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>
            Thank you for your submission. Your responses have been securely stored on Welshare.
          </p>
        </div>
      </div>
    );
  }

  // Each top-level group item is a page
  const pages = questionnaire.item.filter((item) => item.type === "group");
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

  const handleSubmit = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      
      // Add questionnaire ID to the response
      const questionnaireResponse = {
        ...response,
        questionnaire: import.meta.env.VITE_QUESTIONNAIRE_ID,
      };

      console.log(
        "Submitting Questionnaire Response:",
        JSON.stringify(questionnaireResponse, null, 2)
      );

      submitData(
        Schemas.QuestionnaireResponse,
        questionnaireResponse
      );
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit questionnaire. Please try again.");
    }
  };

  const renderQuestions = (items: QuestionnaireItem[]) => {
    return items.map((item) => {
      if (item.type === "group") {
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
            style={{
              width: `${((currentPageIndex + 1) / pages.length) * 100}%`,
            }}
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
        ) : !isConnected ? (
          <button className="btn btn-success" onClick={openWallet}>
            <WelshareLogo /> Connect Wallet to Submit
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <WelshareLogo />
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
};
