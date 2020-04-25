import React, { useState, useEffect } from "react";
import {
  toaster,
  Paragraph,
  TextInput,
  Heading,
  Textarea,
  SideSheet,
  Pill,
  Dialog,
  Select
} from "evergreen-ui";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Loading } from "./Loading";

import "../css/AssessmentCreator.scss";

function AddMenu(props) {
  let [type, setType] = useState("Video");
  let [survey, setSurvey] = useState(false);
  let [description, descSetter] = useState("No Description");

  function resetMenu() {
    setType("Video");
    setSurvey(false);
    descSetter("No Description");
  }

  function addItem() {
    if (type === "Video") {
      props.videos.push(description === "" ? "No Description" : description);
      props.setVideos(props.videos);
    } else if (type === "Picture") {
      props.pics.push(description === "" ? "No Description" : description);
      props.setPics(props.pics);
    } else {
      if (survey) {
        props.surveys.push(survey);
        props.setSurveys(props.surveys);
      }
    }

    resetMenu();
    props.setShowAdd(false);
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
        <div className="type-control">
          <div className="type-title">
            Select a type of item you want to add
          </div>
          <Select onChange={event => setType(event.target.value)}>
            <option value="Video" defaultValue>
              Video
            </option>
            <option value="Picture">Picture</option>
            <option value="Survey">Survey</option>
          </Select>
        </div>
        {type === "Survey" ? (
          <div className="display-field">
            <div className="display-label">Select a survey:</div>
            <Select
              onChange={event => {
                let sur =
                  event.target.value === "none" ? false : event.target.value;
                if (sur) {
                  sur = props.surOptions.find(s => s.sId.toString() === sur);
                }
                setSurvey(sur);
              }}
            >
              <option
                value={"none"}
                key="survey-opt-false"
                defaultValue
              ></option>
              {props.surOptions.map(item => {
                return (
                  <option value={item.sId} key={`survey-opt-${item.sId}`}>
                    {item.sTitle}
                  </option>
                );
              })}
            </Select>
          </div>
        ) : (
          <div className="display-field">
            <div className="display-label">Description:</div>
            <Textarea
              onChange={e => descSetter(e.target.value)}
              value={description}
            />
          </div>
        )}

        <div className="add-primary-button" onClick={addItem}>
          Add
        </div>
      </div>
    </SideSheet>
  );
}

export function AssessmentCreator(props) {
  let [name, setName] = useState("Untitled Assessment");
  let [desc, setDesc] = useState("No Description");
  let [videos, setVideos] = useState([]);
  let [pics, setPics] = useState([]);
  let [surveys, setSurveys] = useState([]);
  let [showAdd, setShowAdd] = useState(false);
  let [surveyOptions, setSurveyOptions] = useState([]);
  let [fetching, setFetching] = useState(true);
  let [confDialState, setConfDialState] = useState({
    isShown: false,
    isLoading: false
  });

  let history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        let res = await axios("/survey/all");
        setSurveyOptions(res.data);
        setFetching(false);
      } catch (e) {
        toaster.danger(e.message);
      }
    })();
  }, []);

  async function createAssessment() {
    setConfDialState({ isLoading: true, isShown: true });

    let sendForm = {
      title: name.trim(),
      desc: desc,
      videos: videos,
      pictures: pics,
      surveyIDs: surveys.map(s => s.sId)
    };

    try {
      let res = await axios.post("/assessment/add", sendForm);
      toaster.success(`Added assessment with id ${res.data.id}`);
      history.push("/manageAssessment");
    } catch (e) {
      toaster.danger(e.message);
    }
  }

  function createInput(n, lst, setter) {
    return lst.map((item, idx) => {
      return (
        <div className="input-desc-field" key={`${n}-input-${idx}`}>
          <div className="create-label">
            {idx + 1}. {n}{" "}
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
            {n === "Survey" ? item.sTitle : item}
          </Paragraph>
        </div>
      );
    });
  }

  function createSection(n, inputs) {
    return (
      <div className="create-section-common">
        <div className="create-section-title">
          <div className="create-label">
            {n}
            <Pill display="inline-flex" margin={8} color="red" isSolid>
              {inputs.length}
            </Pill>
          </div>
        </div>
        <div className="create-section-desc-container">{inputs}</div>
      </div>
    );
  }

  let [videoInputs, picInputs, surInputs] = [
    createInput("Video", videos, setVideos),
    createInput("Picture", pics, setPics),
    createInput("Survey", surveys, setSurveys)
  ];

  let createClassName = "primary-button";

  if (
    name.trim() === "" ||
    (surveys.length === 0 && videos.length === 0 && pics.length === 0)
  ) {
    createClassName += " disabled";
  }

  return (
    <Loading isLoading={fetching}>
      <div id="create-assess-container">
        <div id="create-assess-main">
          <div className="header-group">
            <Heading size={700} marginTop="20px">
              Create a new Assessment
            </Heading>
          </div>
          <div className="basic-section-info">
            <div className="create-label">Assessment Name</div>
            <TextInput
              onChange={e => setName(e.target.value)}
              marginBottom="15px"
              value={name}
            />
            <div className="create-label">Assessment Description</div>
            <Textarea onChange={e => setDesc(e.target.value)} value={desc} />
          </div>
          {createSection("Video", videoInputs)}
          {createSection("Picture", picInputs)}
          {createSection("Survey", surInputs)}
          <div className="submit-button-group">
            <div
              className={createClassName}
              onClick={() =>
                setConfDialState({
                  isLoading: false,
                  isShown: true
                })
              }
            >
              Save
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

          <div
            id="create-button"
            onClick={() => {
              setShowAdd(true);
            }}
          >
            Add
          </div>
          <AddMenu
            showAdd={showAdd}
            setShowAdd={setShowAdd}
            surOptions={surveyOptions}
            videos={videos}
            setVideos={setVideos}
            pics={pics}
            setPics={setPics}
            surveys={surveys}
            setSurveys={setSurveys}
          />
        </div>

        <Dialog
          isShown={confDialState.isShown}
          isConfirmLoading={confDialState.isLoading}
          onCancel={close => {
            if (confDialState.isLoading) {
              return;
            } else {
              close();
            }
          }}
          onConfirm={createAssessment}
          confirmLabel={confDialState.isLoading ? "Creating..." : "Create"}
          onCloseComplete={() =>
            setConfDialState({
              isLoading: false,
              isShown: false
            })
          }
          preventBodyScrolling
          shouldCloseOnEscapePress={!confDialState.isLoading}
          shouldCloseOnOverlayClick={!confDialState.isLoading}
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
