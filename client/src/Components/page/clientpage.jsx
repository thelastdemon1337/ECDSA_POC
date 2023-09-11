// import React, { useState } from "react";
// import "./page.css";
// import { ethers } from "ethers";
// import img2 from "./images/img2.png";
// import VerifyFileSignature from "../VerifyMessage";
// const ClientPage = () => {
  
//   return (
//     <div className="body">
//       <div className="description ">
//         <div className="description-image">
//           <img src={img2} alt="Image 1" />
//         </div>
//         <div className="description-content">
//           <h2>Verification Made Simple!</h2>
//           <p>
//             Instantly verify with the university if the student-submitted
//             certificates are genuine. Easily download verified certificates for
//             your records. Rest assured that the information is accurate and
//             tamper-proof, thanks to our blockchain-based solution.
//           </p>
//           <div className="feature-box white-glassmorphism p-3 m-2">
//             <div className="flex flex-row items-center cursor-pointer">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//               <span className="ml-2">
//                 Verify submitted student certificates instantly with the
//                 university, ensuring authenticity and accuracy.
//               </span>
//             </div>
//           </div>
//           <div className="white-glassmorphism p-3 m-2">
//             <div className="flex flex-row items-center cursor-pointer">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//               <span className="ml-2">
//                 Download verified certificates effortlessly for your records,
//                 backed by our tamper-proof blockchain technology.
//               </span>
//             </div>
//           </div>
//           <div className="white-glassmorphism p-3 m-2">
//             <div className="flex flex-row items-center cursor-pointer">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//               <span className="ml-2">
//                 Streamline the verification process with a single button click
//                 for signature verification, making it convenient and
//                 hassle-free.
//               </span>
//             </div>
//           </div>
//           {/* Add more feature boxes */}
//         </div>
//       </div>
//       {/* <FileUpload /> Include the updated FileUpload component here */}
//       {metaMaskConn?<VerifyFileSignature />:(
//         <button onClick={btnhandler}>Connect Metamask</button>
//       )}
//     </div>
//   );
// };

// export default ClientPage;
import React, { useState } from "react";
// import "./page.css";
import "./universitypage.css"
import img2 from "./images/img2.png";
import VerifyFileSignature from "../VerifyMessage";
import Navbar from "../Navbar";
import img1 from "./images/img1.jpg";

const ClientPage = () => {
  const [metaMaskConn,setMetaMaskConn] = useState(false)
  
  return (
    <div className="university__wrapper">
     <Navbar metamaskConnected={metaMaskConn} showMetaMaskBtnConn={setMetaMaskConn}/>
      <div className="university__description">
        <div className="university__3d__model__container">
          <img src={img1} alt="3Dlogo" />
        </div>
        <div className="university__features__container">
          <div className="university__features__inner__container">
          <div className="university__features__heading">
          <h2>Verification Made Simple!</h2>
          <p>
            Instantly verify with the university if the student-submitted
            certificates are genuine. Easily download verified certificates for
            your records. Rest assured that the information is accurate and
            tamper-proof, thanks to our blockchain-based solution.
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
              Verify submitted student certificates instantly with the
                university, ensuring authenticity and accuracy.              </span>
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
              Download verified certificates effortlessly for your records,
                backed by our tamper-proof blockchain technology.              </span>
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
              Streamline the verification process with a single button click
                for signature verification, making it convenient and
                hassle-free.              </span>
              </div>
          </div>
        </div>
      </div>
      <div className="university__sign__container">
      
      {metaMaskConn?<VerifyFileSignature />:(
        <p>Metamask not Connected</p>
      )}

      </div>
    </div>
  );
};

export default ClientPage;

