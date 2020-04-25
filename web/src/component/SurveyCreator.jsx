import React, { useState, useEfct } from "react";
import {
  toaster,
  Paragraph,
  TextInput,
  Heading,
  Textarea,
  Combobox,
  SideSheet,
  Pill,
  Dialog
} from "evergreen-ui";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Loading } from "./Loading";

import "../css/SurveyCreator.scss";

export function SurveyCreator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [survey, setSurvey] = useState([]);
  let [showAdd, setShowAdd] = useState(false);

  let history = useHistory();

  function addSurvey() {
    setShowAdd(true);
  }

  function getTextType(type) {
    switch (type) {
      case "fill":
        return "Fill Text";
      case "fill_time":
        return "Fill Time";
      case "fill_num":
        return "Fill Number";
      case "multiple":
        return "Multiple Choice";
      case "fillPara":
        return "Paragraph";
      case "scale":
        return "Scale";
    }
  }

  function createInput(n, lst, setter) {
    return lst.map((item, idx) => {
      return (
        <div className="input-desc-field" key={`${n}-input-${idx}`}>
          <div className="create-label">
            {`${n} ${item.qOrder} : ${getTextType(item.qType)} `}
            <span style={{ color: "rgba(0, 0, 0, 0.19)" }}>|</span>
            <span
              className="delete-creation"
              onClick={() => {
                let newList = lst.filter((_, i) => i !== idx);
                setter(newList);
              }}
            >
              delete
            </span>
          </div>
          <Paragraph
            size={500}
            marginLeft="20px"
            fontWeight={500}
            marginTop="0"
          >
            {item.qDesc}
          </Paragraph>
        </div>
      );
    });
  }

  const questionInputs = createInput("Question", survey, setSurvey);

  function createSection(n, inputs) {
    return (
      <div className="create-section-common">
        <div className="create-section-title">
          <div className="create-label">
            Survey Questions
            <Pill display="inline-flex" margin={8} color="red" isSolid>
              {inputs.length}
            </Pill>
            <div className="add-question" onClick={addSurvey}>
              Add
            </div>
          </div>
        </div>
        <div className="create-section-desc-container">{inputs}</div>
      </div>
    );
  }

  let createClassName = "primary-button";

  if (!name || !desc || survey.length === 0) {
    createClassName += " disabled";
  }

  async function createSurvey() {
    setIsLoading(true);
    setIsShown(true);

    let sendForm = {
      sTitle: name,
      sInst: desc,
      sContent: survey
    };

    try {
      let res = await axios.post("/survey/add", sendForm);
      toaster.success(`Added survey with id ${res.data.id}`);
      history.push("/manageAssessment");
    } catch (e) {
      toaster.danger(e.message);
    }
  }

  return (
    <Loading isLoading={isLoading}>
      <div id="create-survey-container">
        <div id="create-survey-main">
          <div className="header-group">
            <Heading size={700} marginTop="20px">
              Create a new Survey
            </Heading>
          </div>
          <div className="basic-section-info">
            <div className="create-label">Survey Title</div>
            <TextInput
              onChange={e => setName(e.target.value)}
              marginBottom="15px"
              value={name}
            />
            <div className="create-label">Survey Instruction</div>
            <Textarea onChange={e => setDesc(e.target.value)} value={desc} />
          </div>
          {createSection("Question", questionInputs)}

          <div className="submit-button-group">
            <div
              className={createClassName}
              onClick={() => {
                setIsLoading(false);
                setIsShown(true);
              }}
            >
              Create
            </div>
            <div
              className="cancel-button"
              onClick={() => {
                history.push("/manageAssessment");
              }}
            >
              Cancel
            </div>
          </div>
        </div>
        <AddMenu
          showAdd={showAdd}
          setShowAdd={setShowAdd}
          setSurvey={setSurvey}
        />
        <Dialog
          isShown={isShown}
          isConfirmLoading={isLoading}
          onCancel={close => {
            if (isLoading) {
              return;
            } else {
              close();
            }
          }}
          onConfirm={createSurvey}
          confirmLabel={isLoading ? "Creating..." : "Create"}
          onCloseComplete={() => {
            setIsLoading(false);
            setIsShown(false);
          }}
          preventBodyScrolling={false}
          shouldCloseOnEscapePress={!isLoading}
          shouldCloseOnOverlayClick={!isLoading}
          cancelLabel="Cancel"
          title="Upload Confirmation"
          intent="warning"
        >
          Are you ready to create ?
        </Dialog>
      </div>
    </Loading>
  );
}

