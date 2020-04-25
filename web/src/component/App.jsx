import React, { useState, useEffect } from "react";
import { HashRouter as Router, Link } from "react-router-dom";
import { CookiesProvider, useCookies } from "react-cookie";
import axios from "axios";

// import components
import { Header } from "./Header";
import { Routes } from "./Routes";
import { Loading } from "./Loading";

// import css
import "../css/App.scss";

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: "",
    displayName: "",
    gender: "",
    age: 0,
    birthdate: "",
    type: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`/userInfo`);
      const user = res.data;
      login(user);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchUser();
  }, []);

  function login(userInfo) {
    setUserInfo(userInfo);
    setIsLoggedIn(true);
  }

  function logout() {
    if (typeof cookies["access_token"] === "string") {
      axios.post("/logout");
    }
    setUserInfo({
      username: "",
      displayName: "",
      gender: "",
      age: 0,
      birthdate: "",
      type: ""
    });
    setIsLoggedIn(false);
  }

  return (
    <div className="component-app">
      <CookiesProvider>
        <Router>
          <Header
            isLoggedIn={isLoggedIn}
            userInfo={userInfo}
            logout={logout}
            removeCookie={removeCookie}
          />
          <div id="content">
            <Loading isLoading={isLoading}>
              <Routes
                isLoggedIn={isLoggedIn}
                cookies={cookies}
                setCookie={setCookie}
                userInfo={userInfo}
                removeCookie={removeCookie}
                login={login}
                logout={logout}
              />
            </Loading>
          </div>
        </Router>
      </CookiesProvider>
    </div>
  );
}
