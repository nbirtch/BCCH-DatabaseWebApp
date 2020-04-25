import React, { useState, useEffect } from "react";
import { Loading } from "../Loading.jsx";
import { useParams } from "react-router-dom";
import { PortalViewControl } from "./PortalViewControl";
import { toaster } from "evergreen-ui";
import axios from "axios";

import "../../css/Upload.scss";

export function Upload() {
  const { type } = useParams();

  const [isLoading, setLoading] = useState(true);
  const [sessionData, setData] = useState({
    title: "",
    id: "",
    desc: "",
    pictures: [],
    videos: [],
    surveys: []
  });

  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    try {
      let res = await axios.get(`/assessment/${type}`);
      setData(res.data);
      setLoading(false);
    } catch (e) {
      toaster.danger(e.message);
    }
  }

  return (
    <div id="upload-container">
      <div id="upload-body-section">
        <div id="upload-body-main">
          <Loading isLoading={isLoading}>
            <PortalViewControl data={sessionData} sessionType={type} />
          </Loading>
        </div>
      </div>
    </div>
  );
}
