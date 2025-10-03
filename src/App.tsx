import { QuestionnaireProvider } from './contexts/QuestionnaireContext'
import { QuestionnairePage } from './components/QuestionnairePage'
import './App.css'

function App() {
  return (
    <QuestionnaireProvider>
      <QuestionnairePage />
    </QuestionnaireProvider>
  )
}

export default App
