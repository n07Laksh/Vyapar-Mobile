import React, { useEffect, useState } from "react";
import Dexie from "dexie";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

const Balance = () => {
  const user = JSON.parse(localStorage.getItem("userData"));

  const [todaySale, setTodaySale] = useState("00");
  const [totalSale, setTotalySale] = useState("00");
  const [totalPurchase, setTotalPurchase] = useState("00");
  const [previousSale, setPreviousSale] = useState("00");
  const [previousMonthPurchase, setPreviousMonthPurchase] = useState("00");

  // Create Dexie database
  // const saleDB = new Dexie(`sale_${user.name}`);
  const saleDB = new Dexie(`sale`);
  saleDB.version(4).stores({
    saleItems: "++id,today,clientName",
  });

  // const purchaseDB = new Dexie(`purchase_${user.name}`);
  const purchaseDB = new Dexie(`purchase`);
  purchaseDB.version(4).stores({
    purchaseData: "++id,today", 
  });

  useEffect(() => {
    async function retrieveItemsForCurrentDate(db) {
      const now = new Date();
      const currentDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10);

      try {
        const items = await db.where("today").equals(currentDate).toArray();
        return items;
      } catch (error) {
        return [];
      }
    }

    // Example usage for calculating today's total sale
    retrieveItemsForCurrentDate(saleDB.saleItems).then((items) => {
      if (items.length > 0) {
        const totalSaleAmount = items.reduce((sum, item) => {
          if (item.saleItem) {
            return (
              sum + parseFloat(item.saleItem.reduce((acc, sale) => acc + sale.amount, 0))
            );
          }
          return sum;
        }, 0);

        setTodaySale(totalSaleAmount);
      } else {
        setTodaySale("00");
      }
    });

    // Function to retrieve items for the grand Total till now and calculate
    async function retrieveAllItems(db) {
      try {
        const items = await db.toArray();
        return items;
      } catch (error) {
        return [];
      }
    }

    retrieveAllItems(saleDB.saleItems).then((items) => {
      if (items.length > 0) {
        // Calculate total amount for sales
        const totalSaleAmount = items.reduce((sum, item) => {
          if (item.saleItem) {
            return (
              sum + parseFloat(item.saleItem.reduce((acc, sale) => acc + sale.amount, 0))
            );
          }
          return sum;
        }, 0);
        setTotalySale(totalSaleAmount);
      } else {
        setTotalySale("00");
      }
    });

    retrieveAllItems(purchaseDB.purchaseData).then((items) => {
      if (items.length > 0) {
        // Calculate total amount for purchases
        const totalPurchaseAmount = items.reduce((sum, item) => {
          if (item.purchaseItem) {
            return (
              sum +
              item.purchaseItem.reduce((acc, sale) => acc + sale.amount, 0)
            );
          }
          return sum;
        }, 0);
        setTotalPurchase(totalPurchaseAmount);
      } else {
        setTotalPurchase("00");
      }
    });

    // Function to retrieve items for the previous month's total sale or purchase and calculate
    async function retrievePreviousMonthItems(db) {
      const currentDate = new Date();
      const previousMonthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1
      );

      const startOfMonth = new Date(
        previousMonthDate.getFullYear(),
        previousMonthDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        previousMonthDate.getFullYear(),
        previousMonthDate.getMonth() + 1,
        0
      );

      try {
        const items = await db
          .where("today")
          .between(
            startOfMonth.toISOString().substr(0, 10),
            endOfMonth.toISOString().substr(0, 10)
          )
          .toArray();
        return items;
      } catch (error) {
        console.error("Error retrieving items:", error);
        return [];
      }
    }

    // Example usage for calculating the previous month's total sale
    retrievePreviousMonthItems(saleDB.saleItems).then((items) => {
      if (items.length > 0) {
        const totalPreviousMonthSale = items.reduce((sum, item) => {
          if (item.saleItem) {
            return (
              sum + item.saleItem.reduce((acc, sale) => acc + sale.amount, 0)
            );
          }
          return sum;
        }, 0);
        setPreviousSale(totalPreviousMonthSale);
      } else {
        setPreviousSale("00");
      }
    });

    // Example usage for calculating the previous month's total purchase
    retrievePreviousMonthItems(purchaseDB.purchaseData).then((items) => {
      if (items.length > 0) {
        const totalPreviousMonthPurchase = items.reduce((sum, item) => {
          if (item.purchaseItem) {
            return (
              sum +
              item.purchaseItem.reduce((acc, sale) => acc + sale.amount, 0)
            );
          }
          return sum;
        }, 0);

        setPreviousMonthPurchase(totalPreviousMonthPurchase);
      } else {
        setPreviousMonthPurchase("00"); // Set zero if no items found
      }
    });
  }, []);



  return (
    <>
      <Box
        sx={{
          // margin: "5px"
          width: "100%",
        }}
      >
        <Paper
          sx={{
            padding: "10px",
            borderRadius: "40px 40px 0 0",
            boxShadow: "0px 0.5px 170px transparent",
            background: "transparent",
          }}
          elevation={2}
        >
          <div className="d-flex justify-content-around mt-3">
            <div className="today w-50">
              <div>
                <div className="today-title fw-bold">Today Sale</div>
                <div className="today-amount w-100" style={{overflow:"auto"}}>{todaySale}</div>
              </div>
            </div>

            <div className="total w-50">
              <div>
                <div className="total-title fw-bold">Total Sale</div>
                <div className="total-amount w-100" style={{overflow:"auto"}}>{totalSale}</div>
              </div>
            </div>
          </div>
        </Paper>
      </Box>
    </>
  );
};

export default Balance;
