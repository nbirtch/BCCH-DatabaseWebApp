import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import {
  Heading,
  Tooltip,
  Icon,
  Position,
  Dialog,
  Spinner,
  Text,
  toaster
} from "evergreen-ui";
import { PictureSection, VideoSection, SurveySection } from "./Section";

import "../../css/Upload.scss";

function dialogController(setConfDialState) {
  let open = () => setConfDialState({ isShown: true, state: "waiting" });
  let close = () => setConfDialState({ isShown: false, state: "waiting" });
  let prepare = () => setConfDialState({ isShown: true, state: "preparing" });
  let load = () => setConfDialState({ isShown: true, state: "loading" });
  let finalize = () => setConfDialState({ isShown: true, state: "finalizing" });

  return { open, close, load, prepare, finalize };
}

export function MainPortal(props) {
  let history = useHistory();
  const sessionData = props.data;
  const currSession = props.currSession;

  const [confDialState, setConfDialState] = useState({
    isShown: false,
    state: "waiting"
  });
  const [uploaed, setUploaded] = useState(0);
  const [allToUpload, setToUpload] = useState(0);

  const [showGiveUp, setshowGiveUp] = useState(false);

  let controlConfirm = dialogController(setConfDialState);

  async function sendSession() {
    controlConfirm.prepare();

    let tempID = currSession["id"];
    let allVideos = currSession["video"];
    let allPictures = currSession["picture"];
    let allSurveys = currSession["survey"];
    let pendingUploads = [];
    let done = 0;

    let mediaUploadHelper = (value, type, id) => {
      let form = new FormData();
      form.append("file", value);
      pendingUploads.push(
        axios
          .post(`/upload/${type}/${id}`, form, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          })
          .then(() => {
            done++;
            setUploaded(done);
          })
      );
    };

    try {
      let createdRes = await axios.post(`/upload/start/${tempID}`);
      let createdID = createdRes.data.id;
      setUploaded(0);
      setToUpload(allVideos.length + allPictures.length + allSurveys.length);
      controlConfirm.load();

      allVideos.forEach(v => {
        mediaUploadHelper(v, "video", createdID);
      });

      allPictures.forEach(p => {
        mediaUploadHelper(p, "picture", createdID);
      });

      allSurveys.forEach(s => {
        pendingUploads.push(
          axios.post(`/upload/survey/${createdID}`, s).then(() => {
            done++;
            setUploaded(done);
          })
        );
      });

      await Promise.all(pendingUploads);
      controlConfirm.finalize();
      await axios.post(`/upload/end/${createdID}`);
      toaster.success("Upload completed successfully! ");
      controlConfirm.close();
      history.push("/dashboard");
    } catch (e) {
      toaster.danger(`An error occured: ${e.message}`);
      controlConfirm.close();
    }
  }

  let uploadClassName = "primary-button disabled";

  if (
    currSession.picture.length === sessionData.pictures.length &&
    currSession.video.length === sessionData.videos.length &&
    currSession.survey.length === sessionData.surveys.length
  ) {
    uploadClassName = "primary-button";
  }

  let dialogScript = confDialState => {
    switch (confDialState.state) {
      case "waiting":
        return "Are you ready to upload ?";
      case "loading":
        return (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div>
              <Spinner marginX="10px" />
            </div>
            <div>
              <Text size={500}>{`${uploaed} uploaded. ${allToUpload -
                uploaed} remaining`}</Text>
            </div>
          </div>
        );
      case "preparing":
        return (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div>
              <Spinner marginX="10px" />
            </div>
            <div>
              <Text size={500}>Initializing the upload</Text>
            </div>
          </div>
        );
      case "finalizing":
        return (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div>
              <Spinner marginX="10px" />
            </div>
            <div>
              <Text size={500}>Finalizing the upload</Text>
            </div>
          </div>
        );
    }
  };

  function shortcutUploadHelper(type) {
    return event => {
      let files = type === "video" ? currSession.video : currSession.picture;
      let requiredNum =
        type === "video"
          ? sessionData.videos.length
          : sessionData.pictures.length;
      let update = type === "video" ? props.setVideo : props.setPicture;
      for (let f of event.target.files) {
        files.push(f);
      }

      files = files.slice(0, requiredNum);
      update(files);
    };
  }

  return (
    <div>
      <div id="upload-body-session">
        <Heading size={900} marginTop="40px">
          {sessionData.title}
          <Tooltip content={sessionData.desc} position={Position.RIGHT}>
            <Icon icon="info-sign" marginLeft="10px" />
          </Tooltip>
        </Heading>
      </div>
      <VideoSection
        sessionData={sessionData}
        video={currSession.video}
        setVideo={props.setVideo}
      />
      <PictureSection
        sessionData={sessionData}
        picture={currSession.picture}
        setPicture={props.setPicture}
      />
      <SurveySection
        sessionData={sessionData}
        survey={currSession.survey}
        viewSwitcher={props.viewSwitcher}
      />
      <div className="submit-button-group">
        <div className={uploadClassName} onClick={controlConfirm.open}>
          Upload
        </div>
        <div
          className="cancel-button"
          onClick={() => {
            setshowGiveUp(true);
          }}
        >
          Cancel
        </div>
      </div>
      <div id="shortcut-upload-panel">
        <input
          type="file"
          accept="video/*"
          name="shortcut-video-upload"
          id="shortcut-video-upload"
          className={`inputfile-hidden ${
            sessionData.videos.length === 0 ? "disabled" : ""
          }`}
          multiple="multiple"
          onChange={shortcutUploadHelper("video")}
        />
        <label
          className={`shortcut-upload-btn with-label ${
            sessionData.videos.length === 0 ? "disabled" : ""
          }`}
          htmlFor="shortcut-video-upload"
        >
          <Icon
            icon="video"
            className="shortcut-icon"
            marginRight="7px"
            marginBottom="2px"
          />
          Upload Video
        </label>
        <input
          type="file"
          accept="image/*"
          name="shortcut-picture-upload"
          id="shortcut-picture-upload"
          className={`inputfile-hidden ${
            sessionData.pictures.length === 0 ? "disabled" : ""
          }`}
          multiple="multiple"
          onChange={shortcutUploadHelper("picture")}
        />
        <label
          className={`shortcut-upload-btn with-label ${
            sessionData.pictures.length === 0 ? "disabled" : ""
          }`}
          htmlFor="shortcut-picture-upload"
        >
          <Icon
            icon="graph"
            className="shortcut-icon"
            marginRight="7px"
            marginBottom="2px"
          />
          Upload Picture
        </label>
        <button
          className="shortcut-upload-btn secondary"
          onClick={() => {
            setshowGiveUp(true);
          }}
        >
          Cancel
        </button>
      </div>

      <Dialog
        isShown={confDialState.isShown}
        isConfirmLoading={confDialState.state !== "waiting"}
        onCancel={close => {
          if (confDialState.state !== "waiting") {
            return;
          } else {
            close();
          }
        }}
        onConfirm={() => {
          sendSession();
        }}
        confirmLabel={
          confDialState.state === "waiting" ? "Upload" : "Uploading..."
        }
        onCloseComplete={controlConfirm.close}
        preventBodyScrolling
        shouldCloseOnEscapePress={confDialState.state === "waiting"}
        shouldCloseOnOverlayClick={confDialState.state === "waiting"}
        cancelLabel="Cancel"
        title="Upload Confirmation"
        intent="warning"
      >
        {dialogScript(confDialState)}
      </Dialog>

      <Dialog
        isShown={showGiveUp}
        onConfirm={() => {
          setshowGiveUp(false);
          history.push("/dashboard");
        }}
        confirmLabel="Quit"
        preventBodyScrolling
        cancelLabel="Cancel"
        onCloseComplete={() => setshowGiveUp(false)}
        title="Quit Confirmation"
        intent="warning"
      >
        Do you want to leave the assessment? All changes will not be saved.
      </Dialog>
    </div>
  );
}
