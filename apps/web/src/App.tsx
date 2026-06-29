import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { Identify } from './pages/Identify';
import { About } from './pages/About';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/identify" element={<Identify />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
