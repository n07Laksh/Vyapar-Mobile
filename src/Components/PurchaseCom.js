import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dexie from "dexie";

import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Fab from "@mui/material/Fab";
import RightArrow from "../images/arrow.png";
import Add from "../images/add.png";
import SaveIcon from "@mui/icons-material/Save";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PurchaseInvoice() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData"));
  const GSTIN = localStorage.getItem("GSTIN");

  const [total, setTotal] = useState();
  const [grandTotal, setGrandTotal] = useState();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(null);
  const [isZero, setIsZero] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(null);
  const [gstAmount, setGstAmount] = useState(null);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [totalOriginalAmount, setTotalOriginalAmount] = useState(0);
  const [totalOriginalGSTAmount, setTotalGSTOriginalAmount] = useState(0);
  const [fractionalPart, setFractionalPart] = useState(0);

  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

  const [purchaseData, setPurchaseData] = useState({
    invoiceType: "GST",
    supplierName: "",
    billNum: "",
    payMode: "Cash",
    today: formattedDate,
    purchaseItem: [],
  });

  const [addedItems, setAddedItems] = useState({
    name: "",
    unit: "KG",
    quantity: "",
    purchasePrice: "",
    salePrice: "",
    disc: "",
    gst: GSTIN ? 18 : 0,
    amount: "",
    date: "",
  });

  useEffect(() => {
    // Calculate total based on updated addedItems
    const newTotal = purchaseData.purchaseItem.reduce((sub, item) => {
      return sub + Number(item.amount);
    }, 0);

    setTotal(newTotal);
    setGrandTotal(newTotal);
  }, [addedItems]);

  // calculate discount and auto fill for sale amount
  useEffect(() => {
    const itemAmount = addedItems.quantity * addedItems.purchasePrice;
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
    addedItems.purchasePrice,
    addedItems.quantity,
    addedItems.disc,
    purchaseData.invoiceType,
  ]);

  useEffect(() => {
    // Ensure addedItems.gst is a valid number
    const gstPercentage = parseFloat(addedItems.gst);
    if (purchaseData.invoiceType === "GST") {
      // Check if gstPercentage is a valid number between 0 and 100 (inclusive)
      if (!isNaN(gstPercentage) && gstPercentage >= 0 && gstPercentage <= 100) {
        const gstAmount = (originalAmount * gstPercentage) / 100;
        const newAmount = originalAmount + gstAmount;

        // Update addedItems.amount and the state
        addedItems.amount = Math.round(newAmount);
      } else {
        addedItems.amount = Math.round(originalAmount);
      }
    } else {
      addedItems.gst = 0;
    }
  }, [addedItems.gst, originalAmount, purchaseData.invoiceType]);

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

  // Function to filter store based on input value
  const searchItemName = (value) => {
    const filteredItems = store.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    searchItemName;
    setFilteredStore(filteredItems);
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

  const inputChange = (event) => {
    setPurchaseData({
      ...purchaseData,
      [event.target.name]: event.target.value,
    });
  };

  const addSaleItem = () => {
    if (
      addedItems.name &&
      addedItems.quantity &&
      addedItems.purchasePrice &&
      isZero &&
      purchaseData.supplierName
    ) {
      const newUpdatedDetails = {
        ...addedItems,
        name: (addedItems.name.toLocaleLowerCase()).trim(),
      };
      const existingItemIndex = purchaseData.purchaseItem.findIndex(
        (item) => item.name === newUpdatedDetails.name
      );

      if (existingItemIndex !== -1) {
        const updatedPurchaseItem = purchaseData.purchaseItem.map((item) => {
          if (item.name === newUpdatedDetails.name) {
            return {
              ...item,
              quantity:
                parseFloat(item.quantity) + parseFloat(newUpdatedDetails.quantity),
              // Update other properties if needed
            };
          }
          return item;
        });

        setPurchaseData((prevData) => ({
          ...prevData,
          purchaseItem: updatedPurchaseItem,
        }));
      } else {
        // If the item doesn't exist, add it to the purchaseItem array
        setPurchaseData((prevData) => ({
          ...prevData,
          purchaseItem: [...prevData.purchaseItem, newUpdatedDetails],
        }));
      }

      setAddedItems({
        name: "",
        quantity: "",
        purchasePrice: "",
        salePrice: "",
        disc: "",
        amount: "",
      });
    } else {
      toast.error("Required fields are not filled");
    }
  };

  // const db = new Dexie(`purchase_${user.name}`);
  const db = new Dexie(`purchase`);
  db.version(4).stores({
    purchaseData: "++id,today,billNum,supplierName,date",
  });

  // const dailyPurchase = new Dexie(`dailyPurchase_${user.name}`);
  const dailyPurchase = new Dexie(`dailyPurchase`);
  dailyPurchase.version(5).stores({
    purchases: "++id,today,supplierName",
  });

  const savePurchase = async () => {
    if (purchaseData.purchaseItem.length > 0) {
      try {
        // Add entire purchaseData to db.purchaseData and dailyPurchase.purchases
        await db.purchaseData.add(purchaseData);
        await dailyPurchase.purchases.add(purchaseData);

        // Map and add all objects from purchaseData.purchaseItem to storeDB
        await Promise.all(
          purchaseData.purchaseItem.map(async (item) => {
            try {
              if (item.name && item.quantity && item.purchasePrice) {
                const itemNameLowerCase = item.name.toLowerCase();
                const existingItem = await storeDB.items.get(itemNameLowerCase);
                if (existingItem) {
                  // If the item exists, update its quantity by adding the new quantity
                  existingItem.quantity =
                    Number(existingItem.quantity) + Number(item.quantity);
                  existingItem.purchasePrice = item.purchasePrice;
                  existingItem.salePrice = item.salePrice;
                  existingItem.unit = item.unit;
                  await storeDB.items.put(existingItem);
                } else {
                  // If the item doesn't exist, create a new record
                  const storeData = {
                    name: itemNameLowerCase,
                    quantity: item.quantity,
                    salePrice: item.salePrice,
                    purchasePrice: item.purchasePrice,
                    unit: item.unit,
                  };
                  await storeDB.items.put(storeData);
                }
              } else {
                toast.warn(
                  "Please fill in all required fields for the purchase item."
                );
              }
            } catch (error) {
              console.error("Error adding/updating item in storeDB:", error);
              toast.error(
                "Error adding/updating item in storeDB: " + error.message
              );
            }
          })
        );

        // Clear purchaseData after successful addition
        setPurchaseData((prevPurchaseData) => ({
          ...prevPurchaseData,
          supplierName: "",
          billNum: "",
          purchaseItem: [],
        }));

        toast.success("Purchase data Saved successfully");
      } catch (error) {
        console.error("Error adding purchase data:", error);
        toast.error("Error adding purchase data: " + error.message);
      }
    } else {
      toast.warn("Add Sale Details");
    }
  };

  const handleDeleteItem = (index) => {
    const updatedItems = [...purchaseData.purchaseItem];
    updatedItems.splice(index, 1); // Remove the item at the specified index
    setPurchaseData((prevData) => ({
      ...prevData,
      purchaseItem: updatedItems, // Update purchaseItem without wrapping in an extra array
    }));
  };

  // Function to handle item selection
  const handleItemClick = (item) => {
    setAddedItems({
      ...addedItems,
      name: item.name,
      purchasePrice: item.purchasePrice,
      salePrice: item.salePrice,
    });
    setFilteredStore([]);
  };

  const handleNewInvoice = () => {
    setPurchaseData((prevData) => ({
      ...prevData,
      supplierName: "",
      billNum: "",
      purchaseItem: [],
    }));
    setAddedItems((prevData) => ({
      ...prevData,
      name: "",
      quantity: "",
      salePrice: "",
      purchasePrice: "",
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
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
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
            <span className="">Purchase</span>
            <div onClick={handleNewInvoice} style={{ width: "25px" }}>
              <img width="100%" src={Add} alt="New Invoice" />
            </div>
          </div>
        </Paper>

        <div className="user-info">
          {GSTIN && (
            <div>
              <select
                onChange={inputChange}
                id="invoice-type"
                name="invoiceType"
                value={purchaseData.invoiceType}
                className="w-100"
              >
                <option value="NoGST">No GST</option>
                <option value="GST">GST</option>
              </select>
            </div>
          )}

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
              label="Supplier Name*"
              variant="standard"
              name="supplierName"
              value={purchaseData.supplierName}
              onChange={inputChange}
              className="w-100"
              InputLabelProps={{
                style: { paddingLeft: "10px" }, // Adjust the padding value as needed
              }}
            />
            {/* <input type="text" name="supplierName" id="supplierName" value={purchaseData.supplierName} onChange={nameSuppHandle} /> */}
          </div>

          <div className="d-flex justify-content-between gap-1 date-bill">
            <div>
              <input
                onChange={inputChange}
                type="date"
                value={addedItems.date ? addedItems.date : formattedDate}
                name="date"
                className="date"
                // max={currentDate}
              />
            </div>

            <div>
              <input
                type="number"
                name="billNum"
                className="billNum"
                value={purchaseData.billNum}
                onChange={inputChange}
                placeholder="Bill no."
              />
            </div>
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
              label="Product Name*"
              variant="standard"
              className="w-100"
              name="name"
              value={addedItems.name}
              onChange={saleItemChange}
              InputLabelProps={{
                style: { paddingLeft: "10px" }, // Adjust the padding value as needed
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
            <div className="input-fileds">
              <select
                onChange={saleItemChange}
                id="unit"
                name="unit"
                value={addedItems.unit}
                className="unit-select"
              >
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
            <div className="input-fileds">
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

          <div className="fields-inp">
            <div className="input-fileds">
              <input
                onChange={saleItemChange}
                type="number"
                id="purchase-price"
                className="purchase-price"
                name="purchasePrice"
                value={addedItems.purchasePrice}
                placeholder="Purchase price*"
              />
            </div>

            <div className="input-fileds">
              <input
                onChange={saleItemChange}
                type="number"
                id="sale-price"
                className="sale-price sale-inp"
                name="salePrice"
                value={addedItems.salePrice}
                placeholder="Sale price"
              />
            </div>
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
                placeholder=" Discount %"
              />
            </div>
            {GSTIN && (
              <div className="input-fileds">
                <div className="position-relative">
                  <input
                    onChange={saleItemChange}
                    type="number"
                    id="gst"
                    className="gst"
                    name="gst"
                    value={addedItems.gst}
                    disabled={purchaseData.invoiceType === "NoGST"}
                  />
                  <span className="percent-div"> GST%</span>
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
          {purchaseData.purchaseItem.map((item, index) => (
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

        <div className="sale-invoice-footer w-100">
          <div className="w-100 px-3">
            <div className="w-100">
              <select
                onChange={inputChange}
                id="payMode"
                name="payMode"
                value={purchaseData.payMode}
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
              <div>{grandTotal ? grandTotal : "0.00"}</div>
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
              onClick={savePurchase}
              variant="extended"
            >
              <SaveIcon sx={{ mr: 2 }} />
              Save
            </Fab>
          </div>
        </div>
      </div>
    </>
  );
}

export default PurchaseInvoice;
