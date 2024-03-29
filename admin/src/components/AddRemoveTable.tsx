import { Card, Theme, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { lighten } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import {
  DataGrid,
  GridColumns,
  GridRowsProp,
  GridSelectionModel,
  GridToolbarContainer,
  useGridSlotComponentProps,
} from '@material-ui/data-grid';
import DeleteIcon from '@material-ui/icons/Delete';
import { createStyles, makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import React from 'react';

const columns = [
  {
    field: 'email',
    headerName: 'Email',
    width: 300,
    editable: false,
  },
  {
    field: 'perkGroupName',
    headerName: 'Perk Group',
    width: 200,
    editable: false,
  },
];

const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
      height: '60px',
    },
    highlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    title: {
      flex: '1 1 auto',
      marginLeft: '10px',
    },
  })
);

const useDataGridStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      border: 'none',
      // padding: "10px 20px",
    },
  })
);

interface AddRemoveTableProps {
  rows: GridRowsProp;
  columns: GridColumns;
  selectedRows: GridSelectionModel;
  setSelectedRows: (model: GridSelectionModel) => void;
  onClickAdd: () => void;
  onClickDelete: () => void;
  tableName: string;
  addButtonText: string;
  height: number;
  loading?: boolean;
  addButtonHidden?: boolean;
}

export const AddRemoveTable = ({
  rows,
  columns,
  selectedRows,
  setSelectedRows,
  onClickAdd,
  onClickDelete,
  tableName,
  addButtonText,
  height,
  ...rest
}: AddRemoveTableProps) => {
  const dataGridClasses = useDataGridStyles();

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
            {tableName}
          </Typography>
        )}

        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="delete" onClick={onClickDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : rest.addButtonHidden ? (
          <div></div>
        ) : (
          <Button
            color="primary"
            onClick={onClickAdd}
            style={{ marginRight: '10px' }}
          >
            {addButtonText}
          </Button>
        )}
      </GridToolbarContainer>
    );
  };

  return (
    <Card style={{ height, border: 0 }} elevation={4}>
      <DataGrid
        classes={{
          root: dataGridClasses.root,
        }}
        rows={rows}
        columns={columns}
        pageSize={10}
        rowHeight={60}
        headerHeight={60}
        checkboxSelection
        selectionModel={selectedRows}
        onSelectionModelChange={(selectionModel) => {
          setSelectedRows(selectionModel);
        }}
        components={{
          Toolbar: CustomToolbar,
        }}
        loading={rest.loading && rest.loading == true ? true : false}
      />
    </Card>
  );
};