function AddMenu(props) {
  const [qOrder, setQOrder] = useState("");
  const [type, setType] = useState("fill");
  const [statement, setStatement] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [mcq, setMcq] = useState({
    "1": "",
    "2": "",
    "3": ""
  });
  const [mcqNum, setMcqNum] = useState(3);

  function resetMenu() {
    setQOrder("");
    setType("fill");
    setStatement("");
    setMin("");
    setMax("");
    setMcq({
      "1": "",
      "2": "",
      "3": ""
    });
    setMcqNum(3);
  }

  function getType(type) {
    switch (type) {
      case "Fill":
        return "fill";
      case "Fill Time":
        return "fill_time";
      case "Fill Number":
        return "fill_num";
      case "Multiple Choice":
        return "multiple";
      case "Paragraph":
        return "fillPara";
      case "Scale":
        return "scale";
    }
  }

  function addItem() {
    let newQuestion = {
      qOrder: qOrder,
      qDesc: statement,
      qType: type,
      qOpts: {}
    };

    if (type === "scale") {
      newQuestion.qOpts = {
        min: min,
        max: max
      };
    }

    if (type === "multiple") {
      newQuestion.qOpts = mcq;
    }

    props.setSurvey(prev => [...prev, newQuestion]);
    resetMenu();
    props.setShowAdd(false);
  }

  let addClassName = "add-primary-button";

  if (!qOrder || !statement) {
    addClassName += " disabled";
  }

  return (
    <SideSheet
      isShown={props.showAdd}
      onCloseComplete={() => {
        resetMenu();
        props.setShowAdd(false);
      }}
      preventBodyScrolling={false}
      width={400}
    >
      <div className="create-item-menu">
        <div className="display-field">
          <div className="display-label">Question Number:</div>
          <TextInput onChange={e => setQOrder(e.target.value)} value={qOrder} />
        </div>
        <div className="type-control">
          <div className="type-title">
            Select a type of question you want to add
          </div>
          <Combobox
            items={[
              "Fill",
              "Fill Time",
              "Fill Number",
              "Scale",
              "Multiple Choice",
              "Paragraph"
            ]}
            onChange={selected => setType(getType(selected))}
            initialSelectedItem={"Fill"}
          />
        </div>
        <div className="display-field">
          <div className="display-label">Question Statement:</div>
          <Textarea
            onChange={e => setStatement(e.target.value)}
            value={statement}
          />
        </div>
        {type === "scale" && (
          <div className="display-field">
            <div className="display-label">Scale:</div>
            <label className="scale-label">Min:</label>
            <TextInput
              className="scale-input min"
              onChange={e => setMin(e.target.value)}
              value={min}
            />
            <label className="scale-label">Max:</label>
            <TextInput
              className="scale-input max"
              onChange={e => setMax(e.target.value)}
              value={max}
            />
          </div>
        )}
        {type === "multiple" && (
          <MCQ
            mcq={mcq}
            setMcq={setMcq}
            mcqNum={mcqNum}
            setMcqNum={setMcqNum}
          />
        )}
        <div className={addClassName} onClick={addItem}>
          Add
        </div>
      </div>
    </SideSheet>
  );
}

function MCQ(props) {
  const mcq = props.mcq;
  const mcqNum = props.mcqNum;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWX";
  let char = "";
  let label = "";
  let items = [];

  Object.keys(mcq).forEach(function(qNum) {
    char = characters.charAt(qNum - 1);
    label = char + ":";
    items.push(
      <div className="mcq-item" key={qNum}>
        <label className="item-label">{label}</label>
        <Textarea
          className="choice-statement"
          onChange={e => updateMcq(qNum, e.target.value)}
          value={mcq[qNum]}
        />
        <span
          className="delete-choice"
          onClick={() => {
            removeMcq(qNum);
          }}
        >
          x
        </span>
      </div>
    );
  });

  function addChoice() {
    props.setMcqNum(mcqNum + 1);
    props.setMcq(prev => ({
      ...prev,
      [mcqNum + 1]: ""
    }));
  }

  function updateMcq(qNum, content) {
    props.setMcq(prev => ({
      ...prev,
      [qNum]: content
    }));
  }

  function removeMcq(qNum) {
    let index = 1;
    let newObj = {};
    for (let pair in mcq) {
      if (pair !== qNum) {
        newObj[index] = mcq[pair];
        index++;
      }
    }
    props.setMcq(newObj);
    props.setMcqNum(Object.keys(newObj).length);
  }

  return (
    <div className="display-field">
      <div className="mcq-label">Multiple Choices:</div>
      <div className="add-choice" onClick={addChoice}>
        Add
      </div>
      <div className="choice-container">{items}</div>
    </div>
  );
}
