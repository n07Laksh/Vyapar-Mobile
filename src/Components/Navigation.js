import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Keyboard } from '@capacitor/keyboard';

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function Dashboard() {
  const navigate = useNavigate();
  const navref = useRef(null);

  useEffect(() => {
    const handleKeyboardVisibility = () => {
      if (navref.current) {
        Keyboard.addListener('keyboardDidShow', info => {
          console.log('keyboard did show with height:', info.keyboardHeight);
          navref.current.style.display = "none";
        });
        
        Keyboard.addListener('keyboardDidHide', () => {
          console.log('keyboard did hide');
          navref.current.style.display = "block";
        });
      }
    };

    handleKeyboardVisibility();

    return () => {
      Keyboard.removeAllListeners(); // Clean up event listeners
    };
  }, []);

  const currentURL = window.location.href;
  const segments = currentURL.split("/");
  // Get the last segment after splitting by '/'
  const route = segments[segments.length - 1];

  const [value, setValue] = React.useState("home");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const ChangeRoute = (route) => {
    navigate(`/${route}`);
  };

  useEffect(() => {
    if (route) {
      setValue(route);
    } else {
      setValue("home");
    }
  }, [route]);



  return (
    <>
      <div className="bottom-navigation" ref={navref}>
        <BottomNavigation
          sx={{
            // width: "100%",
            // position: "sticky",
            // bottom: 0,
            // left: 0,
            color: "white",
            background: "var(--primary-bg)",
          }}
          value={value}
          onChange={handleChange}
        >
          <BottomNavigationAction
            label="Home"
            value="home"
            icon={<HomeIcon sx={{fontSize:"25px"}} />}
            onClick={() => ChangeRoute("")}
            sx={{ color: "white" }}
          />
          <BottomNavigationAction
            label="Sale"
            value="saleinvoice"
            icon={<LocalMallIcon sx={{fontSize:"25px"}} />}
            onClick={() => ChangeRoute("saleinvoice")}
            sx={{ color: "white" }}
          />
          <BottomNavigationAction
            label="Purchase"
            value="purchase"
            icon={<ShoppingCartIcon sx={{fontSize:"25px"}} />}
            onClick={() => ChangeRoute("purchase")}
            sx={{ color: "white" }}
          />
          <BottomNavigationAction
            label="User"
            value="user"
            icon={<AccountCircleIcon sx={{fontSize:"25px"}} />}
            onClick={() => ChangeRoute("user")}
            sx={{ color: "white", }}
          />

        </BottomNavigation>
      </div>
    </>
  );
}

export default Dashboard;
