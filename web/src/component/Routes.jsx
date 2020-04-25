import React, { useState } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// import components
import { Login } from "./Login";
import { Dashboard } from "./Dashboard";
import { Upload } from "./upload_component/Upload";
import { AssessmentCreator } from "./AssessmentCreator";
import { AssessmentManager } from "./AssessmentManager";
import { AssessmentArchiver } from "./AssessmentArchiver";
import { SurveyCreator } from "./SurveyCreator";
import { QueryData } from "./query/QueryData";
import { UserManager } from "./UserManager";

export function Routes(props) {
  return (
    <Switch>
      <Route path="/login">
        <LoginRoute {...props} />
      </Route>
      <ProtectedRoutes {...props} />
    </Switch>
  );
}

function LoginRoute(props) {
  if (props.isLoggedIn) {
    return <Redirect to="/dashboard" />;
  }

  return <Login setCookie={props.setCookie} login={props.login} />;
}

function ProtectedRoutes(props) {
  if (!props.isLoggedIn) {
    props.logout();
    return <Redirect to="/login" />;
  }

  return (
    <Switch>
      <Route path="/dashboard">
        <Dashboard
          userInfo={props.userInfo}
          removeCookie={props.removeCookie}
          setUserInfo={props.setUserInfo}
          logout={props.logout}
        />
      </Route>
      <PermittedRoutes {...props} />
    </Switch>
  );
}

function PermittedRoutes(props) {
  const userType = props.userInfo.type;

  switch (userType) {
    case "user":
      return <UserRoutes />;
    case "admin":
      return <AdminRoutes {...props} />;
    default:
      props.logout();
      return <Redirect to="/login" />;
  }
}

function UserRoutes() {
  return (
    <Switch>
      <Route path="/upload/:type">
        <Upload />
      </Route>
      <UndefinedRoute />
    </Switch>
  );
}

function AdminRoutes(props) {
  return (
    <Switch>
      <Route path="/query">
        <QueryData />
      </Route>
      <Route path="/createAssessment">
        <AssessmentCreator />
      </Route>
      <Route path="/manageAssessment">
        <AssessmentManager {...props} />
      </Route>
      <Route path="/manageUser">
        <UserManager {...props} />
      </Route>
      <Route path="/archiveAssessment">
        <AssessmentArchiver />
      </Route>
      <Route path="/createSurvey">
        <SurveyCreator />
      </Route>
      <UndefinedRoute />
    </Switch>
  );
}

function UndefinedRoute() {
  return (
    <Route path="/">
      <Redirect to="/dashboard" />
    </Route>
  );
}
