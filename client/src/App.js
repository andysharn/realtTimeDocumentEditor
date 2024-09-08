import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import DocumentList from './components/DocumentList';
import DocumentEdit from './components/DocumentEdit';
// import Navbar from './components/Navbar';

function PrivateRoute({ children, isAuthenticated, ...rest }) {
    return (
      <Route
        {...rest}
        render={({ location }) =>
          isAuthenticated ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: location }
              }}
            />
          )
        }
      />
    );
  }; 


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
          <Route path="/login">
            <Login setIsAuthenticated={setIsAuthenticated} />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <PrivateRoute path="/documents" isAuthenticated={isAuthenticated}>
            <DocumentList />
          </PrivateRoute>
          <PrivateRoute path="/document/:id" isAuthenticated={isAuthenticated}>
            <DocumentEdit />
          </PrivateRoute>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
 