import { Box, Breadcrumbs, Typography } from "@material-ui/core";
import React from "react";

interface HeaderProps {
  title: string;
  crumbs?: string[];
}

const Header = (props: HeaderProps) => {
  return (
    <div style={{ marginBottom: "50px" }}>
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
  );
};

export default Header;
