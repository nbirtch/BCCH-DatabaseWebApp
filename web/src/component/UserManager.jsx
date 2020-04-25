import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import Cleave from "cleave.js/react";
import { Loading } from "./Loading";
import {
  toaster,
  Select,
  Heading,
  Table,
  Avatar,
  Menu,
  Popover,
  Position,
  Dialog,
  Paragraph,
  CornerDialog,
  TextInputField,
  Icon,
  IconButton
} from "evergreen-ui";
import axios from "axios";
import { useHistory } from "react-router-dom";

// import css
import "../css/UserManager.scss";

export function UserManager() {
  let [currentView, setView] = useState("all");
  let history = useHistory();

  function renderView() {
    switch (currentView) {
      case "all":
        return <AllUserPanel />;
      case "create":
        return <CreateUserPanel />;
    }
  }

  return (
    <div id="user-manager-container">
      <div id="user-manager-main">
        <Heading className="container-header" size={700} marginTop="20px">
          Manage User
        </Heading>
        <div className="mode-select">
          <Select onChange={event => setView(event.target.value)}>
            <option value="all" defaultValue>
              Show users
            </option>
            <option value="create">Create a user</option>
          </Select>
          <button
            className="manager-back-btn"
            onClick={() => {
              history.push("/dashboard");
            }}
          >
            Back
          </button>
          <div className="user-manager-main-content">{renderView()}</div>
        </div>
      </div>
    </div>
  );
}

function AllUserPanel() {
  const [userList, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterKey, setFilter] = useState("");
  const [showPage, setShow] = useState(false);
  const [desiredPage, setDesird] = useState(1);

  async function fetchUsers(newPage) {
    try {
      let result = await axios.get(`/user/all/${newPage}`);
      setList(result.data.users);
      setPage(result.data.currentPage);
    } catch (e) {
      toaster.danger(e.message);
    }
  }

  async function fetchCount() {
    try {
      let result = await axios.get(`/user/count`);
      setCount(Math.ceil(result.data.count / 50));
    } catch (e) {
      toaster.danger(e.message);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchUsers(page), fetchCount()]);
      setLoading(false);
    })();
  }, []);

  function prev() {
    if (page > 1) {
      fetchUsers(page - 1);
    }
  }

  function next() {
    if (page < count) {
      fetchUsers(page + 1);
    }
  }

  return (
    <Loading isLoading={loading}>
      <div className="user-panel-common">
        <div className="page-switcher">
          <div className="switch-btn-group">
            <Icon
              className="table-next-btn"
              icon="arrow-left"
              color="#f38020"
              marginRight="5px"
              onClick={prev}
            />
            <span className="switch-qlabel">
              Page{" "}
              <span className="go-to" onClick={() => setShow(true)}>
                {page}
              </span>{" "}
              of {count}
            </span>
            <Icon
              className="table-next-btn"
              icon="arrow-right"
              color="#f38020"
              marginLeft="5px"
              marginRight="5px"
              onClick={next}
            />
            <CornerDialog
              isShown={showPage}
              onConfirm={() => {
                if (
                  desiredPage > 0 &&
                  desiredPage <= count &&
                  desiredPage !== page
                ) {
                  fetchUsers(desiredPage).then(() => {
                    setShow(false);
                  });
                } else {
                  setDesird(1);
                  setShow(false);
                }
              }}
              confirmLabel="Go to"
              cancelLabel="Cancel"
              onCloseComplete={() => setShow(false)}
              title="Go to page"
              intent="warning"
            >
              <Cleave
                value={desiredPage}
                options={{
                  numeral: true,
                  numeralPositiveOnly: true,
                  numeralDecimalScale: 0
                }}
                onChange={e => {
                  setDesird(e.target.value);
                }}
              />
            </CornerDialog>
          </div>
        </div>
        <div className="user-table">
          <UserTableCommon
            resetURL={"/users/all/"}
            page={page}
            list={userList.filter(
              r =>
                filterKey.trim() === "" ||
                r.displayName.toLowerCase().startsWith(filterKey)
            )}
            filterKey={filterKey}
            setFilter={setFilter}
            listSetter={setList}
          />
        </div>
      </div>
    </Loading>
  );
}

