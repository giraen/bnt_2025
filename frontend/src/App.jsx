import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationPage from './pages/RegistrationPage.jsx';
import AltRegistrationPage from './pages/AltRegistrationPage.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/registration' element={<RegistrationPage/>}/>
        <Route path='/altregistration' element={<AltRegistrationPage/>}/>
      </Routes>
    </Router>
  )
}

export default App
