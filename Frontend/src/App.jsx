import './App.css'
import Navbar from './components/Navbar.jsx'
import QBEditor from './components/QBeditor.jsx'
import QuestionBank from './components/QuestionBank.jsx'
function App() {

  return (
    <>
      <Navbar/>
      <div className="App-container">
        <QBEditor/>
        <QuestionBank/>
      </div>
    </>
  )
}

export default App
