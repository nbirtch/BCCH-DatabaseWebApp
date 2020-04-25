import React from "react";
import { toaster, Heading, Select, Icon, SideSheet } from "evergreen-ui";
import DatePicker from "react-datepicker";

// import css
import "../../css/QueryData.scss";
import "react-datepicker/dist/react-datepicker.css";

function FilterSection(props) {
  let filter = props.filter;
  let title = props.title;
  let type = props.type;
  let setFilter = props.setFilter;
  let beforeDel = props.beforeDel;

  function delItem(type) {
    return () => {
      beforeDel();
      let newList = filter.filter(f => f.type !== type);
      setFilter(newList);
    };
  }

  return (
    <div className="filter-option-section">
      <div className="filter-option-qlabel">
        Filter By {title}
        <span style={{ color: "rgba(0, 0, 0, 0.19)" }}> |</span>
        <span className="delete-filter" onClick={delItem(type)}>
          delete
        </span>
      </div>
      <div className="filter-option-content">{props.children}</div>
    </div>
  );
}

export function AssessmentFilterSecion(props) {
  let allAssessments = props.allAssessments;
  let tpe = props.type;
  let filter = props.filter;
  let setFilter = props.setFilter;
  let setPicked = props.setPicked;
  let assessmentPicked = props.assessmentPicked;
  let title = props.title;

  function addAssessToFilter() {
    let newFilter = filter.map(f => {
      if (f.type === "assessment") {
        if (assessmentPicked !== "0" && !f.value.includes(assessmentPicked)) {
          f.value.push(assessmentPicked);
        }
      }
      return f;
    });

    setFilter(newFilter);
  }

  function delAssess(id) {
    return () => {
      let newFilter = filter.map(f => {
        if (f.type === "assessment") {
          f.value = f.value.filter(i => i !== id);
        }
        return f;
      });

      setFilter(newFilter);
    };
  }

  return (
    <FilterSection
      title={title}
      type={tpe}
      filter={filter}
      setFilter={setFilter}
      beforeDel={() => {
        setPicked("0");
      }}
    >
      <div className="assessment-content">
        <div className="assess-picker">
          <Select onChange={event => setPicked(event.target.value)}>
            <option key="empty-opt" value="0" defaultValue></option>
            {allAssessments.map(a => {
              return (
                <option key={`${a.title}-${a.id}-opt`} value={a.id}>
                  {a.title}
                </option>
              );
            })}
          </Select>
          <button className="assess-add-btn" onClick={addAssessToFilter}>
            Add
          </button>
        </div>
        <div className="assess-pick-so-far-container">
          {filter
            .find(f => f.type === "assessment")
            .value.map(id => {
              return (
                <div className="picked-assess" key={`picked-ass-${id}`}>
                  {
                    allAssessments.find(a => Number(a.id).toString() === id)
                      .title
                  }
                  <span style={{ color: "rgba(0, 0, 0, 0.19)" }}> |</span>
                  <div className="delete-asses-pick" onClick={delAssess(id)}>
                    X
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </FilterSection>
  );
}

export function TimeFilterSection(props) {
  let type = props.type;
  let filter = props.filter;
  let setFilter = props.setFilter;
  let timeFilter = filter.find(f => f.type === "time");
  let title = props.title;

  function handleFrom(date) {
    if (date) {
      timeFilter.value.min = date.getTime();
      let newF = filter.map(f => {
        if (f.type === "time") {
          return timeFilter;
        }
        return f;
      });

      setFilter(newF);
    }
  }

  function handleTo(date) {
    if (date) {
      timeFilter.value.max = date.getTime();
      let newF = filter.map(f => {
        if (f.type === "time") {
          return timeFilter;
        }
        return f;
      });

      setFilter(newF);
    }
  }

  return (
    <FilterSection
      title={title}
      type={type}
      filter={filter}
      setFilter={setFilter}
      beforeDel={() => {}}
      key="time-filter-section"
    >
      <div className="time-range-content">
        <div className="time-range-picker">
          <span className="time-qlabel">From</span>
          <DatePicker
            selected={new Date(timeFilter.value.min)}
            onChange={handleFrom}
          />
        </div>
        <div className="time-range-picker">
          <span className="time-qlabel">To</span>
          <DatePicker
            selected={new Date(timeFilter.value.max)}
            onChange={handleTo}
          />
        </div>
      </div>
    </FilterSection>
  );
}

export function AgeFilterSection(props) {
  let type = props.type;
  let filter = props.filter;
  let setFilter = props.setFilter;
  let title = props.title;
  let ageFilter = filter.find(f => f.type === "age");

  function handleMin(event) {
    let age;
    if (event.target.value === "") {
      age = 0;
    } else {
      age = parseInt(event.target.value);
    }
    if (age !== NaN && 0 <= age && age <= 1000) {
      ageFilter.value.min = age;
      let newF = filter.map(f => {
        if (f.type === "age") {
          return ageFilter;
        }
        return f;
      });

      setFilter(newF);
    }
  }

  function handleMax(event) {
    let age;
    if (event.target.value === "") {
      age = 0;
    } else {
      age = parseInt(event.target.value);
    }
    if (age !== NaN && 0 <= age && age <= 1000) {
      ageFilter.value.max = age;
      let newF = filter.map(f => {
        if (f.type === "age") {
          return ageFilter;
        }
        return f;
      });

      setFilter(newF);
    }
  }

  return (
    <FilterSection
      title={title}
      type={type}
      filter={filter}
      setFilter={setFilter}
      beforeDel={() => {}}
      key="age-filter-section"
    >
      <div className="age-range-content">
        <div className="age-range-picker">
          <span className="age-qlabel">Min</span>
          <input value={ageFilter.value.min} onChange={handleMin} />
        </div>
        <div className="age-range-picker">
          <span className="age-qlabel">Max</span>
          <input value={ageFilter.value.max} onChange={handleMax} />
        </div>
      </div>
    </FilterSection>
  );
}

export function GenderFilterSection(props) {
  let type = props.type;
  let filter = props.filter;
  let setFilter = props.setFilter;
  let title = props.title;

  function handleGender(g) {
    let newF = filter.map(f => {
      if (f.type === "gender") {
        f.value = g;
      }
      return f;
    });

    setFilter(newF);
  }

  return (
    <FilterSection
      title={title}
      type={type}
      filter={filter}
      setFilter={setFilter}
      beforeDel={() => {}}
      key="gender-filter-section"
    >
      <div className="gender-content">
        <div className="gender-picker">
          <Select onChange={event => handleGender(event.target.value)}>
            <option key="female" value="female" defaultValue>
              Female
            </option>
            <option key="male" value="male">
              Male
            </option>
          </Select>
        </div>
      </div>
    </FilterSection>
  );
}
