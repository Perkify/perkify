import { Box, Breadcrumbs, Button, Theme, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { createStyles, makeStyles } from "@material-ui/styles";
import React from "react";

interface HeaderProps {
  title: string;
  crumbs?: string[];
  button?: {
    type: "delete" | "add";
    onClick: Function;
  };
}

const useHeaderStyles = makeStyles((theme: Theme) =>
  createStyles({
    deleteButton: {
      marginLeft: "auto",
      height: "50px",
      width: "150px",
      display: "flex",
      justifyContent: "space-evenly",
      backgroundColor: theme.palette.secondary.light,
    },
  })
);

const Header = (props: HeaderProps) => {
  const classes = useHeaderStyles();
  return (
    <div
      style={{ marginBottom: "50px", display: "flex", alignItems: "center" }}
    >
      <div>
        <Typography gutterBottom variant="h5" component="h2">
          <Box fontWeight="bold">{props.title}</Box>
        </Typography>
        {props.crumbs && (
          <Breadcrumbs aria-label="breadcrumb">
            {props.crumbs.map((crumb, i) => (
              <Typography
                style={{
                  color: props.crumbs.length - 1 != i ? "grey" : "black",
                  fontSize: "14px",
                }}
              >
                {crumb}
              </Typography>
            ))}
          </Breadcrumbs>
        )}
      </div>
      {props.button &&
        (props.button.type == "delete" ? (
          <Button
            className={classes.deleteButton}
            variant="contained"
            onClick={() => {
              props.button.onClick();
            }}
          >
            <DeleteIcon />
            Delete
          </Button>
        ) : (
          <div>Other buttons</div>
        ))}
    </div>
  );
};

export default Header;
