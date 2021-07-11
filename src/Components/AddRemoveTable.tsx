import React, { useState, useEffect, useContext } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  useGridSlotComponentProps,
} from "@material-ui/data-grid";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { Modal, Tabs } from "antd";

import firebase from "firebase/app";
import "firebase/firestore";

import "antd/dist/antd.css";
import { LocalConvenienceStoreOutlined } from "@material-ui/icons";
import { Theme, Typography } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/styles";

import clsx from "clsx";
import { lighten } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";

const columns = [
  {
    field: "email",
    headerName: "Email",
    width: 300,
    editable: false,
  },
  {
    field: "group",
    headerName: "Group",
    width: 200,
    editable: false,
  },
];

const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
      height: "60px",
    },
    highlight:
      theme.palette.type === "light"
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    title: {
      flex: "1 1 100%",
      marginLeft: "10px",
    },
  })
);

export const AddRemoveTable = ({
  rows,
  columns,
  setSelected,
  onClickAdd,
  onClickDelete,
}) => {
  const CustomToolbar = () => {
    const classes = useToolbarStyles();
    const { state } = useGridSlotComponentProps();
    const numSelected = Object.keys(state.selection).length;

    return (
      <GridToolbarContainer
        className={clsx(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        {numSelected > 0 ? (
          <Typography
            className={classes.title}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            className={classes.title}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Manage People
          </Typography>
        )}

        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="delete" onClick={onClickDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            color="primary"
            onClick={onClickAdd}
            style={{ width: "120px", marginRight: "10px" }}
          >
            Add People
          </Button>
        )}
      </GridToolbarContainer>
    );
  };

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSize={10}
      checkboxSelection
      onSelectionModelChange={(newSelection) => {
        setSelected(newSelection.selectionModel);
      }}
      components={{
        Toolbar: CustomToolbar,
      }}
    />
  );
};
