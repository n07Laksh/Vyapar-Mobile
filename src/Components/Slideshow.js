import React from 'react';
// import BillUI from "../images/billui.jpg"
import BillUI from "../images/bill.jpg"
function Slideshow() {


  return (
    <div style={{background: "black",height: "305px"}}>
      <div className="slideshow-container">
        <div className={`mySlides active`}>
          <img src={BillUI} alt="Slide 1" />
        </div>
      </div>
    </div>
  );
}

export default Slideshow;

