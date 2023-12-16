import 'bootstrap';
import './scss/_style.scss';
import './scss/_mobile.scss';
import "@fortawesome/fontawesome-free/js/all";


import React, { useState, useEffect } from 'react';
import Home from "./Components/Home";
// import Navbar from "./Components/Navbar";
import Navigation from "./Components/Navigation";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SaleInvoice from "./Components/SaleInvoice";
import PurchaseInvoice from "./Components/PurchaseCom";
import User from './Components/User';
import Login from './Components/Login';
import Search from './Components/Search';
import Stock from './Components/Stock';
import Signup from './Components/Signup';
import Records from './Components/Records';


const App = () => {
  const user = localStorage.getItem("user");
  const [login, setLogin] = useState(user ? true : false);
  
  useEffect(() => {
    // Check if the user token exists in localStorage
    const userToken = localStorage.getItem('user');

    if (userToken) {
      const lastLoginTime = localStorage.getItem('lastLoginTime');
      const currentTime = new Date();

      // Calculate the time difference in milliseconds
      const timeDifference = currentTime - (lastLoginTime || 0);

      const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // Check if the user token should be removed (e.g., if it's older than 24 hours)
      if (timeDifference >= oneDayInMilliseconds) {
        // Remove the user token from localStorage
        localStorage.removeItem('user');
      }
    }

  }, [login, user]);




  return (
    <>
      <Router >
        <div>

          {!login ? (
            <>
              <Routes>
                <Route path="/ " element={<Signup setLogin={setLogin} />} />
                <Route path="*" element={<Login setLogin={setLogin} />} />
              </Routes>
            </>
          ) : (


            <div className="app-container">
              {/* <Navbar /> */}

              {/* Main content */}
              <div className="main-content">
                <Routes>
                  <Route exact path="*" element={<Home />} />
                  <Route exact path="/saleinvoice" element={<SaleInvoice />} />
                  <Route exact path="/purchase" element={<PurchaseInvoice />} />
                  <Route exact path="/user" element={<User setLogin={setLogin} />} />
                  <Route exact path="/search" element={<Search />} />
                  <Route exact path="/stock" element={<Stock />} />
                  <Route exact path="/records" element={<Records />} />

                </Routes>
              </div>

              {/* Bottom Navigation */}
              <Navigation />
            </div>
          )
          }

        </div>

      </Router>
    </>
  )
}


export default App