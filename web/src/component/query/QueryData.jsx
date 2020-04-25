import React, { useState, useEffect } from "react";
import { Loading } from "../Loading";
import { MediaQuery } from "./MediaQuery";
import { SurveyQuery } from "./SurveyQuery";
import { PlainQuery } from "./PlainQuery";
import { toaster, Select } from "evergreen-ui";
import axios from "axios";
import { useHistory } from "react-router-dom";

// import css
import "../../css/QueryData.scss";

export function QueryData() {
  let [fetching, setFetching] = useState(false);
  let [currentView, setView] = useState("media");
  let [surveys, setSurveys] = useState([]);
  let [assessments, setAssessments] = useState([]);
  let history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        let assessProm = axios.get("/assessment/all");
        let surveyProm = axios.get("/survey/all");
        let finalRes = await Promise.all([assessProm, surveyProm]);
        setAssessments(finalRes[0].data);
        setSurveys(finalRes[1].data);
        setFetching(false);
      } catch (e) {
        toaster.danger(e.message);
      }
    })();
  }, []);

  function sectionViewRenderer() {
    switch (currentView) {
      case "media":
        return <MediaQuery assessments={assessments} />;
      case "survey":
        return <SurveyQuery surveys={surveys} assessments={assessments} />;
      case "plain":
        return <PlainQuery />;
    }
  }

  function switchView(view) {
    return () => {
      setView(view);
      return false;
    };
  }

  return (
    <Loading isLoading={fetching}>
      <div id="query-container">
        <div id="query-switch-panel">
          <button
            className={`query-view-btn ${
              currentView === "media" ? "chosen" : ""
            }`}
            onClick={switchView("media")}
          >
            Media Query
          </button>
          <button
            className={`query-view-btn ${
              currentView === "survey" ? "chosen" : ""
            }`}
            onClick={switchView("survey")}
          >
            Survey Query
          </button>
          <button
            className={`query-view-btn ${
              currentView === "plain" ? "chosen" : ""
            }`}
            onClick={switchView("plain")}
          >
            Plain Query
          </button>
          <button
            className="query-view-btn secondary"
            onClick={() => {
              history.push("/dashboard");
            }}
          >
            Back
          </button>
        </div>
        <div id="query-main">
          <div className="responsive-header-select">
            <Select onChange={event => setView(event.target.value)}>
              <option value="media" defaultValue>
                Media Query
              </option>
              <option value="survey">Survey Query</option>
              <option value="plain">Plain Query</option>
            </Select>
            <button
              className="responsive-back-btn"
              onClick={() => {
                history.push("/dashboard");
              }}
            >
              Back
            </button>
          </div>
          {sectionViewRenderer()}
        </div>
      </div>
    </Loading>
  );
}
