import React from "react";
import { jsPDF } from "jspdf";

const ThermalInvoice = () => {
  const generateThermalPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: [2, 4], // Example thermal printer size in inches (portrait)
    });

    doc.text("Thermal Printer Size PDF Content", 0.1, 0.1); // Example content
    doc.save("thermal.pdf");
  };

  return (
    <>
      <span onClick={generateThermalPDF}>Theraml Print</span>
    </>
  );
};

export default ThermalInvoice;
