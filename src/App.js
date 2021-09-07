import React, { useState, useEffect } from "react";
import "./App.css";
import MaterialTable, { MTableToolbar } from "material-table";
import XLSX from "xlsx";
import {
  MuiThemeProvider,
  createMuiTheme,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  Divider,
} from "@material-ui/core";

const List = [];

function App() {
  const [preferDarkMode, setPreferDarkMode] = useState(false);

  const theme = createMuiTheme({
    palette: {
      type: preferDarkMode ? "dark" : "light",
    },
  });

  const [data, setData] = useState();
  const [colDefs, setColDefs] = useState();

  const Extension = ["xlsx", "csv", "xls"];
  const getExtension = (file) => {
    const parts = file.name.split(".");
    const extension = parts[parts.length - 1];
    return Extension.includes(extension);
  };

  const convertToJson = (headers, data) => {
    const rows = [];
    data.forEach((row) => {
      let rowData = {};
      row.forEach((element, index) => {
        rowData[headers[index]] = element;
      });
      rows.push(rowData);
    });
    return rows;
  };
  const importExcel = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const workBook = XLSX.read(bstr, { type: "binary" });

      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];

      const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });

      const headers = fileData[0];
      const heads = headers.map((head) => ({ title: head, field: head }));
      setColDefs(heads);

      fileData.splice(0, 1);
      setData(convertToJson(headers, fileData));
    };
    if (file) {
      if (getExtension(file)) {
        reader.readAsBinaryString(file);
      } else {
        alert("Invalid file type. Please import .csv or .xlsx");
      }
    } else {
      setData([]);
      setColDefs([]);
    }
  };
  return (
    <div className="App">
      <h1 align="center">Doperator</h1>
      <h4 align="center">Data Table</h4>
      <div align="right"></div>
      <input Type="file" onChange={importExcel} />

      <MuiThemeProvider theme={theme}>
        <MaterialTable
          title="Data"
          data={data}
          columns={colDefs}
          components={{
            Toolbar: (props) => (
              <div>
                <MTableToolbar {...props} />
                <Grid align="right" style={{ padding: 15 }}>
                  <Typography variant="subtitle2">
                    Number of Rows :{props.data.length}
                  </Typography>
                </Grid>
                <Divider />
              </div>
            ),
          }}
          actions={[
            {
              icon: () => (
                <FormControlLabel
                  value="top"
                  control={<Switch color="primary" checked={preferDarkMode} />}
                  label="Dark Mode"
                  onChange={() => setPreferDarkMode(!preferDarkMode)}
                  labelPlacement="start"
                />
              ),
              tooltip: "Toggle Dark or light theme",
              isFreeAction: true,
            },
          ]}
          editable={{
            onRowAdd: (newRow) =>
              new Promise((resolve, reject) => {
                const updatedRows = [...data, { ...newRow }];
                setTimeout(() => {
                  setData(updatedRows);
                  resolve();
                }, 2000);
              }),
            onRowDelete: (selectedRow) =>
              new Promise((resolve, reject) => {
                const index = selectedRow.tableData.id;
                const updatedRows = [...data];
                updatedRows.splice(index, 1);
                setTimeout(() => {
                  setData(updatedRows);
                  resolve();
                }, 2000);
              }),
            onRowUpdate: (newRow, oldRow) =>
              new Promise((resolve, reject) => {
                const index = oldRow.tableData.id;
                const updatedRows = [...data];
                updatedRows[index] = newRow;
                setTimeout(() => {
                  setData(updatedRows);
                  resolve();
                }, 2000);
              }),
          }}
          options={{
            actionsColumnIndex: -1,
            addRowPosition: "first",
          }}
        />
      </MuiThemeProvider>
    </div>
  );
}

export default App;
