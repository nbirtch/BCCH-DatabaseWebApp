import React, { useState } from "react";
import Cleave from "cleave.js/react";
import {
  Text,
  Textarea,
  Heading,
  Paragraph,
  TextInput,
  Dialog,
  Select
} from "evergreen-ui";

import "../../css/Upload.scss";
import "../../css/Survey.scss";

function MCQ(props) {
  const question = props.question;
  const options = question.qOpts;
  const answer = props.answer;
  const value = props.value;
  const length = Object.keys(options).length;

  function generateChoices() {
    let choices = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWX";
    let char = "";
    let choice = "";

    Object.keys(options).forEach(function(qNum) {
      char = characters.charAt(qNum - 1);
      choice = char + ". " + options[qNum];
      choices += choice + "\n";
    });

    return choices;
  }

  function generateItems() {
    let items = [];
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWX";
    let empty = "---";

    items.push(
      <option key={""} value={""}>
        {empty}
      </option>
    );

    for (let i = 0; i < length; i++) {
      const char = characters.charAt(i);
      items.push(
        <option key={char} value={char}>
          {char}
        </option>
      );
    }

    return items;
  }

  return (
    <div>
      <Paragraph className="mcq-choices" size={500} marginTop="10px">
        {generateChoices()}
      </Paragraph>
      <Select defaultValue={value} onChange={answer}>
        {generateItems()}
      </Select>
    </div>
  );
}

function ScaleSlider(props) {
  const question = props.que;
  const answer = props.ans;
  const [range, setRange] = useState(props.value);

  return (
    <div>
      <Text className="scale-text" size={500} marginRight="5px">
        {question.qOpts.min}
      </Text>
      <input
        className="range-input"
        type="range"
        min={question.qOpts.min}
        step="1"
        value={range}
        onChange={e => {
          answer(e);
          setRange(e.target.value);
        }}
        max={question.qOpts.max}
      />
      <Text className="scale-text" size={500} marginLeft="5px">
        {question.qOpts.max}
      </Text>
      <input className="scale-label" readOnly={true} value={range} />
    </div>
  );
}

export function SurveyPortal(props) {
  if (!props.currentSurvey) {
    return <div></div>;
  }

  const [quitDialogIsShown, setQuitDialogIsShown] = useState();
  const surveyList = props.data.surveys;
  const [theSurvey, exitFunc] = [
    surveyList.find(s => s.sId === props.currentSurvey),
    props.viewSwitcher
  ];
  const surveyAns = props.survey;
  let originalAns = surveyAns.find(s => s.sId === props.currentSurvey);
  const template = {};
  for (let q of theSurvey.sContent) {
    if (!template[q.qOrder]) {
      template[q.qOrder] = "";
    }
  }
  originalAns = originalAns ? originalAns.answers : template;
  const [answer, setAnswer] = useState(originalAns);

  function saveSurvey() {
    return () => {
      let filteredAns = surveyAns.filter(s => s.sId !== props.currentSurvey);
      filteredAns.push({ sId: theSurvey.sId, answers: answer });
      props.setSurvey(filteredAns);
      exitFunc()();
    };
  }

  function buildQuestion(question) {
    const tpe = question.qType;
    const qNum = question.qOrder;

    const handleOnChange = e => {
      const value = e.target.value;
      setAnswer(prev => ({
        ...prev,
        [qNum]: value
      }));
    };

    const descriptionField = (
      <div>
        <Paragraph size={500} marginTop="10px">
          {question.qOrder}. {question.qDesc}
        </Paragraph>
      </div>
    );

    let answerField = "";

    if (tpe === "fill") {
      answerField = (
        <TextInput value={answer[qNum]} onChange={handleOnChange} />
      );
    } else if (tpe === "fill_time") {
      answerField = (
        <Cleave
          className="general-fill time-fill"
          value={answer[qNum]}
          placeholder="HH:MM:SS"
          options={{
            time: true,
            timePattern: ["h", "m", "s"]
          }}
          onChange={handleOnChange}
        />
      );
    } else if (tpe === "fill_num") {
      answerField = (
        <Cleave
          className="general-fill num-fill"
          value={answer[qNum]}
          options={{
            numeral: true,
            numeralPositiveOnly: true,
            numeralDecimalScale: 0
          }}
          onChange={handleOnChange}
        />
      );
    } else if (tpe === "multiple") {
      const value = answer[qNum] ? answer[qNum] : "";

      answerField = (
        <MCQ question={question} value={value} answer={handleOnChange} />
      );
    } else if (tpe === "fillPara") {
      answerField = (
        <Textarea
          value={answer[qNum]}
          onChange={handleOnChange}
          grammarly={true}
          spellCheck={true}
        />
      );
    } else if (tpe === "scale") {
      const value = answer[qNum] ? answer[qNum] : question.qOpts.min;
      answerField = (
        <ScaleSlider value={value} que={question} ans={handleOnChange} />
      );
    }

    return (
      <div key={question.qOrder} className="survey-question">
        <div className="question-desc-section">{descriptionField}</div>
        <div className="answer-section">{answerField}</div>
      </div>
    );
  }

  let isComplete = true;
  for (const a in answer) {
    if (!answer[a]) {
      isComplete = false;
      break;
    }
  }

  let saveClassName = "primary-button";

  if (!isComplete) {
    saveClassName += " disabled";
  }

  return (
    <div id="survey-portal-container">
      <div id="survey-title-container">
        <Heading size={700} marginTop="20px">
          {theSurvey.sTitle}
        </Heading>
      </div>
      <div id="instruction-field">
        <Paragraph size={500} fontWeight={500} marginTop="default">
          {theSurvey.sInst}
        </Paragraph>
      </div>
      <div id="question-container">
        {theSurvey.sContent.map(q => buildQuestion(q))}
      </div>
      <div className="submit-button-group">
        <div className={saveClassName} onClick={saveSurvey()}>
          Save
        </div>
        <div
          className="cancel-button"
          onClick={() => {
            setQuitDialogIsShown(true);
          }}
        >
          Cancel
        </div>
      </div>

      <Dialog
        isShown={quitDialogIsShown}
        onConfirm={exitFunc()}
        confirmLabel="Quit"
        preventBodyScrolling
        cancelLabel="Cancel"
        onCloseComplete={() => setQuitDialogIsShown(false)}
        title="Quit Confirmation"
        intent="warning"
      >
        Do you want to leave the survey? All changes will not be saved.
      </Dialog>
    </div>
  );
}