function CreateUserPanel() {
  const history = useHistory();
  const [userName, setUserName] = useState("");
  const [isUnique, setIsUnique] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [password, setPass] = useState("");
  const [type, setType] = useState("user");
  const [gender, setGender] = useState("FEMALE");
  const [age, setAge] = useState(0);
  const [birthdate, setBirthdate] = useState(formatDate(new Date()));

  function createUser() {
    sendNameCheck().then(res => {
      if (res.valid) {
        axios
          .post("/user/add", {
            username: userName,
            displayName: displayName,
            password: password,
            gender: gender,
            age: age,
            type: type,
            birthdate: birthdate
          })
          .then(() => toaster.success(`successfully create user`))
          .catch(e => toaster.danger(e.response.data));
      }
    });
  }

  function formatDate(date) {
    let month = `${date.getMonth() + 1}`;
    let day = `${date.getDate()}`;
    let year = `${date.getFullYear()}`;

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return `${year}/${month}/${day}`;
  }

  function invalidUserName() {
    return !isUnique;
  }

  function sendNameCheck() {
    if (userName.trim() === "") {
      setIsUnique(false);
      return Promise.resolve({ valid: false });
    } else {
      return axios
        .get(`/user/check/${userName}`)
        .then(res => {
          setIsUnique(res.data.valid);
          return res.data;
        })
        .catch(e => toaster.danger(e.response.data));
    }
  }

  let createClassName = "primary-button";
  if (!isUnique || displayName.trim() === "" || password.trim() === "") {
    createClassName += " disabled";
  }

  return (
    <div className="user-panel-common create-panel">
      <TextInputField
        label="User Name"
        required
        isInvalid={invalidUserName()}
        inputWidth="30%"
        description="unique account name for login"
        validationMessage={
          invalidUserName()
            ? "Given user name is either empty or being used by others"
            : null
        }
        value={userName}
        marginBottom={8}
        onChange={e => setUserName(e.target.value)}
      />
      <div className="check-unique-btn">
        <button onClick={() => sendNameCheck()}>check</button>
        <Icon
          icon="tick-circle"
          color="success"
          marginLeft={8}
          style={{ visibility: invalidUserName() ? "hidden" : "visible" }}
        />
      </div>
      <TextInputField
        label="Display Name"
        required
        inputWidth="30%"
        description="Name shown on the user dashboard"
        value={displayName}
        marginBottom={16}
        onChange={e => setDisplayName(e.target.value)}
      />
      <TextInputField
        label="Password"
        required
        inputWidth="30%"
        value={password}
        marginBottom={16}
        onChange={e => setPass(e.target.value)}
      />
      <TextInputField
        label="Age"
        inputWidth="10%"
        value={age}
        marginBottom={16}
        onChange={e => {
          let ageInput = e.target.value;
          if (ageInput.trim() === "") {
            setAge(0);
          } else {
            let testRes = /^\d+$/.test(ageInput);
            if (testRes) {
              setAge(parseInt(ageInput));
            }
          }
        }}
      />
      <div className="section-common">
        <label className="section-label">Date of Birth</label>
        <DatePicker
          className="dob-section-picker"
          selected={new Date(birthdate)}
          onChange={d => {
            if (d) {
              setBirthdate(formatDate(d));
            }
          }}
          dateFormat="yyyy/MM/dd"
        />
      </div>
      <div className="section-common">
        <label className="section-label">Gender</label>
        <Select onChange={e => setGender(e.target.value)}>
          <option value="FEMALE" defaultValue>
            FEMALE
          </option>
          <option value="MALE">MALE</option>
        </Select>
      </div>
      <div className="section-common">
        <label className="section-label">User Type</label>
        <Select onChange={e => setType(e.target.value)}>
          <option value="user" defaultValue>
            Normal User
          </option>
          <option value="admin">Admin User</option>
        </Select>
      </div>
      <div className="submit-button-group">
        <button className={createClassName} onClick={createUser}>
          Save
        </button>
        <button
          className="cancel-button"
          onClick={() => {
            history.push("/dashboard");
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

function UserTableCommon(props) {
  const [deleteInfo, setInfo] = useState(false);

  function deleteUserHandler(id, name) {
    return () => {
      setInfo({ id, name });
    };
  }

  function deleteUser() {
    let deleteID = deleteInfo.id;
    axios
      .delete(`/user/${deleteID}`)
      .then(res => {
        props.listSetter(props.list.filter(r => r.id !== deleteID));
        setInfo(false);
        toaster.success(`successfully deleted user with id ${res.data.id}`);
      })
      .catch(e => {
        toaster.danger(e.response.data);
      });
  }

  function buildUserTable() {
    return props.list.map((r, idx) => {
      return (
        <Table.Row key={`${r.id}-${idx}`} isSelectable>
          <Table.TextCell>{r.id}</Table.TextCell>
          <Table.TextCell>{r.username}</Table.TextCell>
          <Table.Cell flexBasis={115}>
            <Avatar name={r.displayName} />
            <span className="table-display-name-font">{r.displayName}</span>
          </Table.Cell>
          <Table.TextCell>{r.age}</Table.TextCell>
          <Table.TextCell>{r.gender}</Table.TextCell>
          <Table.TextCell>{r.birthdate}</Table.TextCell>
          <Table.Cell>
            <span className="table-type-name-font">{r.type.toUpperCase()}</span>
            <Popover
              content={() => {
                return (
                  <Menu>
                    <Menu.Group>
                      <Menu.Item
                        intent="danger"
                        onSelect={deleteUserHandler(r.id, r.username)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Group>
                  </Menu>
                );
              }}
              position={Position.BOTTOM_RIGHT}
            >
              <IconButton icon="more" height={24} appearance="minimal" />
            </Popover>
          </Table.Cell>
        </Table.Row>
      );
    });
  }

  return (
    <div>
      <Table>
        <Table>
          <Table.Head>
            <Table.TextHeaderCell>ID</Table.TextHeaderCell>
            <Table.TextHeaderCell>User Name</Table.TextHeaderCell>
            <Table.SearchHeaderCell
              onChange={s => {
                props.setFilter(s.toLowerCase());
              }}
              value={props.filterKey}
            />
            <Table.TextHeaderCell>Age</Table.TextHeaderCell>
            <Table.TextHeaderCell>Gender</Table.TextHeaderCell>
            <Table.TextHeaderCell>Birthday</Table.TextHeaderCell>
            <Table.TextHeaderCell>Role</Table.TextHeaderCell>
          </Table.Head>
          <Table.VirtualBody height={360}>{buildUserTable()}</Table.VirtualBody>
        </Table>
      </Table>
      <Dialog
        isShown={deleteInfo !== false}
        onConfirm={deleteUser}
        confirmLabel="Delete"
        preventBodyScrolling
        cancelLabel="Cancel"
        onCloseComplete={() => setInfo(false)}
        title="Delete Confirmation"
        intent="warning"
      >
        <Paragraph marginTop="default">
          Do you want to delete user {deleteInfo.name}? All data associated with
          this user will be deleted.
        </Paragraph>
      </Dialog>
    </div>
  );
}
