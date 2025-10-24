import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseAnswer,
  QuestionnaireResponseItem,
} from "../types/fhir";

interface QuestionnaireContextType {
  questionnaire: Questionnaire | null;
  response: QuestionnaireResponse;
  updateAnswer: (linkId: string, answer: QuestionnaireResponseAnswer) => void;
  getAnswer: (linkId: string) => QuestionnaireResponseAnswer | undefined;
  isPageValid: (pageItems: QuestionnaireItem[]) => boolean;
  getRequiredQuestions: (pageItems: QuestionnaireItem[]) => QuestionnaireItem[];
  getUnansweredRequiredQuestions: (
    pageItems: QuestionnaireItem[]
  ) => QuestionnaireItem[];
  markValidationErrors: (pageItems: QuestionnaireItem[]) => void;
  clearValidationErrors: () => void;
  hasValidationError: (linkId: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

const QuestionnaireContext = createContext<
  QuestionnaireContextType | undefined
>(undefined);

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error(
      "useQuestionnaire must be used within QuestionnaireProvider"
    );
  }
  return context;
};

interface QuestionnaireProviderProps {
  children: ReactNode;
}

export const QuestionnaireProvider = ({
  children,
}: QuestionnaireProviderProps) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const [response, setResponse] = useState<QuestionnaireResponse>({
    resourceType: "QuestionnaireResponse",
    status: "in-progress",
    item: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const loadQuestionnaire = async () => {
      try {
        //const res = await fetch('/questionnaire.json');
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/questionnaire/${
            import.meta.env.VITE_QUESTIONNAIRE_ID
          }`
        );
        if (!res.ok) throw new Error("Failed to load questionnaire");
        const data = await res.json();
        setQuestionnaire(data);

        // Initialize response structure
        setResponse({
          resourceType: "QuestionnaireResponse",
          questionnaire: data.id,
          status: "in-progress",
          authored: new Date().toISOString(),
          item: [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestionnaire();
  }, []);

  const updateAnswer = (
    linkId: string,
    answer: QuestionnaireResponseAnswer
  ) => {
    setResponse((prev) => {
      const newResponse = { ...prev };

      // Find or create the response item
      const findOrCreateItem = (
        items: QuestionnaireResponseItem[] = []
      ): QuestionnaireResponseItem[] => {
        const existingIndex = items.findIndex((item) => item.linkId === linkId);

        if (existingIndex >= 0) {
          // Update existing item
          const updated = [...items];
          updated[existingIndex] = {
            ...updated[existingIndex],
            answer: [answer],
          };
          return updated;
        } else {
          // Create new item
          return [
            ...items,
            {
              linkId,
              answer: [answer],
            },
          ];
        }
      };

      newResponse.item = findOrCreateItem(newResponse.item);
      return newResponse;
    });

    // Clear validation error for this question when answered
    setValidationErrors((prev) => {
      const newErrors = new Set(prev);
      newErrors.delete(linkId);
      return newErrors;
    });
  };

  const getAnswer = (
    linkId: string
  ): QuestionnaireResponseAnswer | undefined => {
    const item = response.item?.find((i) => i.linkId === linkId);
    return item?.answer?.[0];
  };

  const getRequiredQuestions = (
    pageItems: QuestionnaireItem[]
  ): QuestionnaireItem[] => {
    return pageItems.filter((item) => item.required === true);
  };

  const isPageValid = (pageItems: QuestionnaireItem[]): boolean => {
    const requiredQuestions = getRequiredQuestions(pageItems);

    return requiredQuestions.every((question) => {
      const answer = getAnswer(question.linkId);
      if (!answer) return false;

      // Check if the answer has any meaningful value
      return (
        answer.valueBoolean !== undefined ||
        answer.valueInteger !== undefined ||
        answer.valueDecimal !== undefined ||
        answer.valueString !== undefined ||
        answer.valueCoding !== undefined ||
        answer.valueDate !== undefined ||
        answer.valueDateTime !== undefined ||
        answer.valueTime !== undefined
      );
    });
  };

  const getUnansweredRequiredQuestions = (
    pageItems: QuestionnaireItem[]
  ): QuestionnaireItem[] => {
    const requiredQuestions = getRequiredQuestions(pageItems);

    return requiredQuestions.filter((question) => {
      const answer = getAnswer(question.linkId);
      if (!answer) return true;

      // Check if the answer has any meaningful value
      return (
        answer.valueBoolean === undefined &&
        answer.valueInteger === undefined &&
        answer.valueDecimal === undefined &&
        answer.valueString === undefined &&
        answer.valueCoding === undefined &&
        answer.valueDate === undefined &&
        answer.valueDateTime === undefined &&
        answer.valueTime === undefined
      );
    });
  };

  const markValidationErrors = (pageItems: QuestionnaireItem[]) => {
    const unansweredRequired = getUnansweredRequiredQuestions(pageItems);
    const errorLinkIds = unansweredRequired.map((q) => q.linkId);
    setValidationErrors(new Set(errorLinkIds));
  };

  const clearValidationErrors = () => {
    setValidationErrors(new Set());
  };

  const hasValidationError = (linkId: string): boolean => {
    return validationErrors.has(linkId);
  };

  return (
    <QuestionnaireContext.Provider
      value={{
        questionnaire,
        response,
        updateAnswer,
        getAnswer,
        isPageValid,
        getRequiredQuestions,
        getUnansweredRequiredQuestions,
        markValidationErrors,
        clearValidationErrors,
        hasValidationError,
        isLoading,
        error,
      }}
    >
      {children}
    </QuestionnaireContext.Provider>
  );
};
