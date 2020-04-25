import React, { useState } from "react";
import { Loading } from "../Loading";
import {
  toaster,
  Heading,
  Icon,
  Table,
  Paragraph,
  Dialog,
  Textarea
} from "evergreen-ui";
import axios from "axios";

// import css
import "../../css/QueryData.scss";

function PlainTableSection(props) {
  let result = props.result;
  let schema = result.length === 0 ? [] : Object.keys(result[0]).sort();

  function buildTableHeader(schema) {
    if (schema.length === 0) {
      return [<Table.TextHeaderCell>No Content</Table.TextHeaderCell>];
    } else {
      return schema.map(k => {
        return (
          <Table.TextHeaderCell key={`plain-query-header-${k}`}>
            {k}
          </Table.TextHeaderCell>
        );
      });
    }
  }

  function buildTableEntries(schema) {
    if (schema.length === 0) {
      return [
        <Table.Row>
          <Table.TextCell>No Content</Table.TextCell>
        </Table.Row>
      ];
    } else {
      return result.map((row, idx) => {
        return (
          <Table.Row key={idx}>
            {schema.map(k => {
              return (
                <Table.TextCell key={`table-cell-${idx}-${k}`}>
                  <span title={row[k]}>{row[k]}</span>
                </Table.TextCell>
              );
            })}
          </Table.Row>
        );
      });
    }
  }

  function exportPlainCsv() {
    let csv;
    if (schema.length === 0) {
      csv = "\n";
    } else {
      csv = schema.join(",") + "\n";
      result.forEach(row => {
        csv += schema.map(k => row[k]).join(",");
        csv += "\n";
      });
    }

    // download logic, create a "fake" download button and "click" it, which is a bit hacky loool
    let tempElem = document.createElement("a");
    tempElem.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    tempElem.target = "_blank";
    tempElem.download = "plain_query_result.csv";
    tempElem.click();
  }

  return (
    <div className="plain-table-section">
      <div className="export-btn-group">
        <button className="export-plain-btn" onClick={exportPlainCsv}>
          Export
        </button>
      </div>
      <Table>
        <Table>
          <Table.Head>{buildTableHeader(schema)}</Table.Head>
          <Table.Body height={240}>{buildTableEntries(schema)}</Table.Body>
        </Table>
      </Table>
    </div>
  );
}

export function PlainQuery() {
  const [warning, setWarning] = useState(true);
  const [query, setQuery] = useState("");
  const [executing, setExecuting] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [result, setResult] = useState({});

  async function sendQuery() {
    setExecuting(true);
    setShowTable(true);

    try {
      let res = await axios.post("/query/plain", { query });
      let table = res.data;
      setResult(table);
      setExecuting(false);
    } catch (e) {
      toaster.danger(`${e.message}: ${e.response.data}`);
      setShowTable(false);
      setExecuting(false);
    }
  }

  return (
    <div id="plain-query-container">
      <Heading className="container-header" size={700} marginTop="20px">
        Plain Query
      </Heading>
      <div id="plain-query-body-section">
        <div className="qlabel">input a SQL query</div>
        <Textarea
          id="sql-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="execute-btn-group">
          <button className="execute-btn" onClick={() => sendQuery()}>
            Execute
          </button>
        </div>
        <div
          id="plain-result-table"
          style={{ display: showTable ? "block" : "none" }}
        >
          <Loading isLoading={executing || !showTable}>
            <PlainTableSection result={result} />
          </Loading>
        </div>
      </div>

      <Dialog
        isShown={warning}
        onConfirm={() => setWarning(false)}
        confirmLabel="Agree"
        hasClose={false}
        hasCancel={false}
        preventBodyScrolling
        shouldCloseOnEscapePress={false}
        shouldCloseOnOverlayClick={false}
        title="Warning"
        intent="warning"
      >
        <div id="plain-query-warning-dialog">
          <Paragraph marginTop="default">
            This query section has full access to the database. An abuse of SQL
            query might result in unrecoverable errors including:
          </Paragraph>
          <ul>
            <li className="risk-format">Application crash</li>
            <li className="risk-format">Patient data leakage </li>
            <li className="risk-format">
              Loss of data or damage to the integrity
            </li>
          </ul>
          <Paragraph marginTop="default">
            By clicking the Agree button below, the user understands the risk
            and agrees to proceed.
          </Paragraph>
        </div>
      </Dialog>
    </div>
  );
}
