import React, { useState } from "react";
import { Menu, Popover, Position, Avatar, toaster } from "evergreen-ui";
import { useHistory } from "react-router-dom";

// import css
import "../css/Header.scss";

function DropDownMenu(props) {
  const history = useHistory();

  function handleLogOut() {
    props.logout();
    props.removeCookie("access_token");
    history.push("/login");
  }

  return (
    <Popover
      position={Position.BOTTOM_LEFT}
      content={
        <Menu>
          <Menu.Group>
            <Menu.Item onSelect={() => handleLogOut()}>Log out</Menu.Item>
          </Menu.Group>
        </Menu>
      }
    >
      <Avatar
        name={props.userInfo.displayName}
        className="header-drop-down"
        size={50}
      />
    </Popover>
  );
}

export function Header(props) {
  return (
    <div id="header">
      <div className="real-header-group">
        <div id="logo">
          <img src={"/assets/images/bcch_logo.png"} height={"100px"} />
        </div>
        <div id="user-buttons-group">
          <div className="button-group">
            {props.isLoggedIn && <DropDownMenu {...props} />}
          </div>
        </div>
      </div>
    </div>
  );
}
