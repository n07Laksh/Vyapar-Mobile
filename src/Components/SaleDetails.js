import React from "react";

const SaleDetails = (props) => {
  return (
    <div className="position-relative">
      <div className="sale-texts position-absolute">

        <div className="saleDetails">
          <div className="totalPrice">Total</div>
          <div className="totalPrice">{props.total? props.total: "00"}</div>
        </div>

        <div className="saleDetails">
          <div>Total Discount</div>
          <div>
            {props.discountAmount ? <div>{props.discountAmount }</div> : "00"}
          </div>
        </div>

        <div className="saleDetails">
          <div>Tax %</div>
          <div>
            {props.gstAmount ? <div>{props.gstAmount}</div> : "00"}
          </div>
        </div>

        <div className="saleDetails">
          <div>Round</div>
          <div>{props.fractionalPart > 0 ? props.fractionalPart : "00"}</div>
        </div>

        <div className="saleDetails">
          <div className="totalPrice">Grand-Total</div>  
          <div className="totalPrice">{props.grandTotal ? props.grandTotal.toFixed(0) : "00"}</div>
        </div>

      </div>
    </div>
  );
};

export default SaleDetails;