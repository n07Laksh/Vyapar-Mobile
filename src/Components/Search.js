import Dexie from 'dexie';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner'

import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const Search = () => {
    const [spin, setSpin] = useState(false)
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [searchType, setSearchType] = useState('sale'); // Default to searching for sale items
    const [searchMethod, setSearchMethod] = useState('offline'); // Default to searching for sale items
    const [searchTypeKeyPath, setSearchTypeKeyPath] = useState('');

    const user = JSON.parse(localStorage.getItem("userData"));

    //style for names 
    let nameStyle = {
        fontSize: "0.8rem",
    };

    useEffect(() => {
        setSearchTypeKeyPath(searchType === 'sale' ? 'clientName' : 'supplierName');
    }, [searchType]);

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

    const [searchData, setSearchData] = useState({ text: "", firstDate: formattedDate, lastDate: formattedDate });


    const inputChange = (event) => {
        setSearchData({
            ...searchData,
            [event.target.name]: (event.target.value).toLowerCase(),
        });
    }


    // Create Dexie database for sale
    // const saleDB = new Dexie(`sale_${user.name}`);
    const saleDB = new Dexie(`sale`);
    saleDB.version(4).stores({
        saleItems: '++id,today,clientName',
    });

    // Create Dexie database for purchase
    // const purchaseDB = new Dexie(`purchase_${user.name}`);
    const purchaseDB = new Dexie(`purchase`);
    purchaseDB.version(4).stores({
        purchaseData: '++id, billNum, supplierName, ate',
    });



    // Function to search items in the Dexie database across all fields
    async function searchItemsInDB(searchQuery, keyPathName, db, startDate, endDate) {

        try {
            if (searchTypeKeyPath === "date") {

                try {
                    const dataInRange = await db.where('today').between(startDate, endDate).toArray();
                    return dataInRange;
                } catch (error) {
                    toast.error('Error retrieving data between dates');
                    return [];
                }
            }

            const result = await db.where(keyPathName).startsWithIgnoreCase(searchQuery).toArray();
            const searchResults = [];

            result.forEach(item => {
                // Loop through each property of the object
                for (const key in item) {
                    if (item[key].toString().toLowerCase().includes(searchQuery.toLowerCase())) {
                        searchResults.push(item);
                        break; // No need to continue checking other properties for this item
                    }
                }
            });
            return searchResults;

        } catch (error) {
            toast.error('Error searching for items');
            return [];
        }
    }

    // ...

    // Inside your handleSearch function
    const handleSearch = async (event) => {
        event.preventDefault();
        setData(null);

        if (searchType === 'sale') {
            let searchVal = { searchTxt: searchTypeKeyPath !== "date" ? searchData.text : null, firstDate: searchData.firstDate, lastDate: searchData.lastDate };

            if (searchMethod === "online") {
                setSpin(true)
                // Create a URL with query parameters
                // const url = "https://billing-soft-backend-production.up.railway.app/product/searchsale";
                const url = "http://localhost:8000/product/searchsale";

                let data = await fetch(url, {
                    method: "POST",
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(searchVal)

                })
                data = await data.json();
                if (!data.error) {
                    setData(data.data);
                    setSpin(false)
                } else {
                    toast.error(data.message);
                    setSpin(false)
                }
            } else {
                // Search sale items
                const saleSearchResults = await searchItemsInDB(searchData.text, searchTypeKeyPath, saleDB.saleItems, searchData.firstDate, searchData.lastDate);
                if (saleSearchResults.length == 0) {
                    toast.error("Use The Correct Value");
                    setSpin(false)
                    return;
                }

                setData(saleSearchResults)
                setSpin(false)
            }

            // Use saleSearchResults for further processing
        } else if (searchType === 'purchase') {

            if (searchMethod === "online") {
                setSpin(true)
                let searchVal = {
                    ...(searchTypeKeyPath === "billNum"
                        ? { billNum: searchTypeKeyPath !== "date" ? searchData.text : null }
                        : { searchTxt: searchTypeKeyPath !== "date" ? searchData.text : null }),
                    firstDate: searchData.firstDate,
                    lastDate: searchData.lastDate
                }
                // Create a URL with query parameters
                const url = "https://billing-soft-backend-production.up.railway.app/product/searchpurchase"

                let data = await fetch(url, {
                    method: "POST",
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(searchVal)
                })
                data = await data.json();
                if (!data.error) {
                    setData(data.data);
                    setSpin(false)
                } else {
                    toast.error(data.message);
                    setSpin(false)
                }
            } else {
                // Search purchase items
                const purchaseSearchResults = await searchItemsInDB(searchData.text, searchTypeKeyPath, purchaseDB.purchaseData, searchData.firstDate, searchData.lastDate);
                if (purchaseSearchResults.length == "0") {
                    toast.error("Use The Correct Value");
                    setSpin(false)
                    return;
                }

                setData(purchaseSearchResults);
                setSpin(false)
                // Use purchaseSearchResults for further processing
            }
        }
    }


    function calculateDaysPassed(saleDate) {
        const today = new Date();
        const saleDateTime = new Date(saleDate);

        const timeDifference = today - saleDateTime;
        const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));



        return daysPassed == "0" ? "Today" : daysPassed + " day ago";
    }

    return (

        <div className="sale-content-parentdiv p-3">
            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />


            <div className="back-div mb-2">
                <span className="back" onClick={() => navigate(-1)}>&larr;</span><span className="mx-5 h6 "> Search </span>
            </div>
            <div className="search-input">
                <form onSubmit={handleSearch} className='d-flex gap-4'>
                    <div>
                        <div className='border-bottom border-danger'>
                            <div className="form-check form-check-inline mb-2">
                                <input className="form-check-input" type="radio"
                                    value="offline"
                                    checked={searchMethod === 'offline'}
                                    onChange={() => setSearchMethod('offline')} />
                                <label className="form-check-label" htmlFor="inlineRadio2">Offline</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio"
                                    value="online"
                                    checked={searchMethod === 'online'}
                                    onChange={() => setSearchMethod('online')} />
                                <label className="form-check-label" htmlFor="inlineRadio1">Online</label>
                            </div>

                        </div>
                    </div>
                    <div>
                        <div className='border-bottom border-danger'>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio"
                                    value="sale"
                                    checked={searchType === 'sale'}
                                    onChange={() => setSearchType('sale')} />
                                <label className="form-check-label" htmlFor="inlineRadio1">Sale</label>
                            </div>
                            <div className="form-check form-check-inline mb-2">
                                <input className="form-check-input" type="radio"
                                    value="purchase"
                                    checked={searchType === 'purchase'}
                                    onChange={() => setSearchType('purchase')} />
                                <label className="form-check-label" htmlFor="inlineRadio2">Purchase</label>
                            </div>
                        </div>
                        <div className='pt-2'>

                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio"
                                    value="clientName"
                                    disabled={searchType === "purchase"}
                                    checked={searchType === "sale" && searchTypeKeyPath === "clientName"}
                                    onChange={() => setSearchTypeKeyPath("clientName")} />
                                <label className="form-check-label" htmlFor="inlineRadio1">Client Name </label>
                            </div>

                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio"
                                    value="supplierName"
                                    disabled={searchType === "sale"}
                                    checked={searchType === "purchase" && searchTypeKeyPath === "supplierName"}
                                    onChange={() => setSearchTypeKeyPath("supplierName")} />
                                <label className="form-check-label" htmlFor="inlineRadio1">Supplier Name</label>
                            </div>



                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio"
                                    disabled={searchType === "sale"}
                                    value="billNum"
                                    checked={searchTypeKeyPath === 'billNum'}
                                    onChange={() => setSearchTypeKeyPath('billNum')} />
                                <label className="form-check-label" htmlFor="inlineRadio1">Bill No.</label>

                            </div>

                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio"
                                    value="date"
                                    checked={searchTypeKeyPath === 'date'}
                                    onChange={() => setSearchTypeKeyPath('date')} />
                                <label className="form-check-label" htmlFor="inlineRadio1">Date</label>
                            </div>

                        </div>

                    </div>

                    <div>
                        <input onChange={inputChange} className='searchinput p-2' type="search" name="text" id="search" placeholder=' ex. Name, Client Name, Supplier Name, Bill Number' disabled={searchTypeKeyPath === "date"} />
                        <input disabled={searchTypeKeyPath !== "date"} onChange={inputChange} value={searchData.firstDate ? searchData.firstDate : formattedDate} className='searchinput-date p-2 mx-2 mt-1' type="date" name="firstDate" id="firstDate" /> To
                        <input disabled={searchTypeKeyPath !== "date"} onChange={inputChange} value={searchData.lastDate ? searchData.lastDate : formattedDate} className='searchinput-date p-2 ms-3 mt-1' type="date" name="lastDate" id="lastDate" />
                        <button className='btn btn-primary btn-sm searchinput-date ms-3 mt-1' type="submit"><i className='fa-solid fa-search'></i> Search </button>
                    </div>

                </form>
            </div>

            <div className="search-data mt-4">

                <div className="list-group scrollable-div">
                    {
                        data ? (
                            data.map((item, index) => (
                                <a key={index} className="list-group-item list-group-item-action mb-3 " aria-current="true">
                                    <div className="d-flex w-100 justify-content-between">
                                        {item.clientName ? <h6 className="mb-1 text-success"> {item.clientName + " | " + item.clientAddress + " | " + item.clientContact}</h6>
                                            : <h6 className="mb-1 text-success"> {item.supplierName + " | " + item.billNum}</h6>}
                                        <small>{calculateDaysPassed(item.today)}</small>
                                    </div>
                                    <small ><span style={nameStyle}>Name -</span> <span className="text-danger history-text-size-search">{item.name}, </span>
                                        <span style={nameStyle}>Sale-Price -</span> <span className="text-danger history-text-size-search">{item.salePrice}, </span>
                                        <span style={nameStyle}>Quantity -</span> <span className="text-danger history-text-size-search">{item.quantity}, </span>
                                        <span style={nameStyle}>Disc -</span> <span className="text-danger history-text-size-search">{item.disc ? item.disc : "0"}%, </span>
                                        <span style={nameStyle}>Amount -</span> <span className="text-danger history-text-size-search">{item.amount}, </span>
                                        <span style={nameStyle}>Pay-Mode -</span> <span className="text-danger history-text-size-search">{item.payMode}, </span>
                                        <span style={nameStyle}>Date -</span> <span className="text-danger history-text-size-search">{item.date ? item.date : item.today} </span>

                                    </small>
                                </a>
                            ))
                        ) : (
                            <div className="no_data text-center mt-5">
                                {spin ? (
                                    <div className="text-center">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <h5 className='text-danger'>No data available</h5>
                                )}
                            </div>
                        )
                    }



                </div>
            </div>
        </div>
    )
}

export default Search
