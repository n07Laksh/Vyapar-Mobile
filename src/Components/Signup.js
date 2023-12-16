import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Device } from "@capacitor/device";
import Spinner from "./Spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = (props) => {
  const [spin, setSpin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState(false);

  const [info, setInfo] = useState(null);

  useEffect(() => {
    const getDeviceinfo = async () => {
      const deviceInfo = await Device.getInfo();
      setInfo(deviceInfo);
    };

    getDeviceinfo();
  }, []);

  const handleConfirmPass = (event) => {
    if (name && email && password) {
      setConfirmPassword(event.target.value);
    }
  };

  const handleSingup = async () => {
    try {
      if (confirmPassword === password) {
        setSpin(true);
        // let data = await fetch("https://billing-soft-backend-production.up.railway.app/auth/signup", {
        let data = await fetch("http://15.206.158.47:8001/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            name: name,
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
          toast.warn(data.message);
          setSpin(false);
        }
      } else {
        toast.error("Password Did Not Matched");
        setErr(true);
        setSpin(false);
      }
    } catch (error) {
      toast.error("Some Error Accured Try Again");
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
        <div className="text-center spinner">
          <Spinner />
        </div>
      ) : (
        <div className="login-signup">
          <div className="login-logo-container signup-logo-container">
            <div>Sign Up</div>
            <div></div>
          </div>
          <div className="login-container">
            <form className="container my-4">
              <div className="form-outline">
                <input
                  type="text"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  id="name"
                  className="form-control"
                  placeholder="User Name"
                />
              </div>

              <div className="form-outline my-4">
                <input
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  id="email"
                  className="form-control"
                  placeholder="Email address"
                />
              </div>

              <div className="form-outline">
                <input
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  id="password"
                  className="form-control"
                  placeholder="Password"
                />
              </div>

              <div className="form-outline my-4">
                <input
                  type="password"
                  onChange={handleConfirmPass}
                  value={confirmPassword}
                  id="password"
                  className={`${
                    err ? "border border-danger" : ""
                  } form-control`}
                  placeholder="Confirm Password"
                />
              </div>

              <div className="row mb-3">
                <div className="col d-flex justify-content-center"></div>
              </div>

              <button
                type="button"
                onClick={handleSingup}
                // disabled={!(name && email && password && confirmPassword)}
                className="btn mb-4 w-100"
              >
                Signup
              </button>
              <div className="text-center">
                <p>
                  Already have any account?{" "}
                  <Link to="*" className="login-signup-router text-success">
                    Login
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

export default Signup;
