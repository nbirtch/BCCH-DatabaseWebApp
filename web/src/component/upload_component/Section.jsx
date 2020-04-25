import React, { useState, useEffect } from "react";
import {
  Icon,
  Badge,
  Tooltip,
  UnorderedList,
  ListItem,
  Position,
  toaster
} from "evergreen-ui";

import "../../css/Upload.scss";

function buildMediaSection(updateInfoObj) {
  let blockDisplayStyle = {
    display: updateInfoObj.requiredNum === 0 ? "none" : "block"
  };

  let titlePicker = {
    video: "Video",
    picture: "Picture"
  };

  let iconPicker = {
    video: "video",
    picture: "graph"
  };

  let uploadPlaceHolder = (
    <div className="upload-item upload-place-holder">
      <div className="upload-item-icon place-holder-icon">
        <Icon icon="upload" size={40} />
      </div>
      <div className="upload-item-text place-holder-text">Upload</div>
    </div>
  );

  let objIcons = updateInfoObj.currentList.map((obj, idx) => {
    return (
      <div
        className="upload-item"
        key={`${updateInfoObj.type}-${idx}`}
        title={obj.name}
      >
        <div className="delete-icon" onClick={deleteItem(updateInfoObj, idx)}>
          <Icon icon="cross" />
        </div>
        <div className="upload-item-icon">
          <Icon icon={iconPicker[updateInfoObj.type]} size={50} />
        </div>
        <div className="upload-item-text">{obj.name}</div>
      </div>
    );
  });

  if (!updateInfoObj.status) {
    let accept = "";
    switch (updateInfoObj.type) {
      case "video":
        accept = "video/*";
        break;
      case "picture":
        accept = "image/*";
        break;
    }

    objIcons.push(
      <div
        className="upload-button-container"
        key={`upload-place-holder-${updateInfoObj.type}`}
      >
        <input
          type="file"
          accept={accept}
          name={`${updateInfoObj.type}-upload`}
          id={`${updateInfoObj.type}-upload`}
          className="inputfile-hidden"
          multiple="multiple"
          onChange={uploadHandler(updateInfoObj)}
        />
        <label
          className="upload-label"
          htmlFor={`${updateInfoObj.type}-upload`}
        >
          {uploadPlaceHolder}
        </label>
      </div>
    );
  }

  return buildCommonSection(
    updateInfoObj,
    titlePicker[updateInfoObj.type],
    objIcons,
    blockDisplayStyle
  );
}

function buildSurveySection(updateInfoObj) {
  let blockDisplayStyle = {
    display: updateInfoObj.requiredNum === 0 ? "none" : "block"
  };

  let surveyIcons = updateInfoObj.surveyInfo.map((survey, idx) => {
    const allAnswers = updateInfoObj.currentList;
    const answer = allAnswers.find(a => a.sId === survey.sId);
    if (answer) {
      return (
        <div
          className="upload-item"
          title={survey.sTitle}
          key={`survey-${survey.sId}`}
          onClick={updateInfoObj.viewSwitcher(survey.sId, updateInfoObj)}
        >
          <div className="upload-item-icon survey-done-icon">
            <Icon icon="confirm" size={50} />
          </div>
          <div className="upload-item-text">{survey.sTitle}</div>
        </div>
      );
    } else {
      return (
        <div
          className="upload-item upload-item-survey"
          title={survey.sTitle}
          key={`survey-${survey.sId}`}
          onClick={updateInfoObj.viewSwitcher(survey.sId, updateInfoObj)}
        >
          <div className="upload-item-icon">
            <Icon icon="annotation" size={50} />
          </div>
          <div className="upload-item-text">{survey.sTitle}</div>
        </div>
      );
    }
  });

  return buildCommonSection(
    updateInfoObj,
    "Survey",
    surveyIcons,
    blockDisplayStyle
  );
}

function buildCommonSection(updateInfoObj, title, items, blockDisplayStyle) {
  return (
    <div className="section-common" style={blockDisplayStyle}>
      <div className="title-upload-common">
        {title}({updateInfoObj.currentNum}/{updateInfoObj.requiredNum})
        <Tooltip
          content={makeUploadSectionDescription(
            updateInfoObj.descList,
            updateInfoObj.type
          )}
          position={Position.RIGHT}
        >
          <Icon icon="info-sign" marginLeft="10px" />
        </Tooltip>
        {updateInfoObj.status ? (
          <Badge
            color="green"
            marginLeft="10px"
            marginBottom="5px"
            paddingY="6px"
            paddingX="4px"
            height="28px"
            fontSize="20px"
          >
            DONE √
          </Badge>
        ) : (
          ""
        )}
      </div>
      <div className="files-container">{items}</div>
    </div>
  );
}

function makeUploadSectionDescription(descList, type) {
  let descComps = descList.map((desc, idx) => {
    return (
      <ListItem key={`${type}-desc-${idx}`} color="white">
        {desc}
      </ListItem>
    );
  });

  return (
    <UnorderedList key={`${type}-unordered-desc`} paddingX="10px">
      {descComps}
    </UnorderedList>
  );
}

function deleteItem(updateObj, idx) {
  return () => {
    let newList = updateObj.currentList.filter((v, i) => i !== idx);
    updateObj.sessionUpdater(newList);
  };
}

function uploadHandler(updateInfoObj) {
  const types = {
    video: "video/",
    picture: "image/"
  };

  return event => {
    let files = updateInfoObj.currentList;
    for (let f of event.target.files) {
      if (!f.type.startsWith(types[updateInfoObj.type])) {
        toaster.danger(
          `Given file ${f.name} is not a valid ${updateInfoObj.type}`
        );
        return;
      }
      files.push(f);
    }

    files = files.slice(0, updateInfoObj.requiredNum);
    updateInfoObj.sessionUpdater(files);
  };
}

export function VideoSection(props) {
  const videoInfo = props.sessionData.videos;
  const requiredNum = videoInfo.length;

  const videoNum = props.video.length;
  const isComplete = videoNum === requiredNum;

  return buildMediaSection({
    type: "video",
    descList: videoInfo,
    requiredNum: requiredNum,
    currentNum: videoNum,
    currentList: props.video,
    status: isComplete,
    sessionUpdater: props.setVideo
  });
}

export function PictureSection(props) {
  const picInfo = props.sessionData.pictures;
  const requiredNum = picInfo.length;

  const picNum = props.picture.length;
  const isComplete = picNum === requiredNum;

  return buildMediaSection({
    type: "picture",
    descList: picInfo,
    requiredNum: requiredNum,
    currentNum: picNum,
    currentList: props.picture,
    status: isComplete,
    sessionUpdater: props.setPicture
  });
}

export function SurveySection(props) {
  const surInfo = props.sessionData.surveys;
  const requiredNum = surInfo.length;

  const surveyNum = props.survey.length;
  const isComplete = surveyNum === requiredNum;

  return buildSurveySection({
    viewSwitcher: props.viewSwitcher,
    requiredNum: requiredNum,
    descList: surInfo.map(s => s.sTitle),
    surveyInfo: surInfo,
    currentNum: surveyNum,
    currentList: props.survey,
    status: isComplete
  });
}
