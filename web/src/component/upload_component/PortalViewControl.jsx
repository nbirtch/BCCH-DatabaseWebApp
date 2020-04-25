import React, { useState } from "react";
import { SurveyPortal } from "./SurveyPortal";
import { MainPortal } from "./MainPortal";

import "../../css/Upload.scss";

export function PortalViewControl(props) {
  const [video, setVideo] = useState([]);
  const [picture, setPicture] = useState([]);
  const [survey, setSurvey] = useState([]);

  const sessionData = props.data;

  const [currentView, setCurrentView] = useState("portal");
  const [currentSurvey, setCurrentSurvey] = useState("");

  function switchToSurvey(surveyID) {
    return () => {
      setCurrentSurvey(surveyID);
      setCurrentView("survey");
    };
  }

  function switchToPortal() {
    return () => {
      setCurrentSurvey("");
      setCurrentView("portal");
    };
  }

  function setView(newView) {
    return {
      display: currentView === newView ? "block" : "none"
    };
  }

  return (
    <div className="portal-view-control">
      <div style={setView("portal")}>
        <MainPortal
          data={sessionData}
          currSession={{
            id: props.sessionType,
            video: video,
            picture: picture,
            survey: survey
          }}
          setVideo={setVideo}
          setPicture={setPicture}
          viewSwitcher={switchToSurvey}
        />
      </div>
      <div style={setView("survey")}>
        <SurveyPortal
          data={sessionData}
          survey={survey}
          setSurvey={setSurvey}
          currentSurvey={currentSurvey}
          viewSwitcher={switchToPortal}
        />
      </div>
    </div>
  );
}
