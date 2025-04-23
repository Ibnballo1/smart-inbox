import React from "react";
import Mail from "./mail";

const MailDashboard = () => {
  return (
    <Mail
      defaultLayout={[20, 32, 48]} // Default layout sizes for the panels
      navCollapseSize={40} // Size when the navigation is collapsed
      defaultCollapsed={false} // Initial state of the navigation panel (collapsed or not)
    />
  );
};

export default MailDashboard;
