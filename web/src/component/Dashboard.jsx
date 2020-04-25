import React from "react";

import { DashboardUser } from "./DashboardUser";
import { DashboardAdmin } from "./DashboardAdmin";

import { Redirect } from "react-router-dom";

export function Dashboard(props) {
  const userType = props.userInfo.type;
  switch (userType) {
    case "user":
      return <DashboardUser {...props} />;
    case "admin":
      return <DashboardAdmin {...props} />;
    default:
      props.logout();
      return <Redirect to="/login" />;
  }
}
