import './App.css';
import WikiCrawl from './components/WikiCrawl';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <h1>Wikipedia crawler</h1>
      <hr/>
      </header>
      <WikiCrawl/>
      <hr/>
      <Footer/>
    </div>
  );
}

export default App;
