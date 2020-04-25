import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import axios from "axios";

// import css
import "../css/Login.scss";

export function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUserActive, setIsUserActive] = useState(false);
  const [isPassActive, setIsPassActive] = useState(false);
  const [isUserEmpty, setIsUserEmpty] = useState(false);
  const [isPassEmpty, setIsPassEmpty] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const history = useHistory();

  function fieldOnFocus(e) {
    const target = e.target;
    const name = target.name;

    switch (name) {
      case "username":
        setIsUserActive(true);
        break;
      case "password":
        setIsPassActive(true);
        break;
    }
  }

  function fieldOnBlur(e) {
    const target = e.target;
    const name = target.name;

    switch (name) {
      case "username":
        setIsUserActive(username !== "");
        setIsUserEmpty(username === "");
        break;
      case "password":
        setIsPassActive(password !== "");
        setIsPassEmpty(password === "");
        break;
    }
  }

  function inputOnChange(e) {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    switch (name) {
      case "username":
        setUsername(value);
        break;
      case "password":
        setPassword(value);
        break;
    }
  }

  let userFieldName = "field-container";
  let passFieldName = "field-container";
  let buttonFieldName = "login-button";
  let warningFieldName = "warning-label";

  userFieldName += isUserActive ? " active" : "";
  userFieldName += !username && isUserEmpty ? " error" : "";
  passFieldName += isPassActive ? " active" : "";
  passFieldName += !password && isPassEmpty ? " error" : "";
  buttonFieldName += !username || !password ? " disabled" : "";
  warningFieldName += isFailed ? " show" : "";
  buttonFieldName += isFailed ? " failed" : "";

  async function handleLogin() {
    const userQuery = {
      username: username,
      password: password
    };

    try {
      const res = await axios.post(`/login`, userQuery);
      const user = res.data;
      const token = user.token;
      props.login(user);
      props.setCookie("access_token", token);
      history.push("/dashboard");
    } catch (e) {
      setIsFailed(true);
    }
  }

  return (
    <div className="login-page">
      <div className="login-content">
        <form className="login-form">
          <div className="form-title">Login</div>
          <div className={userFieldName}>
            <input
              className="field-box input"
              type="text"
              name="username"
              value={username}
              onChange={inputOnChange}
              onFocus={fieldOnFocus}
              onBlur={fieldOnBlur}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />
            <label className="field-label">Username</label>
          </div>
          <div className={passFieldName}>
            <input
              className="field-box input"
              type="password"
              name="password"
              value={password}
              onChange={inputOnChange}
              onFocus={fieldOnFocus}
              onBlur={fieldOnBlur}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />
            <label className="field-label">Password</label>
          </div>
          <label className={warningFieldName}>
            Username or Password is invalid
          </label>
          <button
            className={buttonFieldName}
            type="button"
            onClick={() => {
              handleLogin();
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
