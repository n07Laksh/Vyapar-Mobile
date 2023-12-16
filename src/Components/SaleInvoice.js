import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShopDetails from "./ShopDetails";
import CustomerDetails from "./CustomerDetails";
import SaleDetails from "./SaleDetails";
import Dexie from "dexie";

import Paper from "@mui/material/Paper";
import Fab from "@mui/material/Fab";
import RightArrow from "../images/arrow.png";
import Add from "../images/add.png";
import PrintIcon from "@mui/icons-material/Print";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "15px",
};

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TextField from "@mui/material/TextField";

function SaleInvoice() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("userData"));
  const GSTIN = localStorage.getItem("GSTIN");

  const [total, setTotal] = useState();
  const [grandTotal, setGrandTotal] = useState();
  const [isZero, setIsZero] = useState(false);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(null);
  const [soldQuantitie, setSoldQuantitie] = useState({});

  const [invNum, setInvNum] = useState("");
  const [currInvNum, setCurrInvNum] = useState(null);

  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

    if (!localStorage.getItem("Inv")) {
      localStorage.setItem("Inv", 1);
    }



  const [saleData, setSaleData] = useState({
    invoiceType: "GST",
    invoiceNum: invNum,
    clientName: "",
    clientContact: "",
    clientAddress: "",
    payMode: "Cash",
    today: formattedDate,
    saleItem: [],
  });

  const [addedItems, setAddedItems] = useState({
    name: "",
    unit: "KG",
    quantity: "",
    salePrice: "",
    disc: "",
    gst: GSTIN ? 18 : 0,
    amount: "",
    date: formattedDate,
  });

  useEffect(() => {
    const inv = localStorage.getItem("Inv");
    const finalInv = `Inv#${inv}`;
    setInvNum(finalInv);
    setCurrInvNum(inv);
  }, [saleData]);

  useEffect(() => {
  setSaleData(prevSaleData => ({
    ...prevSaleData,
    invoiceNum: invNum,
  }));
}, [invNum]);

  useEffect(() => {
    // Calculate total based on updated addedItems
    const newTotal = saleData.saleItem.reduce((sub, item) => {
      return sub + Number(item.amount);
    }, 0);
    setTotal(newTotal);
    setGrandTotal(newTotal);
  }, [addedItems, saleData]);

  // calculate discount and auto fill for sale amount
  useEffect(() => {
    const itemAmount = addedItems.quantity * addedItems.salePrice;
    if (addedItems.disc) {
      const discountedAmt = itemAmount - (itemAmount * addedItems.disc) / 100;
      addedItems.disc == "100" || discountedAmt <= 0
        ? (addedItems.amount = 0)
        : (addedItems.amount = Math.round(discountedAmt));
      addedItems.amount = Math.round(discountedAmt);
      setIsZero(true);
      setOriginalAmount(Math.round(discountedAmt));
    } else {
      setOriginalAmount(itemAmount);
      addedItems.amount = itemAmount;
      setIsZero(true);
    }
  }, [
    addedItems.salePrice,
    addedItems.quantity,
    addedItems.disc,
    saleData.invoiceType,
  ]);

  useEffect(() => {
    // Ensure purchaseData.gst is a valid number
    const gstPercentage = parseFloat(addedItems.gst);
    if (saleData.invoiceType === "GST") {
      // Check if gstPercentage is a valid number between 0 and 100 (inclusive)
      if (!isNaN(gstPercentage) && gstPercentage >= 0 && gstPercentage <= 100) {
        // Calculate the GST amount
        const gstAmount = (originalAmount * gstPercentage) / 100;

        // Calculate the new total with GST
        const newAmount = originalAmount + gstAmount;

        // Update purchaseData.amount and the state
        addedItems.amount = Math.round(newAmount);
      } else {
        addedItems.amount = Math.round(originalAmount);
        // Handle the case where the GST percentage is invalid
      }
    } else {
      addedItems.gst = 0;
    }
  }, [addedItems.gst, originalAmount, saleData.invoiceType]);

  // const storeDB = new Dexie(`store_${user.name}`);
  const storeDB = new Dexie(`store`);
  storeDB.version(4).stores({
    items: "name", // collection with keyPath name and
  });

  // auto suggest function
  const [store, setStore] = useState([]);
  const [filteredStore, setFilteredStore] = useState([]);

  useEffect(() => {
    // Function to get all data from indexeddb store collection
    async function getStore() {
      const storeData = await storeDB.items.toArray();
      storeData.length > 0 ? setStore(storeData) : setStore([]);
    }
    getStore();
  }, []);

  const inputChange = (event) => {
    setSaleData({
      ...saleData,
      [event.target.name]: event.target.value,
    });
  };

  // Function to filter store based on input value
  const searchItemName = (value) => {
    if (value.length > 0) {
      const filteredItems = store.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStore(filteredItems);
    } else {
      setFilteredStore([]);
    }
  };

  const saleItemChange = (event) => {
    if (event.target.name === "name") {
      setAddedItems({
        ...addedItems,
        [event.target.name]: event.target.value,
      });
      searchItemName(event.target.value);
    } else {
      setAddedItems({
        ...addedItems,
        [event.target.name]: event.target.value,
      });
    }
  };

  const [allItem, setAllItems] = useState(null);
  useEffect(() => {
    const allAvailItems = async () => {
      return await storeDB.items.toArray();
    };
    allAvailItems().then((data) => {
      setAllItems(data);
    });
  }, []);


  const addSaleItem = async () => {
    const newUpdatedDetails = {
      ...addedItems,
      name: (addedItems.name.toLocaleLowerCase()).trim()
    };
    const { name, quantity, salePrice, amount } = newUpdatedDetails;

    if (name && quantity && salePrice && isZero && saleData.clientName) {
      const itemName = name.toLowerCase();
      const existingQuantity =
        parseFloat(
          allItem.find((item) => item.name.toLowerCase() === itemName)?.quantity
        ) || 0;
      const itemIndex = allItem.findIndex(
        (item) => item.name.toLowerCase() === itemName
      );
      const soldQuantity = parseFloat(quantity);

      if (existingQuantity > 0) {
        if (existingQuantity >= soldQuantity) {
          if (itemIndex !== -1) {
            allItem[itemIndex].quantity = existingQuantity - soldQuantity;
            const updatedSaleItem = [...saleData.saleItem];
            const existingItemIndex = updatedSaleItem.findIndex(
              (item) => item.name.toLowerCase() === itemName
            );

            if (existingItemIndex !== -1) {
              // Update the existing item quantity by adding the new quantity
              updatedSaleItem[existingItemIndex].quantity += soldQuantity;
              updatedSaleItem[existingItemIndex].amount += amount;
            } else {
              // Add the new item if not found
              updatedSaleItem.push({
                ...newUpdatedDetails,
                quantity: soldQuantity, // Set the new quantity
              });
            }

            // Update saleData with the modified saleItem array
            setSaleData((prevSaleData) => ({
              ...prevSaleData,
              saleItem: updatedSaleItem,
            }));
          }

          // Update soldQuantitie with sold quantities for each item
          setSoldQuantitie((prevSoldQuantitie) => ({
            ...prevSoldQuantitie,
            [itemName]: (prevSoldQuantitie[itemName] || 0) + soldQuantity,
          }));

          // Clear input fields
          setAddedItems((prevData) => ({
            ...prevData,
            name: "",
            quantity: "",
            salePrice: "",
            disc: "",
            amount: "",
          }));
        } else {
          toast.error(`Error: Not enough ${itemName}(s) in stock.`);
          return; // Exit the function if any item is not available
        }
      } else {
        toast.error(`Item ${itemName} has an empty quantity in the store.`);
        return false; // Reject promise if item has an empty quantity
      }
    } else {
      toast.error("Required fields are not empty");
    }
  };

  // const db = new Dexie(`sale_${user.name}`);
  const db = new Dexie(`sale`);

  // Define the schema including the new collection
  db.version(4).stores({
    saleItems: "++id,today,clientName,date", // New collection
  });

  // const dailySale = new Dexie(`dailySale_${user.name}`);
  const dailySale = new Dexie(`dailySale`);
  dailySale.version(5).stores({
    sales: "++id,clientName", //'++id' is an auto-incremented unique identifier
  });

  // Define the handleSale function
  const handleSale = async (salesItems) => {
    try {
      // Update the store items with the new quantities
      await storeDB.transaction("rw", storeDB.items, async () => {
        for (const itemName in salesItems) {
          const existingItem = await storeDB.items.get(itemName);
          existingItem.quantity -= salesItems[itemName];
          await storeDB.items.put(existingItem);
        }
      });

      // Display the remaining quantities for all items
      // for (const itemName in salesItems) {
      //   const remainingQuantity = salesItems[itemName];
      //   // toast.success(`Sold ${remainingQuantity} ${itemName}(s).`);
      // }
    } catch (error) {
      toast.error("Error handling sale:", error);
    }
  };

  const updateItemInDB = async (item) => {
    try {
      // Update the item in saleItems database
      await db.saleItems.put(item);
      await dailySale.sales.put(item);
      return true; // Resolve promise if updated successfully
    } catch (error) {
      return false; // Reject promise if error occurred
    }
  };

  const savePrint = async () => {
    if (saleData.saleItem.length > 0) {
      // Assuming saleItem is a single object
      const result = await updateItemInDB(saleData);

      if (result) {
        // Update successful, perform actions here
        handleSale(soldQuantitie);

        localStorage.setItem("Inv", parseFloat(currInvNum) + 1);

        toast.success("Item Saved Successfully!");
        setAddedItems([]);
        setDiscountAmount(null);
        setSaleData({
          invoiceType: "GST",
          invoiceNum: "",
          clientName: "",
          clientContact: "",
          clientAddress: "",
          today: formattedDate,
          saleItem: [],
        });
      } else {
        toast.error("Error adding item");
      }
    } else {
      toast.warn("Add Sale Details");
    }
  };

  // Function to delete an item from saleItem by index
  const handleDeleteItem = (index) => {
    const updatedItems = [...saleData.saleItem];
    updatedItems.splice(index, 1); // Remove the item at the specified index
    setSaleData((prevData) => ({
      ...prevData,
      saleItem: updatedItems, // Update saleItem without wrapping in an extra array
    }));
  };

  // Function to handle item selection
  const handleItemClick = (item) => {
    setAddedItems({
      ...addedItems,
      name: item.name,
      salePrice: item.salePrice ? item.salePrice : item.purchasePrice,
      unit: item.unit,
    });
    setFilteredStore([]);
  };

  const handleNewInvoice = () => {
    setSaleData((prevData) => ({
      ...prevData,
      invoiceNum: "",
      clientName: "",
      clientContact: "",
      clientAddress: "",
      saleItem: [],
    }));
    setAddedItems((prevData) => ({
      ...prevData,
      name: "",
      quantity: "",
      salePrice: "",
      disc: "",
      amount: "",
      date: "",
    }));
  };

  const [selectItem, setSelectItem] = useState(null);
  const [open, setOpen] = React.useState(false);
  const handleOpen = (itm) => {
    setSelectItem(itm);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

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
      {selectItem && (
        <div>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                <div className="">
                  <div className="modal-itm-name text-capitalize">
                    {selectItem.name}
                  </div>
                </div>
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <div>
                  <div className="modal-view-details">
                    <div>Sale price</div>
                    <div>{selectItem.salePrice}₹</div>
                  </div>
                  <div className="modal-view-details">
                    <div>Quantity</div>
                    <div>
                      {selectItem.quantity} {selectItem.unit}
                    </div>
                  </div>
                  <div className="modal-view-details">
                    <div>Discount</div>
                    <div>{selectItem.disc ? selectItem.disc + "%" : "0%"}</div>
                  </div>
                  <div className="modal-view-details">
                    <div>GST</div>
                    <div>{selectItem.gst ? selectItem.gst + "%" : "0%"}</div>
                  </div>
                  <div className="modal-view-details">
                    <div>Date</div>
                    <div>{selectItem.date}</div>
                  </div>

                  <div className="modal-view-details amt">
                    <div>Amount</div>
                    <div className="fw-bolder">{selectItem.amount}</div>
                  </div>
                </div>
              </Typography>
            </Box>
          </Modal>
        </div>
      )}

      <div className="sale-content-parentdiv">
        <div className="print-show">
          <div className="invoice text-center">
            <h6 className="text-center inv-txt mb-3">Invoice</h6>
          </div>
          <div className="d-flex justify-content-between gap-1 border">
            <div className="print-detail">
              <ShopDetails />
            </div>
            <div className="print-detail">
              <CustomerDetails />
            </div>
          </div>
        </div>
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
            <span className="">Sale Invoice</span>
            <div onClick={handleNewInvoice} style={{ width: "25px" }}>
              <img width="100%" src={Add} alt="New Invoice" />
            </div>
          </div>
        </Paper>

        <div className="user-info">
          {GSTIN && (
            <div>
              <label htmlFor="invoiceType" className="lable-txt">
                Invoice Type
              </label>
              <br />
              <select
                onChange={inputChange}
                id="invoice-type"
                name="invoiceType"
                value={saleData.invoiceType}
                className="w-100"
              >
                <option value="NoGST">No GST</option>
                <option value="GST">GST</option>
              </select>
            </div>
          )}

          <div className="user-inputs">
            <div>
              <input
                type="text"
                className="invoice-no"
                name="invoiceNum"
                value={saleData.invoiceNum}
                onChange={inputChange}
                placeholder="Invoice No."
              />
            </div>

            <div>
              <input
                onChange={inputChange}
                type="date"
                value={addedItems.date ? addedItems.date : formattedDate}
                name="date"
                className="date"
                max={formattedDate}
              />
            </div>
          </div>

          {/* <div className="user-inputs"> */}
          <div>
            <TextField
              disableUnderline
              sx={{
                input: {
                  // Styling the nested input field
                  padding: "5px 10px",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  height: "55px",
                },
              }}
              id="standard-basic"
              label="Client Name*"
              variant="standard"
              name="clientName"
              onChange={inputChange}
              // onChange={nameSuppHandle}
              value={saleData.clientName}
              className="w-100"
              InputLabelProps={{
                style: { paddingLeft: "10px" },
              }}
            />
          </div>

          <div>
            <TextField
              disableUnderline
              sx={{
                input: {
                  // Styling the nested input field
                  padding: "5px 10px",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  height: "55px",
                },
              }}
              id="standard-basic"
              label="Contact"
              variant="standard"
              name="clientContact"
              onChange={inputChange}
              value={saleData.clientContact}
              className="w-100"
              InputLabelProps={{
                style: { paddingLeft: "10px" }, // Adjust the padding value as needed
              }}
            />
          </div>

          <div className="">
            <TextField
              disableUnderline
              sx={{
                input: {
                  // Styling the nested input field
                  padding: "5px 10px",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  height: "55px",
                },
              }}
              id="standard-basic"
              label="Address"
              variant="standard"
              name="clientAddress"
              onChange={inputChange}
              value={saleData.clientAddress}
              className="w-100"
              InputLabelProps={{
                style: { paddingLeft: "10px" }, // Adjust the padding value as needed
              }}
            />
          </div>
        </div>

        <div className="item-section mb-5">
          <div className="position-relative">
            <TextField
              disableUnderline
              sx={{
                input: {
                  // Styling the nested input field
                  padding: "5px 10px",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  height: "55px",
                },
              }}
              id="standard-basic"
              label="Product name*"
              variant="standard"
              name="name"
              onChange={saleItemChange}
              className="w-100"
              value={addedItems.name}
              InputLabelProps={{
                style: { paddingLeft: "10px", textTransform: "capitalize" }, // Adjust the padding value as needed
              }}
            />
            <div className="result_item">
              {/* Display the filtered results as a list of names */}
              <ul className="list-group">
                {filteredStore.map((item) => (
                  <li
                    className="list-group-item"
                    style={{ padding: "12px", textTransform: "capitalize" }}
                    key={item.name}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="fields-inp">
            <div className="input-fields">
              <select
                className="unit-select"
                onChange={saleItemChange}
                d="unit"
                name="unit"
                value={addedItems.unit}
              >
                <option value="NO">None</option>
                <option value="BG">Bag (BG)</option>
                <option value="BTL">Bottle (BTL)</option>
                <option value="BX">Box (BX)</option>
                <option value="BDL">Bundles (BDL)</option>
                <option value="CAN">Cans (CAN)</option>
                <option value="CTN">Cortons (CTN)</option>
                <option value="DZN">Dozens (DZN)</option>
                <option value="GM">Grammes (GM)</option>
                <option value="KG">Kilograms (KG)</option>
                <option value="LT">Liter (LT)</option>
                <option value="MT">Meters (MT)</option>
                <option value="MLT">MiliLiter (MLT)</option>
                <option value="NUM">Numbers (NUM)</option>
                <option value="PAC">Packs (PAC)</option>
                <option value="PRS">Pairs (PRS)</option>
                <option value="PCS">Pieces (PCS)</option>
                <option value="QTL">Quintal (QTL)</option>
                <option value="ROL">Rolls (ROL)</option>
                <option value="SF">Square Feet (SF)</option>
                <option value="SM">Square Meter (SM)</option>
                <option value="TAB">Tablets (TAB)</option>
              </select>
            </div>
            <div>
              <input
                onChange={saleItemChange}
                type="number"
                id="quantity"
                className="quantity"
                name="quantity"
                value={addedItems.quantity}
                placeholder="Quantity*"
              />
            </div>
          </div>

          <div>
            <TextField
              disableUnderline
              sx={{
                input: {
                  // Styling the nested input field
                  padding: "5px 10px",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  height: "55px",
                },
              }}
              id="standard-basic"
              label="Sale Price*"
              variant="standard"
              name="salePrice"
              onChange={saleItemChange}
              className="w-100 sale-price"
              value={addedItems.salePrice}
              InputLabelProps={{
                style: { paddingLeft: "10px" }, // Adjust the padding value as needed
              }}
            />
          </div>
          <div className="fields-inp">
            <div className="input-fileds">
              <input
                onChange={saleItemChange}
                type="number"
                id="disc"
                className={`disc sale-inp ${GSTIN ? "" : "w-100"}`}
                name="disc"
                value={addedItems.disc}
                placeholder="Discount %"
              />
            </div>
            {GSTIN && (
              <div className="input-fileds">
                <div className="position-relative">
                  <input
                    onChange={saleItemChange}
                    type="number"
                    id="gst"
                    className="gst "
                    name="gst"
                    value={addedItems.gst}
                    disabled={saleData.invoiceType === "NoGST" ? true : false}
                    placeholder="gst%"
                  />
                  <span className="percent-div"> GST% </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {addedItems.amount > 0 && (
          <div className="d-flex justify-content-center mb-5">
            <Fab
              sx={{
                width: "90%",
                height: "40px",
                display: "flex",
                justifyContent: "space-between",
              }}
              onClick={addSaleItem}
              variant="extended"
            >
              <div className="ms-4 fw-bold">
                {" "}
                {addedItems.amount ? addedItems.amount : ""}{" "}
              </div>
              <div style={{ width: "33px" }}>
                <img className="w-100" src={RightArrow} alt="" />
              </div>
            </Fab>
          </div>
        )}

        <div className="sale-itm-container">
          {saleData.saleItem.map((item, index) => (
            <div
              className="sale-itm-item"
              key={index}
              onClick={() => handleOpen(item)}
            >
              <div className="sale-itm-name text-capitalize">{item.name}</div>
              <div className="d-flex gap-4">
                <div className="sale-itm-price">{item.amount}</div>
                <button
                  className="sale-itm-cut"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop the event propagation
                    handleDeleteItem(index);
                  }}
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sale-invoice-footer">
          <div className="w-100 px-3">
            <div className="w-100">
              <select
                onChange={inputChange}
                id="payMode"
                name="payMode"
                value={saleData.payMode}
                className="w-100"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI (Online Payment)</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card Payment</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="print-save mt-5">
            <div className="sub-total-shelter d-flex justify-content-between">
              <div>Sub-Total</div>
              <div>{total ? total : "0.00"}</div>
            </div>
            <div className="sub-total-shelter d-flex justify-content-between">
              <div>GRAND TOTAL</div>
              <div>{grandTotal ? grandTotal.toFixed(0) : "0.00"}</div>
            </div>
          </div>

          <div className="text-center my-3">
            <Fab
              sx={{
                height: "40px",
                margin: "10px 0",
                width: "50%",
                zIndex: "1",
              }}
              onClick={savePrint}
              variant="extended"
            >
              Save & Print
              <PrintIcon sx={{ ml: 1 }} />
            </Fab>
          </div>
        </div>

        <div className="sale-details">
          <SaleDetails
            total={total}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
          />
        </div>
      </div>
    </>
  );
}

export default SaleInvoice;
