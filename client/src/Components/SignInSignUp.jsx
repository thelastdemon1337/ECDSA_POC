// NewSignInSignUpPage.js

import React, { useState } from "react";
import axios from "axios";
import "./SignInSignUp.css";
import logoImage from "./images/logo.png";
import { useNavigate } from "react-router-dom";

const SignInSignUpPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpOption, setSignUpOption] = useState("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showError,setShowError] = useState(false)
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const URID = process.env.REACT_APP_NGROK_BACKEND_URI
  // const URID = "http://localhost:5000"
  const config = {
    headers: {
      "ngrok-skip-browser-warning": true
    }
  }
  const handleToggleForm = () => {
    setShowSignUp(!showSignUp);
    setError("");
  };

  const handleSignIn = async () => {
    // Implement your sign-in logic here
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    // if (!email.endsWith("woxsen.edu.in")) {
    //   setError("Only woxsen.edu.in emails are supported.");
    //   return;
    // }
    try {
      // console.log(`URI : ${process.env.REACT_APP_BACKEND_URI} \n URI_D: ${process.env.REACT_APP_BACKEND_URI_D}`)
      console.log(`Sending URL request to: ${URID}/api/auth/signup`)
      if(password != confirmPassword){
        setError("Passwords do not match")
      }
      else if(password == confirmPassword){
        const response = await axios.post(
          `${URID}/api/auth/signup`,
          {
            username: name,
            userType: signUpOption,
            email,
            password,
          }, config
        );
        console.log(response);
        sendOTP();
        setError("")
      } // This should print the response from the server
      // Set otpSent to true after successful sign up
    } catch (error) {
      console.error(error?.response?.data?.message);
      setShowError(true)
      setError(error?.response?.data?.message)
    }
  };

  // Login Api
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${URID}/api/auth/login`,
        {
          email,
          password,
        }, config
      );
      // This should print the response from the server
      console.log(response.data);
      console.log("UserType:", response.data.userType);
      if (response.data.userType == "university") {
        navigate("/university");
      } else if (response.data.userType == "client") {
        navigate("/company");
      }
      // navigate("/signMessage")
      setLoginSuccess(true);
      // navigate()
      const { token, userId } = response.data;

    } catch (error) {
      console.error(error.response.data.message);
      setShowError(true)
      setError(error.response.data.message)
    }
  };

  // OTP Validation
  const handleOTPValidation = async () => {
    try {
      const response = await axios.post(
        `${URID}/api/auth/otp/validate`,
        {
          email,
          otp,
        }, config
      );
      console.log(response.data); // This should print the response from the server
      handleToggleForm();
      const { token, userId } = response.data;

      
      handleToggleForm();
    } catch (error) {
      setError(error.response.data.message);
    }
  };
  const sendOTP = async () => {
    setOtpSent(true);
  };

  return (
    <div className="body">
      <img src={logoImage} alt="Logo" className="logo" />
      <div className={`cont ${showSignUp ? "s-sign-up" : ""}`}>
        {!showSignUp && (
          <div className="video video-right">
            <video autoPlay loop muted>
              <source src={`https://bucket-with-the-only-name-like-this.s3.ap-south-1.amazonaws.com/bg_video.mp4`} type="video/mp4" />
            </video>
          </div>
        )}
        <div className={`form ${showSignUp ? "sign-up" : "sign-in"}`}>
          {showSignUp && !otpSent && (
            <div className="form-content sign-up">
              <h2>Sign Up</h2>

              <label className="label">
                <span className="span">Name</span>
                <input
                  className="input"
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label className="label">
                <span className="span">WOXSEN Mail</span>
                <input
                  className="input"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="label">
                <span className="span">Password</span>
                <input
                  className="input"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <label className="label">
                <span className="span">Confirm Password</span>
                <input
                  className="input"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>
              <label className="label">
                <span className="span">Sign Up As</span>
                <select
                  className="input"
                  value={signUpOption}
                  onChange={(e) => setSignUpOption(e.target.value)}
                >
                  <option value="client">Client</option>
                  <option value="university">University</option>
                </select>
              </label>
              <button type="button" className="submit" onClick={handleSignUp}>
                Send OTP
              </button>
              {/* {showError && <p>{error}</p>} */}
              {error && <p className="error">{error}</p>}
              <label>If already registered then </label>
              <span className="link" onClick={handleToggleForm}>
                Sign In
              </span>
            </div>
          )}
          {showSignUp && otpSent && (
            <div className="form-content sign-up">
              <h2>Verify Email</h2>
              <label className="label">
                <span className="span">Enter OTP</span>
                <input
                  className="input"
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="submit"
                onClick={handleOTPValidation}
              >
                Verify OTP
              </button>
              {error && <p className="error">{error}</p>}
            </div>
          )}
          {!showSignUp && (
            <div className="form-content sign-in">
              <h2>Sign In</h2>
              <label className="label">
                <span className="span">WOXSEN Email Address</span>
                <input
                  className="input"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="label">
                <span className="span">Password</span>
                <input
                  className="input"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <button className="submit" type="button" onClick={handleLogin}>
                Sign In
              </button>
              {loginSuccess && <p className="error">Login Successefull</p>}
              {error && <p className="error">{error}</p>}
              <label>If not registered yet</label>
              <span className="link" onClick={handleToggleForm}>
                Sign Up
              </span>
            </div>
          )}
        </div>
        {showSignUp && (
          <div className="video">
            <video autoPlay loop muted>
              <source src={`https://bucket-with-the-only-name-like-this.s3.ap-south-1.amazonaws.com/bg_video.mp4`} type="video/mp4" />
            </video>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignInSignUpPage;