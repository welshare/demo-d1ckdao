import { Schemas, useWelshare, WelshareLogo } from "@welshare/react";
import { useEffect, useRef, useState } from "react";
import { useQuestionnaire } from "../contexts/QuestionnaireContext";
import type { QuestionnaireItem } from "../types/fhir";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { QuestionRenderer } from "./QuestionRenderer";
import "./QuestionnairePage.css";

export const QuestionnairePage = () => {
  const {
    questionnaire,
    response,
    isLoading,
    error,
    isPageValid,
    markValidationErrors,
    clearValidationErrors,
  } = useQuestionnaire();
  const { isConnected, openWallet, submitData, isSubmitting } = useWelshare({
    applicationId: import.meta.env.VITE_APP_ID,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    environment: import.meta.env.VITE_ENVIRONMENT,
    interpolateSocials: {
      emailAddress: "email-address",
      twitter: "twitter-handle",
    },
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
      <>
        <Header />
        <div className="questionnaire-page">
          <h1 className="accent-color">
            🎉<span style={{ marginRight: "10px" }}> </span> Thank You!
          </h1>

          <div className="page-content">
            <h2>Thank you for your submission.</h2>{" "}
            <p>
              {" "}
              Your responses have been securely stored on your{" "}
              <a
                href={`${import.meta.env.VITE_API_BASE_URL}/profile#questionnaires`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Welshare Health Profile
              </a>
              .
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Each top-level group item is a page
  const pages = questionnaire.item.filter((item) => item.type === "group");
  const currentPage = pages[currentPageIndex];

  // Check if current page is valid (all required questions answered)
  const isCurrentPageValid = currentPage?.item
    ? isPageValid(currentPage.item)
    : true;

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1) {
      if (isCurrentPageValid) {
        clearValidationErrors();
        setCurrentPageIndex(currentPageIndex + 1);
        window.scrollTo(0, 0);
      } else {
        // Mark validation errors for unanswered required questions
        markValidationErrors(currentPage.item || []);
      }
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

      submitData(Schemas.QuestionnaireResponse, questionnaireResponse);
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
    <>
      <header className="app-header">
        <div className="app-logo">
          <img src="/lime-green-text-logo.png" alt="DickXBT Logo" width={180} />
        </div>
      </header>
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
            <button
              className={`btn btn-primary ${
                !isCurrentPageValid ? "btn-disabled" : ""
              }`}
              onClick={handleNext}
            >
              Next
            </button>
          ) : !isConnected ? (
            <button
              className={`btn btn-success ${
                !isCurrentPageValid ? "btn-disabled" : ""
              }`}
              onClick={
                !isCurrentPageValid
                  ? () => markValidationErrors(currentPage.item || [])
                  : openWallet
              }
            >
              <WelshareLogo /> Connect Your Health Profile
            </button>
          ) : (
            <button
              className={`btn btn-success ${
                !isCurrentPageValid ? "btn-disabled" : ""
              }`}
              onClick={
                !isCurrentPageValid
                  ? () => markValidationErrors(currentPage.item || [])
                  : handleSubmit
              }
            >
              <WelshareLogo />
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};
