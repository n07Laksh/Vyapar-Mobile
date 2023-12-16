import React from "react";
import Balance from "./Balance";
import Service from "./Service";
import Navbar from "./Navbar";
import Slideshow from "./Slideshow";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
const Home = () => {
  return (
    <>
      <div className="main">
        <Navbar />
        <Slideshow />

        <Box>
          <Paper
            sx={{
              boxShadow: "0px 0.5px 170px rgba(81, 114, 127, 0.94)",
              position: "relative",
              borderRadius: "30px 30px 0 0",
            }}
            elevation={2}
          >
            <div className="serve-contain">
              <Balance />
              <Service />
            </div>
          </Paper>
        </Box>
      </div>
    </>
  );
};
export default Home;
