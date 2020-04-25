import React, { useState, useEffect } from "react";
import { toaster, Icon, Dialog, SearchInput } from "evergreen-ui";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Loading } from "./Loading";

import "../css/AssessmentArchiver.scss";

function SessionMenu(props) {
  const [allSessions, setAllSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let [searchKey, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        let res = await axios.get("/assessment/all");
        setAllSessions(res.data);
        setIsLoading(false);
      } catch (e) {
        toaster.danger(e.message);
      }
    })();
  }, []);

  let sessionLinks = allSessions
    .sort((s1, s2) => {
      if (s1.title < s2.title) {
        return -1;
      } else if (s1.title > s2.title) {
        return 1;
      } else {
        return 0;
      }
    })
    .filter(s => {
      let key = searchKey.trim();
      if (key === "") {
        return true;
      } else {
        return s.title.toLowerCase().startsWith(key);
      }
    })
    .map(s => {
      return (
        <div
          className="session-link-container"
          key={`session-link-${s.id}`}
          title={s.title}
        >
          <div
            className="session-link"
            onClick={() => {
              props.selectAssessment(s.id, s.title);
            }}
          >
            <Icon icon="caret-right"></Icon>
            {s.title}
          </div>
        </div>
      );
    });

  let history = useHistory();

  return (
    <Loading isLoading={isLoading}>
      <div className="session-menu-container">
        <div className="session-menu-title">
          Select an assessment to archive
        </div>
        <div className="filter-session-section">
          <SearchInput
            marginLeft="auto"
            marginRight="auto"
            onChange={e => setSearch(e.target.value)}
            value={searchKey}
          />
        </div>
        <div className="session-item-container">{sessionLinks}</div>
        <div
          className="negative-button"
          onClick={() => {
            history.push("/manageAssessment");
          }}
        >
          Back
        </div>
      </div>
    </Loading>
  );
}

export function AssessmentArchiver(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");

  let history = useHistory();

  function selectAssessment(id, title) {
    setId(id);
    setTitle(title);
    setIsShown(true);
  }

  async function archiveAssessment() {
    setIsLoading(true);

    try {
      let res = await axios.delete(`/assessment/${id}`);
      toaster.success(`Archived assessment ${title}`);
      history.push("/manageAssessment");
    } catch (e) {
      toaster.danger(e.message);
    }
  }

  return (
    <div id="assessment-archiver-container">
      <SessionMenu {...props} selectAssessment={selectAssessment} />
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
        onConfirm={archiveAssessment}
        confirmLabel={isLoading ? "Archiving..." : "Archive"}
        onCloseComplete={() => {
          setIsLoading(false);
          setIsShown(false);
        }}
        preventBodyScrolling={false}
        shouldCloseOnEscapePress={!isLoading}
        shouldCloseOnOverlayClick={!isLoading}
        cancelLabel="Cancel"
        title="Archive Confirmation"
        intent="warning"
      >
        {`Are you sure to archive ${title}?`}
      </Dialog>
    </div>
  );
}
