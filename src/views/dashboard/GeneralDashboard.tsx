import Header from "components/Header";
import React from "react";

const GeneralDashboard = (props) => {
  React.useEffect(() => {}, []);
  return (
    <div>
      <Header title="Dashboard" crumbs={["Dashboard"]} />
    </div>
  );
};

export default GeneralDashboard;
