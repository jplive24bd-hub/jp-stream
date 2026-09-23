import React from "react";
import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Switch>
      {/* অ্যাপ ব্যবহারকারীদের জন্য সরাসরি হোম পেজ (কোনো লগইন নেই) */}
      <Route path="/" component={Home} />
      
      {/* শুধুমাত্র ব্রাউজার/ইউআরএল দিয়ে অ্যাক্সেস করার জন্য এডমিন পেজ */}
      <Route path="/admin" component={Admin} />
      
      {/* অন্য যেকোনো রুটে সরাসরি হোম পেজ দেখাবে */}
      <Route component={Home} />
    </Switch>
  );
}
