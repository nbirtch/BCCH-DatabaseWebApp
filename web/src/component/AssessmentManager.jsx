import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";

// import css
import "../css/AssessmentManager.scss";

function AddAssessmentIcon() {
  return (
    <Link className="dashboard-button" to="/createAssessment">
      Add Assessment
    </Link>
  );
}

function ArchiveAssessmentIcon() {
  return (
    <Link className="dashboard-button" to="/archiveAssessment">
      Archive Assessment
    </Link>
  );
}

function AddSurveyIcon() {
  return (
    <Link className="dashboard-button" to="/createSurvey">
      Add Survey
    </Link>
  );
}

function BackButton() {
  let history = useHistory();
  function handleBack() {
    history.push("/dashboard");
  }

  return (
    <div className="negative-button" onClick={handleBack}>
      Back
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

function AssessmentMenu(props) {
  const userInfo = props.userInfo;

  return (
    <div>
      <div className="container">
        <p className="dash-board-greeting">{checkTime()}</p>
        <div className="dash-board-username">{userInfo.displayName}</div>
        <AddAssessmentIcon />
        <ArchiveAssessmentIcon />
        <AddSurveyIcon />
        <BackButton {...props} />
      </div>
    </div>
  );
}

export function AssessmentManager(props) {
  let [curView, setCurView] = useState("menu");

  return (
    <div id="dash-board-admin-container">
      <div id="dash-board-admin-main">
        <div style={{ display: curView === "menu" ? "block" : "none" }}>
          <AssessmentMenu {...props} setCurView={setCurView} />
        </div>
      </div>
    </div>
  );
}
