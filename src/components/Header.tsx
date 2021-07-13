import { Box, Breadcrumbs, Typography } from "@material-ui/core";
import React from "react";

const Header = ({ title, crumbs }) => {
  return (
    <div style={{ marginBottom: "50px" }}>
      <Typography gutterBottom variant="h5" component="h2">
        <Box fontWeight="bold">{title}</Box>
      </Typography>
      <Breadcrumbs aria-label="breadcrumb">
        {crumbs.map((crumb, i) => (
          <Typography
            style={{
              color: crumbs.length - 1 != i ? "grey" : "black",
              fontSize: "14px",
            }}
          >
            {crumb}
          </Typography>
        ))}
      </Breadcrumbs>
    </div>
  );
};

export default Header;
