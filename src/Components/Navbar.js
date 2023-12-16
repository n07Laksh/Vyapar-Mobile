import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Dexie from "dexie";
// import fetch from 'node-fetch';
import Logo from "../images/tts-logo.png";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

function Navbar() {
  const [online, setOnline] = useState(navigator.onLine);

  const user = JSON.parse(localStorage.getItem("userData"));
  const userAdd = JSON.parse(localStorage.getItem("userAdd"));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setOnline(navigator.onLine);
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const divStyle = {
    color: `${online ? "green" : "red"}`,
  };

  //   const dailySale = new Dexie(`dailySale_${user.name}`);
  const dailySale = new Dexie(`dailySale`);
  dailySale.version(5).stores({
    sales: "++id,clientName", // '++id' is an auto-incremented unique identifier
  });
  const dailyPurchase = new Dexie("dailyPurchase");
  dailyPurchase.version(5).stores({
    purchases: "++id,supplierName", // '++id' is an auto-incremented unique identifier
  });

  // Function to fetch data from IndexedDB
  async function fetchDataFromIndexedDB() {
    try {
      // Fetch unsynced sales records from IndexedDB
      const unsyncedSales = await dailySale.sales.toArray();
      const unsyncedPurchase = await dailyPurchase.purchases.toArray();

      // Return the unsynced sales data
      return [unsyncedSales, unsyncedPurchase];
    } catch (error) {
      toast.error("Error fetching data from IndexedDB:", error);
      throw error;
    }
  }

  // Function to upload data to the Node.js API for Sales
  async function uploadSalesDataToNodeServer(dataToUpload) {
    const apiUrl =
      "https://billing-soft-backend-production.up.railway.app/product/saledata"; // Replace with your Sale API endpoint

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToUpload),
      });

      if (response.ok) {
        // Data uploaded successfully, mark as synced and delete from IndexedDB
        await markDataAsSynced(dataToUpload, dailySale.sales);
      } else {
        toast.error("Error uploading Sales data:", response.statusText);
      }
    } catch (error) {
      toast.error("Error uploading Sales data:", error);
    }
  }

  // Function to upload data to the Node.js API for Purchases (similar logic as Sales)
  async function uploadPurchasesDataToNodeServer(dataToUpload) {
    const apiUrl =
      "https://billing-soft-backend-production.up.railway.app/product/purchasedata"; // Replace with your Purchases API endpoint

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToUpload),
      });

      if (response.ok) {
        // Data uploaded successfully, mark as synced and delete from IndexedDB
        await markDataAsSynced(dataToUpload, dailyPurchase.purchases);
      } else {
        toast.error("Error uploading Purchases data:", response.statusText);
      }
    } catch (error) {
      toast.error("Error uploading Purchases data:", error);
    }
  }

  // Function to mark data as synced and delete from IndexedDB
  async function markDataAsSynced(dataToUpload, table) {
    const idsToDelete = dataToUpload.map((item) => item.id);

    try {
      // Delete the uploaded records from IndexedDB
      await table.where("id").anyOf(idsToDelete).delete();
    } catch (error) {
      console.error(
        "Error marking data as synced and deleting from IndexedDB:",
        error
      );
    }
  }

  // Example usage within your syncData function:
  async function syncData() {
    if (online) {
      try {
        const dataToUpload = await fetchDataFromIndexedDB();

        if (dataToUpload[0].length > 0) {
          await uploadSalesDataToNodeServer(dataToUpload[0]);
        }

        if (dataToUpload[1].length > 0) {
          await uploadPurchasesDataToNodeServer(dataToUpload[1]);
        }

        toast.success("Data synchronization complete.");
      } catch (error) {
        toast.error("Error during data synchronization:", error);
      }
    } else {
      toast.warn("You are offline. Data cannot be synced at the moment.");
    }
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="nav-bar">
        <nav className="navbar navbar-expand-lg nav-div bg-body-tertiary ">
          <div className="container-fluid justify-content-between">
            {/* <button onClick={syncData} className={`btn btn-${online ? "success" : "danger"} btn-sm sync`}>Sync</button> */}

            <Link to="/" className="d-flex">
              <div style={{ width: "25px" }}>
                <img src={Logo} alt="" width="100%" />
              </div>
              <div className="tribe-app">Tribe App</div>
            </Link>
            <Link to="/user" className="me-1 business-name" style={divStyle}>
              {userAdd && userAdd.shopName ? userAdd.shopName : "Business Name"}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}

export default Navbar;
