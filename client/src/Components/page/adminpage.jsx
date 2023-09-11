import React from "react";
import "./page.css";
import img3 from "./images/img3.png";
import StudentForm from "../AircAdmin";
import "./universitypage.css"
import img1 from "./images/img1.jpg";
import Navbar from "../Navbar";


const AdminPage = () => {
  return (
    <div className="university__wrapper">
     <Navbar showMetaMaskBtn={false} />
      <div className="university__description">
        <div className="university__3d__model__container">
          <img src={img1} alt="3Dlogo" />
        </div>
        <div className="university__features__container">
          <div className="university__features__inner__container">
          <div className="university__features__heading">
          <h2>Comprehensive Student Database!</h2>
          <p>
            Manage student information effortlessly. Maintain an up-to-date
            database to ensure accurate verification
          </p>
          </div>
              <div className="university__feature">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="ml-2">
              Streamlined student info management with user-friendly
                interface.
              </span>
              </div>
              <div className="university__feature">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="ml-2">
              Real-time data synchronization for accurate and efficient
                record-keeping.
              </span>
              </div>
              <div className="university__feature">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="ml-2">
              Customizable user access levels ensure data security and
                privacy.
              </span>
              </div>
          </div>
        </div>
      </div>
      {/* <div className="university__sign__container"> */}
      
      <StudentForm />
      {/* </div> */}
    </div>
  );
};

export default AdminPage;
