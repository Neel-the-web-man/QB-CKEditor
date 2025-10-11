import './App.css'
import Navbar from './components/Navbar.jsx'
import QBEditor from './components/QBeditor.jsx'

function App() {

  return (
    <>
      <Navbar/>
      <div className="App-container">
        <QBEditor/>
        
      </div>
    </>
  )
}

export default App
