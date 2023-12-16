import React from 'react'

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import Sale from "../images/receipt.gif"
import Records from "../images/records.gif"
import Shopping from "../images/shopping.gif"
import Stock from "../images/pallete.gif"
import { useNavigate } from 'react-router-dom';

const Service = () => {
    const navigate = useNavigate();

    const handleRoute = (route) => {
        navigate(`/${route}`);
    };
    return (
        <>
            <div className='w-100 mt-5'>
                <Box>
                    <div className='container service ps-4'>Service's</div>
                    <Paper
                        sx={{
                            padding: "20px 30px",
                            boxShadow:"0px 0px 0px transparent",
                            borderRadius:"30px",
                        }}
                        elevation={2}>
                        <div>
                            <div className='service-btn-container'>
                                <div onClick={() => handleRoute("saleinvoice")} className='service-btn-container-child'>
                                    <div className='service_btn'>
                                        <img src={Sale} alt="" />
                                    </div>
                                    <div>
                                        Invoice
                                    </div>
                                </div>
                                <div onClick={() => handleRoute("purchase")} className='service-btn-container-child'>
                                    <div className='service_btn'>
                                        <img src={Shopping} alt="" />
                                    </div>
                                    <div>
                                        Purchase
                                    </div>
                                </div>
                                <div onClick={() => handleRoute("records")} className='service-btn-container-child'>
                                    <div className='service_btn'>
                                        <img src={Records} alt="" />
                                    </div>
                                    <div>
                                        Records
                                    </div>
                                </div>

                                <div onClick={() => handleRoute("stock")} className='service-btn-container-child'>
                                    <div className='service_btn'>
                                        <img src={Stock} alt="" />
                                    </div>
                                    <div>
                                        Stocks
                                    </div>
                                </div>

                            </div>
                        </div>
                    </Paper>
                </Box>
            </div>
        </>
    )
}

export default Service
