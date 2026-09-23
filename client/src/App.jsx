import React from 'react';
import { Switch, Route } from 'wouter';
import Home from './pages/Home';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route component={Home} />
    </Switch>
  );
}
