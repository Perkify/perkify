import Header from "components/Header";
import React from "react";

const GeneralDashboard = (props) => {

  React.useEffect(() => {
    props.startLoading()
    props.doneLoading()
  }, []);
  return (
    <div>
      <Header title="Dashboard" crumbs={["Dashboard"]} />
    </div>
  );
};

export default GeneralDashboard;
