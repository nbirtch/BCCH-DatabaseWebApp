import React, { useState } from "react";
import { Loading } from "../Loading";
import { TableSection } from "./TableSection";
import {
  AssessmentFilterSecion,
  TimeFilterSection,
  AgeFilterSection,
  GenderFilterSection
} from "./Filters";
import { toaster, Heading, Select, Icon, SideSheet } from "evergreen-ui";
import axios from "axios";

// import css
import "../../css/QueryData.scss";

export function SurveyQuery(props) {
  const allAssessments = props.assessments;
  const surveys = props.surveys;
  const [assessmentPicked, setPicked] = useState("0");
  const [currentSurvey, setSurvey] = useState(
    Number(surveys[0].sId).toString()
  );
  const [filter, setFilter] = useState([]);
  const [showMenu, setShow] = useState(false);
  const [groupBy, setGroupBy] = useState("none");
  const [limit, setLimit] = useState(20);
  const [executing, setExecuting] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [sentQuery, setSentQuery] = useState({});
  const [result, setResult] = useState({});

  const allFilterOpts = ["assessment", "time", "age", "gender"];

  function buildQuery() {
    let finalQuery = {
      SURVEY: currentSurvey,
      FILTER: [],
      GROUP_BY: groupBy,
      LIMIT: limit,
      PAGE: 1
    };

    finalQuery.FILTER = filter.filter(f => {
      switch (f.type) {
        case "assessment":
          return f.value.length !== 0;
        case "age":
        case "time":
          return f.value.min <= f.value.max;
        default:
          return true;
      }
    });

    return finalQuery;
  }

  async function executeQuery() {
    setExecuting(true);
    setShowTable(true);

    try {
      let query = buildQuery();
      let res = await axios.post("/query/survey", query);
      let table = res.data;
      setSentQuery(query);
      setResult(table);
      setExecuting(false);
    } catch (e) {
      toaster.danger(e.message);
      setShowTable(false);
      setExecuting(false);
    }
  }

  function buildFilter() {
    return filter.map(f => {
      switch (f.type) {
        case "assessment":
          return (
            <AssessmentFilterSecion
              title="Assessment"
              allAssessments={allAssessments}
              type={f.type}
              filter={filter}
              setFilter={setFilter}
              setPicked={setPicked}
              assessmentPicked={assessmentPicked}
              key="assess-filter-section"
            />
          );
        case "time":
          return (
            <TimeFilterSection
              title="Time Range"
              type={f.type}
              filter={filter}
              setFilter={setFilter}
              key="time-filter-section"
            />
          );
        case "age":
          return (
            <AgeFilterSection
              title="Age"
              type={f.type}
              filter={filter}
              setFilter={setFilter}
              key="age-filter-section"
            />
          );
        case "gender":
          return (
            <GenderFilterSection
              title="Gender"
              type={f.type}
              filter={filter}
              setFilter={setFilter}
              key="gender-filter-section"
            />
          );
      }
    });
  }

  function buildFilterObject(o) {
    switch (o) {
      case "assessment":
        return {
          type: "assessment",
          value: []
        };
      case "time":
        return {
          type: "time",
          value: { min: new Date().getTime(), max: new Date().getTime() }
        };
      case "age":
        return {
          type: "age",
          value: { min: 0, max: 0 }
        };
      case "gender":
        return {
          type: "gender",
          value: "female"
        };
    }
  }

  function buildAddFilter() {
    if (filter.length < 4) {
      return (
        <div
          className="add-filter-icon"
          onClick={() => {
            setShow(true);
          }}
        >
          <Icon icon="add" size={20} />
        </div>
      );
    }

    return "";
  }

  return (
    <div id="survey-container">
      <Heading className="container-header" size={700} marginTop="20px">
        Survey Query
      </Heading>
      <div id="query-type-container">
        <div className="qlabel">Select a Survey:</div>
        <div className="select-survey">
          <Select
            value={currentSurvey}
            onChange={event => setSurvey(event.target.value)}
          >
            {surveys.map(s => {
              return (
                <option key={`${s.sTitle}-${s.sId}-opt`} value={s.sId}>
                  {s.sTitle}
                </option>
              );
            })}
          </Select>
        </div>
        <div className="filter-section">
          <div className="qlabel">Filters</div>
          <div className="filter-container">
            {buildFilter()}
            {buildAddFilter()}
          </div>

          <SideSheet
            isShown={showMenu}
            onCloseComplete={() => setShow(false)}
            width={300}
          >
            <div className="filter-menu-container">
              <div className="qlabel">Filter by:</div>
              <div className="filter-options-container">
                {allFilterOpts
                  .filter(o => !filter.map(f => f.type).includes(o))
                  .map(o => {
                    return (
                      <button
                        key={o}
                        className="filter-option-btn"
                        onClick={() => {
                          let filterObj = buildFilterObject(o);
                          filter.push(filterObj);
                          setFilter(filter);
                          setShow(false);
                        }}
                      >
                        {o}
                      </button>
                    );
                  })}
              </div>
            </div>
          </SideSheet>
        </div>
        <div className="group-by-section">
          <div className="qlabel">Group By</div>
          <div className="group-by-container">
            <Select onChange={event => setGroupBy(event.target.value)}>
              <option key="none-opt" value="none" defaultValue>
                None
              </option>
              <option key="age-opt" value="age">
                Age
              </option>
              <option key="gender-opt" value="gender">
                Gender
              </option>
              <option key="assessment-opt" value="assessment">
                Assessment
              </option>
              <option key="question_number-opt" value="question_number">
                Question Number
              </option>
            </Select>
          </div>
        </div>
        <div className="limit-section">
          <div className="qlabel">Data Records Per Page</div>
          <div className="limit-container">
            <Select onChange={event => setLimit(parseInt(event.target.value))}>
              <option key="limit-20-opt" value="20" defaultValue>
                20
              </option>
              <option key="limit-50-opt" value="50">
                50
              </option>
              <option key="limit-100-opt" value="100">
                100
              </option>
            </Select>
          </div>
        </div>
        <div className="execute-btn-group">
          <button className="execute-btn" onClick={() => executeQuery()}>
            Execute
          </button>
        </div>
        <div
          id="result-table"
          style={{ display: showTable ? "block" : "none" }}
        >
          <Loading isLoading={executing || !showTable}>
            <TableSection
              sentQuery={sentQuery}
              render="survey"
              setExecuting={setExecuting}
              result={result}
              setSentQuery={setSentQuery}
              setResult={setResult}
            />
          </Loading>
        </div>
      </div>
    </div>
  );
}
