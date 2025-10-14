import React from 'react';
import Notes from "./components/Notes";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Switch>
          <Route path="/" exact component={HomePage} />
          {/* Additional routes can be added here */}
        </Switch>
      </div>
    </Router>
  );
}

const App = () => {
  return (
    <div>
      <h1>Study Manager</h1>
      <Notes />
    </div>
  );
};

export default App;