import React, { useEffect, useState } from 'react'

const ShopDetails = () => {
  const [shopName, setShopName] = useState("Name");
  const [shopAddress, setShopAddress] = useState(" Address");
  const [shopContact, setShopContact] = useState(" Contact");

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("userData")))


  const getUserDetail = () => {

    // const userData = JSON.parse(localStorage.getItem(`userAdd_${user.name}`));
    const userData = JSON.parse(localStorage.getItem(`userAdd`));

    if (userData) {
      setShopName(userData.shopName);
      setShopAddress(userData.shopName);
      setShopContact(userData.contact);
    }
  }

  useEffect(() => {
    getUserDetail();
  }, [])

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    // const savedImage = localStorage.getItem(`profilePicture_${user.name}`);
    const savedImage = localStorage.getItem(`profilePicture`);
    if (savedImage) {
      setImagePreview(savedImage);
    }
  }, []);

  return (
    <div className='shop-details d-flex gap-5 align-content-center border-end'>
      <div>
        <img src={imagePreview} className="print-logo" alt="" />
      </div>
      <div>
        <h5 className="shop-name">{shopName}</h5>
        <div className="shop-address text-muted"><i className="fa-solid fa-location-dot me-2 "></i>{shopAddress}</div>
        <div className="shop-phone"><i className="fa-solid fa-phone text-muted me-2"></i>{shopContact}</div>
        <div className="shop-email"><i className="fa-solid fa-at text-muted me-2"></i>{user && user.email}</div>
      </div>
    </div>
  )
}

export default ShopDetails
