import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Logo from "../images/tts-logo.png";
import { Device } from "@capacitor/device";

import Spinner from "./Spinner";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [spin, setSpin] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const getDeviceinfo = async () => {
      const deviceInfo = await Device.getInfo();
      setInfo(deviceInfo);
    };

    getDeviceinfo();
  }, []);

  const handleLogin = async () => {
    try {
      if (email !== "" && password !== "" && password.length >= 6) {
        setSpin(true);

        let data = await fetch("http://localhost:8001/auth/login", {
          method: "post",
          body: JSON.stringify({
            email: email,
            password: password,
            mobileDevice: info.model,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        data = await data.json();

        if (!data.error) {
          localStorage.setItem("user", data.user);
          localStorage.setItem("userData", JSON.stringify(data.data));
          props.setLogin(localStorage.getItem("user"));
          localStorage.setItem("lastLoginTime", new Date().getTime());
          setSpin(false);
        } else {
          toast.error(data.message);
          setSpin(false);
        }
      } else {
        toast.warn("Use Correct UserId & Passwords");
        setSpin(false);
      }
    } catch (error) {
      toast.error(`Invalid response try again`);
      setSpin(false);
    }
  };
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

      {spin ? (
        <div className="text-center spinner w-100">
          <Spinner />
        </div>
      ) : (
        <div className="login-signup">
          <div className="login-logo-container">
            <div
              style={{
                width: "70px",
                background: "white",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              <img width="100%" src={Logo} alt="Tribe" />
            </div>
          </div>
          <div className="login-container">
            <h1 className="text-center pb-5 fw-bold">Login</h1>
            <form className="container">
              <div className="form-outline mb-4">
                <input
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  id="email"
                  className="form-control"
                  placeholder="Email"
                />
              </div>

              <div className="form-outline mb-4">
                <input
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  id="password"
                  className="form-control"
                  placeholder="Password"
                />
              </div>

              <div className="row mb-4">
                <div className="col d-flex justify-content-center"></div>

                <div className="col forgot-password-col">
                  <a className="text-danger forgot-password" href="#!">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                // disabled={!(email && password)}
                className="btn mb-4 w-100"
              >
                Sign in
              </button>

              <div className="text-center">
                <p>
                  Don't have any account?{" "}
                  <Link
                    to="/signup"
                    className="login-signup-router text-success"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
