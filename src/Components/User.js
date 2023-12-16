import React, { useEffect, useState, useRef } from "react";
import { App } from "@capacitor/app";

import { useNavigate, useLocation } from "react-router-dom";
import RightArrow from "../images/arrow.png";
import Edit from "../images/edit.png";
import Sync from "../images/sync.png";
import axios from "axios";

import Paper from "@mui/material/Paper";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dexie from "dexie";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "94%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  margin: "0 auto",
  borderRadius: "15px",
};

const User = (props) => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [shop, setShop] = useState("");
  const [name, setName] = useState("Name");
  const [email, setEmail] = useState("Email");
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopContact, setShopContact] = useState("");
  const [GSTNum, setGSTNum] = useState(null);

  const location = useLocation();
  const handleBackButton = () => {
    if (location.pathname !== "/") {
      window.history.back();
    } else {
      App.exitApp();
    }
  };
  useEffect(() => {
    const addListenerAsync = async () => {
      const backButtonHandler = await App.addListener(
        "backButton",
        handleBackButton
      );
      return backButtonHandler;
    };

    addListenerAsync();

    return () => {
      // Clean up the listener when the component unmounts
      App.removeAllListeners();
    };
  }, []);

  const user = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    getUserDetails();
  }, []);

  const getUserDetails = () => {
    try {
      if (user) {
        setName(user.name);
        setEmail(user.email);
      }

      // const userAddCon = JSON.parse(localStorage.getItem(`userAdd_${user.name}`));
      const userAddCon = JSON.parse(localStorage.getItem(`userAdd`));

      if (userAddCon) {
        setShopContact(userAddCon.contact);
        setShopAddress(userAddCon.address);
        setShopName(userAddCon.shopName);
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleAdd = () => {
    try {
      const userDataString = JSON.stringify({
        address: address,
        contact: contact,
        shopName: shop,
      });

      // localStorage.setItem(`userAdd_${user.name}`, userDataString);
      localStorage.setItem(`userAdd`, userDataString);
      setShopAddress(address);
      setShopContact(contact);
      setShopName(shop);
      setOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("userData");
      localStorage.removeItem("userAdd");
      props.setLogin(false);
    } catch (error) {
      console.log(error);
    }
  };

  const inputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    // const savedImage = localStorage.getItem(`profilePicture_${user.name}`);
    const GSTIN = localStorage.getItem(`GSTIN`);
    if (GSTIN) {
      setGSTNum(GSTIN);
    }
    const savedImage = localStorage.getItem(`profilePicture`);
    if (savedImage) {
      setImagePreview(savedImage);
    }
  }, []);

  const handleFileChange = () => {
    const input = inputRef.current;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageBase64 = e.target.result;
        setImagePreview(imageBase64);

        // localStorage.setItem(`profilePicture_${user.name}`, imageBase64);
        localStorage.setItem(`profilePicture`, imageBase64);
      };

      reader.readAsDataURL(input.files[0]);
    }
  };

  const handleImageClick = (event) => {
    event.preventDefault(); // Prevent default behavior of the label
    const input = inputRef.current;
    if (input) {
      input.click();
    }
  };

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setShop(shopName);
    setAddress(shopAddress);
    setContact(shopContact);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  function validateGSTNumber(gstNumber) {
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstRegex.test(gstNumber);
  }

  const fetchGST = async () => {
    const isValid = validateGSTNumber(GSTNum);

    if (isValid) {
      const options = {
        method: "POST",
        url: "https://gst-verification.p.rapidapi.com/v3/tasks/sync/verify_with_source/ind_gst_certificate",
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key":
            "1d0fe5cd7cmshfacc63fd8cb7723p192bccjsnaf6b60222410",
          "X-RapidAPI-Host": "gst-verification.p.rapidapi.com",
        },
        data: {
          task_id: "74f4c926-250c-43ca-9c53-453e87ceacd1",
          group_id: "8e16424a-58fc-4ba4-ab20-5bc8e7c3c41e",
          data: {
            gstin: `${GSTNum}`,
          },
        },
      };

      try {
        const response = await axios.request(options);

        const res = await fetch("http://localhost:8000/auth/gstvalidation", {
          method: "POST",
          body: JSON.stringify({ GSTIN: GSTNum }),
          headers: {
            "Content-Type": "application/json",
            jwtoken: localStorage.getItem("userData").jwtoken,
          },
        });

        const data = await res.json();

        if (!data.error) {
          localStorage.setItem("GSTIN", data.GSTIN);
          toast.success(`GSTIN validate successfully`);
        } else {
          toast.error(`GSTIN not validating properly try again`);
        }
      } catch (error) {
        toast.error(`Use the valid GSTIN`);
      }
    } else {
      toast.error("Invalid GST Number");
    }
  };

  // Initialize Dexie database
  const db = new Dexie("sale");
  db.version(4).stores({
    saleItems: "++id,today,clientName,date", // Ensure uniqueness based on fields
  });

  const handleSync = async () => {
    try {
      const res = await fetch("http://localhost:8001/product/fetchsaledata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          jwtoken: localStorage.getItem("user"),
        },
      });

      const data = await res.json();
      if (!data.error) {
        console.log("fetchData", data);

        // // Sync data and avoid duplicates
        // await db.transaction("rw", db.saleItems, async () => {
        //   for (const item of data.data) {
        //     //   // Check if the entry already exists in Dexie by constructing a compound key
        //     //   const key = JSON.stringify([item.today, item.clientName, item.date]);

        //     // const duplicate = await db.saleItems.get(key);
        //     // if (!duplicate) {
        //     //   // If the entry doesn't exist, add it to Dexie
        //     //   await db.saleItems.put(item, key);
        //     //     console.log(`Added sale item with ID ${item.id} to Dexie.`);
        //     //   } else {
        //     //     console.log(
        //     //       `Sale item with ID ${item.id} already exists in Dexie.`
        //     //     );
        //     //   }
        //     // Construct the key for duplicate checking
        //     const key = [item.today, item.clientName];

        //     // Use upsert() to add or update the item
        //     await db.saleItems
        //       .where({ today: key[0], clientName: key[1]})
        //       .first((existingItem) => {
        //         if (!existingItem) {
        //           db.saleItems.add(item); // Add if not exists
        //           console.log(`Added sale item with ID ${item.id} to Dexie.`);
        //         } else {
        //           db.saleItems.update(existingItem.id, item); // Update if exists
        //           console.log(
        //             `Sale item with ID ${item.id} already exists in Dexie. Updated.`
        //           );
        //         }
        //       });
        //   }
        // });

        // Sync data and avoid duplicates
      await db.transaction("rw", db.saleItems, async () => {
        for (const item of data.data) {
          // Construct the key for duplicate checking and ensure it's a string
          const key = JSON.stringify([String(item.today), item.clientName, String(item.date)]);

          // Check for duplicates using the stringified key
          const duplicate = await db.saleItems.get(key);
          if (!duplicate) {
            // If the entry doesn't exist, add it to Dexie
            await db.saleItems.add(item, key);
            console.log(`Added sale item with ID ${item.id} to Dexie.`);
          } else {
            console.log(`Sale item with ID ${item.id} already exists in Dexie.`);
          }
        }
      });

        console.log("Data synced and stored in Dexie without duplicates.");
      } else {
        console.log("Error Data", data);
      }
    } catch (error) {
      console.error("Error syncing data:", error);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={false}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable={true}
        theme="dark"
      />
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography
              className="border-bottom pb-2"
              id="transition-modal-title"
              variant="h6"
              component="p"
            >
              <div className="d-flex justify-content-between align-items-center">
                Update your shop details
              </div>
            </Typography>

            <Typography id="transition-modal-description">
              <div className="detail-div mt-2">
                <div className="form-outline user-n">
                  <label className="form-label" htmlFor="contact">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    onChange={(e) => setShop(e.target.value)}
                    value={shop}
                    id="contact"
                    className="form-control"
                  />
                </div>

                <div className="form-outline user-n my-3">
                  <label className="form-label" htmlFor="address">
                    Address
                  </label>
                  <input
                    type="text"
                    onChange={(e) => setAddress(e.target.value)}
                    value={address}
                    id="address"
                    className="form-control"
                  />
                </div>

                <div className="form-outline user-n ">
                  <label className="form-label" htmlFor="contact">
                    Contact
                  </label>
                  <input
                    type="text"
                    onChange={(e) => setContact(e.target.value)}
                    value={contact}
                    id="contact"
                    className="form-control"
                  />
                </div>

                <button
                  onClick={handleAdd}
                  className="btn w-100 my-3 float-end"
                >
                  Save & Update
                </button>
              </div>
            </Typography>
          </Box>
        </Fade>
      </Modal>

      <div style={{ width: "100%" }}>
        <Paper
          sx={{
            padding: "11px",
          }}
          className="nav-paper"
        >
          <div className="user-paper">
            <span className="back" onClick={() => navigate(-1)}>
              <img src={RightArrow} width="100%" alt="" />
            </span>

            <span className="">Profile</span>

            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
              <span
                onClick={handleSync}
                style={{
                  display: "inline-block",
                  width: "20px",
                }}
              >
                <img src={Sync} width="100%" alt="" />
              </span>

              <span
                onClick={handleOpen}
                style={{
                  display: "inline-block",
                  width: "20px",
                }}
              >
                <img src={Edit} width="100%" alt="" />
              </span>
              <span onClick={handleLogout} className="logout float-end fw-bold">
                Logout
              </span>
            </div>
          </div>
        </Paper>

        <div className="login-update-user-detail">
          <div className="user-cont">
            <div className="user-div user-detail-div">
              <div className="picture-container">
                <label className="picture">
                  <input
                    type="file"
                    id="wizard-picture-input"
                    ref={inputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <img
                    src={imagePreview}
                    alt=""
                    className="picture-src"
                    style={{ display: "block", maxWidth: "300px" }}
                    onClick={(event) => handleImageClick(event)}
                  />
                </label>
              </div>
              <div className="user-details-container">
                <div className="user-child-div">
                  <h5 className="shop-name m-2">{name}</h5>
                  <h5 className="email m-2">{email}</h5>

                  <div className="gst-container my-5">
                    <label htmlFor="gst-num" className="ms-4 fw-bold">
                      GST Number (Optional)
                    </label>
                    <div className="d-flex justify-content-center">
                      <input
                        onChange={(event) => setGSTNum(event.target.value)}
                        type="text"
                        value={GSTNum ? GSTNum : ""}
                        style={{
                          height: "44px",
                          borderRadius: "18px 0 0 18px",
                        }}
                        name="gst-num"
                        id="gst-num"
                      />
                      <button
                        onClick={fetchGST}
                        className="btn"
                        style={{ borderRadius: "0 18px 18px 0" }}
                      >
                        Fetch
                      </button>
                    </div>
                  </div>

                  <div className="my-5 shop-details-container">
                    <h5 className="shopName fw-bold">{shopName?shopName:"Shop Name"}</h5>
                    <h5 className="address fw-bold">{shopAddress?shopAddress:"Shop Address"}</h5>
                    <h5 className="contact fw-bold">{shopContact?shopContact:"Shop Contact"}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default User;
