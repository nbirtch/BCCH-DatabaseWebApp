import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";

// import css
import "../css/DashboardAdmin.scss";

function RunQueryIcon() {
  return (
    <Link className="dashboard-button" to="/query">
      Run Query
    </Link>
  );
}

function ManageAssessmentIcon() {
  return (
    <Link className="dashboard-button" to="/manageAssessment">
      Manage Assessment
    </Link>
  );
}

function ManageUserIcon() {
  return (
    <Link className="dashboard-button" to="/manageUser">
      Manage User
    </Link>
  );
}

function LogOutButton(props) {
  let history = useHistory();
  function handleLogOut() {
    props.logout();
    props.removeCookie("access_token");
    history.push("/login");
  }

  return (
    <div className="negative-button" onClick={handleLogOut}>
      Log out
    </div>
  );
}

function checkTime() {
  let currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "Good morning!";
  } else if (currentHour >= 12 && currentHour < 18) {
    return "Good afternoon!";
  } else if (currentHour >= 18 || currentHour < 5) {
    return "Good Evening!";
  } else {
    return "Hello!";
  }
}

function DashAdminMenu(props) {
  const userInfo = props.userInfo;

  return (
    <div>
      <div className="container">
        <p className="dash-board-greeting">{checkTime()}</p>
        <div className="dash-board-username">{userInfo.displayName}</div>
        <RunQueryIcon />
        <ManageAssessmentIcon />
        <ManageUserIcon />
        <LogOutButton {...props} />
      </div>
    </div>
  );
}

export function DashboardAdmin(props) {
  let [curView, setCurView] = useState("menu");

  return (
    <div id="dash-board-admin-container">
      <div id="dash-board-admin-main">
        <div style={{ display: curView === "menu" ? "block" : "none" }}>
          <DashAdminMenu {...props} setCurView={setCurView} />
        </div>
      </div>
    </div>
  );
}
