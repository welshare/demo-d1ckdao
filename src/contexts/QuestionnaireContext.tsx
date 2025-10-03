import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem, QuestionnaireResponseAnswer } from '../types/fhir';

interface QuestionnaireContextType {
  questionnaire: Questionnaire | null;
  response: QuestionnaireResponse;
  updateAnswer: (linkId: string, answer: QuestionnaireResponseAnswer) => void;
  getAnswer: (linkId: string) => QuestionnaireResponseAnswer | undefined;
  isLoading: boolean;
  error: string | null;
}

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error('useQuestionnaire must be used within QuestionnaireProvider');
  }
  return context;
};

interface QuestionnaireProviderProps {
  children: ReactNode;
}

export const QuestionnaireProvider = ({ children }: QuestionnaireProviderProps) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [response, setResponse] = useState<QuestionnaireResponse>({
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestionnaire = async () => {
      try {
        const res = await fetch('/questionnaire.json');
        if (!res.ok) throw new Error('Failed to load questionnaire');
        const data = await res.json();
        setQuestionnaire(data);

        // Initialize response structure
        setResponse({
          resourceType: 'QuestionnaireResponse',
          questionnaire: data.id,
          status: 'in-progress',
          authored: new Date().toISOString(),
          item: [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestionnaire();
  }, []);

  const updateAnswer = (linkId: string, answer: QuestionnaireResponseAnswer) => {
    setResponse((prev) => {
      const newResponse = { ...prev };

      // Find or create the response item
      const findOrCreateItem = (items: QuestionnaireResponseItem[] = []): QuestionnaireResponseItem[] => {
        const existingIndex = items.findIndex(item => item.linkId === linkId);

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
  };

  const getAnswer = (linkId: string): QuestionnaireResponseAnswer | undefined => {
    const item = response.item?.find(i => i.linkId === linkId);
    return item?.answer?.[0];
  };

  return (
    <QuestionnaireContext.Provider
      value={{
        questionnaire,
        response,
        updateAnswer,
        getAnswer,
        isLoading,
        error,
      }}
    >
      {children}
    </QuestionnaireContext.Provider>
  );
};
