import React from "react";
import { Spinner } from "evergreen-ui";

import "../css/Loading.scss";

export function Loading(props) {
  return (
    <div className="loading-container">
      {props.isLoading ? (
        <div className="loading">
          <Spinner marginX="auto" size={100} />
        </div>
      ) : (
        <div className="after-loading">{props.children}</div>
      )}
    </div>
  );
}
