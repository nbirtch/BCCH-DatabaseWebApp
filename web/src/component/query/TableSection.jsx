import React from "react";
import { toaster, Icon, Table } from "evergreen-ui";
import axios from "axios";

// import css
import "../../css/QueryData.scss";

export function TableSection(props) {
  let sentQuery = props.sentQuery;
  let result = props.result;
  let render = props.render;
  let setExecuting = props.setExecuting;
  let setSentQuery = props.setSentQuery;
  let setResult = props.setResult;

  function download(path) {
    return () => {
      // TODO
    };
  }

  function buildPageSwitcher() {
    async function anotherPage() {
      try {
        setExecuting(true);
        let res = await axios.post(`/query/${render}`, sentQuery);
        let table = res.data;
        setSentQuery(sentQuery);
        setResult(table);
        setExecuting(false);
      } catch (e) {
        toaster.danger(e.message);
        setExecuting(false);
      }
    }

    function exportCSV() {
      let csv;
      let fileName;
      if (sentQuery.GROUP_BY === "none") {
        switch (render) {
          case "media":
            csv = "path,date\n";
            fileName = `media_result_page_${result.current}`;
            result.data.none.forEach(r => {
              csv += [r.path, new Date(r.date).toString()].join(",");
              csv += "\n";
            });
            break;
          case "survey":
            csv = "question number,answer\n";
            fileName = `survey_result_page_${result.current}`;
            result.data.none.forEach(r => {
              csv += [r.number, r.answer].join(",");
              csv += "\n";
            });
            break;
        }
      } else {
        switch (render) {
          case "media":
            csv = `${sentQuery.GROUP_BY},path,date\n`;
            fileName = `media_result_page_${result.current}`;
            Object.keys(result.data).map(k => {
              let row = result.data[k];
              row.forEach(r => {
                csv += [k, r.path, new Date(r.date).toString()].join(",");
                csv += "\n";
              });
            });
            break;
          case "survey":
            if (sentQuery.GROUP_BY === "question_number") {
              csv = `question number,answer\n`;
              fileName = `survey_result_page_${result.current}`;
              Object.keys(result.data).map(k => {
                let row = result.data[k];
                row.forEach(r => {
                  csv += [k, r.answer].join(",");
                  csv += "\n";
                });
              });
            } else {
              csv = `${sentQuery.GROUP_BY},question number,answer\n`;
              fileName = `survey_result_page_${result.current}`;
              Object.keys(result.data).map(k => {
                let row = result.data[k];
                row.forEach(r => {
                  csv += [k, r.number, r.answer].join(",");
                  csv += "\n";
                });
              });
            }
            break;
        }
      }

      // download logic, create a "fake" download button and "click" it, which is a bit hacky loool
      let tempElem = document.createElement("a");
      tempElem.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
      tempElem.target = "_blank";
      tempElem.download = fileName + ".csv";
      tempElem.click();
    }

    function next() {
      if (result.current >= result.total) {
        return;
      }

      sentQuery.PAGE = result.current + 1;
      anotherPage();
    }

    function prev() {
      if (result.current <= 1) {
        return;
      }

      sentQuery.PAGE = result.current - 1;
      anotherPage();
    }

    return (
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
            Page {result.current} of {result.total}
          </span>
          <Icon
            className="table-next-btn"
            icon="arrow-right"
            color="#f38020"
            marginLeft="5px"
            marginRight="5px"
            onClick={next}
          />
        </div>
        <div className="export-btn-grop">
          <button onClick={exportCSV}>Export</button>
        </div>
      </div>
    );
  }

  function buildTableCore(data) {
    if (sentQuery.GROUP_BY === "none") {
      switch (render) {
        case "media":
          return data.none.map((r, idx) => {
            return (
              <Table.Row
                key={`${r.path}-${idx}`}
                isSelectable
                onSelect={download(r.path)}
              >
                <Table.TextCell>
                  <Icon
                    icon={sentQuery.TYPE === "video" ? "video" : "graph"}
                    color="#f38020"
                    marginRight="5px"
                  />
                  <a href={`/file?uri=${r.path}`}>{r.path}</a>
                </Table.TextCell>
                <Table.TextCell>{new Date(r.date).toString()}</Table.TextCell>
              </Table.Row>
            );
          });
        case "survey":
          return data.none.map((r, idx) => {
            return (
              <Table.Row key={`${r.number}-${idx}`}>
                <Table.TextCell>{r.number}</Table.TextCell>
                <Table.TextCell>{r.answer}</Table.TextCell>
              </Table.Row>
            );
          });
      }
    } else {
      switch (render) {
        case "media":
          return Object.keys(data).map(k => {
            let rows = data[k];
            return rows.map((r, idx) => {
              return (
                <Table.Row
                  key={`${k}-${r.path}-${idx}`}
                  isSelectable
                  onSelect={download(r.path)}
                >
                  <Table.TextCell>{k}</Table.TextCell>
                  <Table.TextCell>
                    <Icon
                      icon={sentQuery.TYPE === "video" ? "video" : "graph"}
                      color="#f38020"
                      marginRight="5px"
                    />
                    <a href={`/file?uri=${r.path}`}>{r.path}</a>
                  </Table.TextCell>
                  <Table.TextCell>{new Date(r.date).toString()}</Table.TextCell>
                </Table.Row>
              );
            });
          });
        case "survey":
          if (sentQuery.GROUP_BY === "question_number") {
            return Object.keys(data).map(k => {
              let rows = data[k];
              return rows.map((r, idx) => {
                return (
                  <Table.Row key={`${k}-${r.number}-${idx}`}>
                    <Table.TextCell>{k}</Table.TextCell>
                    <Table.TextCell>{r.answer}</Table.TextCell>
                  </Table.Row>
                );
              });
            });
          } else {
            return Object.keys(data).map(k => {
              let rows = data[k];
              return rows.map((r, idx) => {
                return (
                  <Table.Row key={`${k}-${r.number}-${idx}`}>
                    <Table.TextCell>{k}</Table.TextCell>
                    <Table.TextCell>{r.number}</Table.TextCell>
                    <Table.TextCell>{r.answer}</Table.TextCell>
                  </Table.Row>
                );
              });
            });
          }
      }
    }
  }

  function headerList() {
    if (sentQuery.GROUP_BY === "none") {
      switch (render) {
        case "media":
          return ["path", "date"];
        case "survey":
          return ["question number", "answer"];
      }
    } else {
      switch (render) {
        case "media":
          return [sentQuery.GROUP_BY, "path", "date"];
        case "survey":
          if (sentQuery.GROUP_BY === "question_number") {
            return ["question number", "answer"];
          } else {
            return [sentQuery.GROUP_BY, "question number", "answer"];
          }
      }
    }
  }

  return (
    <div id="table-panel">
      {buildPageSwitcher()}
      <div className="table-conatiner">
        <Table>
          <Table>
            <Table.Head>
              {headerList().map(c => {
                return (
                  <Table.TextHeaderCell key={`table-head-${c}`}>
                    {c}
                  </Table.TextHeaderCell>
                );
              })}
            </Table.Head>
            <Table.Body height={240}>{buildTableCore(result.data)}</Table.Body>
          </Table>
        </Table>
      </div>
    </div>
  );
}
