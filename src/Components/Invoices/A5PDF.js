import React from "react";
import Logo from "./tts-logo.png";
import { toast } from "react-toastify";
import { Share } from "@capacitor/share";
import A4 from "./a4.png";
import A5 from "./a5.png";

function A5PDF(props) {
  const { item } = props;

  const shop = JSON.parse(localStorage.getItem("userData"));
  let img;
  const baseImg = localStorage.getItem(`profilePicture`);
  if (baseImg) {
    img = Logo;
  } else {
    img = Logo;
  }
  const gst = localStorage.getItem(`GSTIN`);
  const add = JSON.parse(localStorage.getItem(`userAdd`));

  const handleDownload = async (endPoint) => {
    if (add && item) {
      try {
        const res = await fetch(
          `http://localhost:8001/invoice/${endPoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ item: item, img: img, gst: gst, add: add }),
          }
        );

        // Check if the response status is OK (200) before attempting to read the response
        // if (res.ok) {
        //   const blob = await res.blob(); // Get the response as a Blob object
        //   const url = window.URL.createObjectURL(blob); // Create a URL for the Blob

        //   // Create a link element to trigger the download
        //   const link = document.createElement("a");
        //   link.href = url;
        //   link.download = `${item.clientName}.pdf`; // Set the download attribute with desired file name
        //   document.body.appendChild(link);

        //   // Programmatically trigger the download
        //   link.click();

        //   // Cleanup: remove the link and revoke the URL object
        //   link.parentNode.removeChild(link);
        //   window.URL.revokeObjectURL(url);
        // }
        if (res.ok) {
          const blob = await res.blob(); // Get the response as a Blob object
          const fileName = `${item.clientName}.pdf`;

          // Create a temporary file URL for the Blob object
          const url = window.URL.createObjectURL(blob);

          // Share the PDF file using Capacitor's Share API
          try {
            await Share.share({
              title: "Share PDF",
              file: url,
              filename: fileName,
              dialogTitle: "Share PDF File",
            });
          } catch (error) {
            alert(error);
            toast.error("catch block", error);
          }

          // Cleanup: revoke the temporary file URL
          window.URL.revokeObjectURL(url);
        } else {
          toast.error("Failed to fetch PDF:", res.statusText);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error downloading PDF:", error);
      }
    } else {
      toast.error("Something Error Refresh & Try Again");
    }
  };

  return (
    <>
    <div className="d-flex gap-3">
      <div style={{ width: "20px" }} onClick={() => handleDownload("generate-a5pdf")}>
        <img style={{ width: "100%" }} src={A5} alt="" />
      </div>
      <div style={{ width: "20px" }} onClick={() => handleDownload("generate-a4pdf")}>
        <img style={{ width: "100%" }} src={A4} alt="" />
      </div>
      </div>
    </>
  );
}

export default A5PDF;
