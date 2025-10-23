
import { QuestionnairePage } from './components/QuestionnairePage';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext';

import './App.css';

function App() {
  return (
    <QuestionnaireProvider>
      <QuestionnairePage />
    </QuestionnaireProvider>
  )
}

export default App
