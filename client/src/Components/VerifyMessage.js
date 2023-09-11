import { useState } from "react";
import { ethers } from "ethers";
import ErrorMessage from "./ErrorMessage";
import SuccessMessage from "./SuccessMessage";
import { abi, contractAddress } from "../utils/constants";
import axios from "axios";
import "./SignMessage1.css";


  
const URID = process.env.REACT_APP_NGROK_BACKEND_URI;
// const URID = "http://localhost:5000"
const config = {
  headers: {
    "ngrok-skip-browser-warning": true
  }
}


const fetchBlockchain = async (
  cert_hash,
  setTransactioninfo,
  setShowTransactionInfo,
  setContractAddress,
  setTimeStamp
) => {
  console.log("cert hash", cert_hash);
  console.log("Fetching Data from Blockchain");
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    console.log(contract);
    try {
      const transcript = await contract.transcripts(cert_hash);
      console.log(`Retrieving from : ${contract.address}`);
      setContractAddress(contract.address);

      console.log(transcript.cert_name);
      console.log(transcript.digitalSignature);
      console.log(transcript.signerAddress);
      // api call to return trans_hash to get details (send cert_hash to api and api returns trans_hash)
      const transaction_hash = await axios
        .get(`${URID}/api/transactions/details/${cert_hash}`, config)
        .then((res) => {
          console.log("Transaction Hash", res);
          // console.log("Transaction Hash",res?.data?.transaction_hash?.trans_hash)
          return res?.data?.transaction_hash?.trans_hash;
        })
        .catch((err) => {
          console.log("Error", err);
        });
      // Getting Block info
      // Get transaction details
      const transaction = await provider.getTransaction(transaction_hash);

      if (transaction) {
        setTransactioninfo(transaction);
        setShowTransactionInfo(true);
        console.log("Transaction", transaction);
        // Get the block that contains the transaction
        const block = await provider.getBlock(transaction.blockNumber);

        if (block) {
          // Convert timestamp to JavaScript date
          console.log("Block", block);
          const timestamp = new Date(block.timestamp * 1000);
          const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
          };
          const formattedTimestamp = timestamp.toLocaleString("en-US", options);

          console.log("Transaction Timestamp:", formattedTimestamp);
          console.log(typeof formattedTimestamp);
          setTimeStamp(formattedTimestamp);
        } else {
          console.error("Block not found");
        }
      } else {
        console.error("Transaction not found");
      }
      return transcript;
      // await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error);
    }
  } else {
    alert("Metamask Not Found.");
  }
};

const verifyFileSignature = async ({ file, address, signature }) => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const hashArray = new Uint8Array(
      await crypto.subtle.digest("SHA-256", fileBuffer)
    );
    const hash = ethers.utils.hexlify(hashArray);

    const signerAddr = await ethers.utils.verifyMessage(hash, signature);
    if (signerAddr !== address) {
      return false;
    }

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
const downloadCert = async (fileHash) => {
  try {
    const config = {
      headers: {
        "ngrok-skip-browser-warning": true,
      },
    };
    console.log("Generating Certificate");
    const response = await axios.get(`${URID}/genCert/${fileHash}`, {
      responseType: "blob",
      headers: config.headers,
      // Indicate the response type as a blob
    });

    // console.log(response);
    // console.log(response.json());
    // Create a blob URL for the response data
    const blobUrl = URL.createObjectURL(response.data);

    // Create a temporary link element to trigger the download
    const a = document.createElement("a");
    a.href = blobUrl;
    // fetch the name from db
    a.download = "Genuiness-Certificate.docx"; // Set the desired filename
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Clean up the blob URL
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

export default function VerifyFileSignature() {
  const [error, setError] = useState();
  const [successMsg, setSuccessMsg] = useState();
  const [fileHash, setFileHash] = useState();
  const [transactionInfo, setTransactioninfo] = useState({});
  const [contractAddress, setContractAddress] = useState();
  const [timeStamp, setTimeStamp] = useState();
  const [showTransactionInfo, setShowTransactionInfo] = useState(false);

  const handleVerification = async (e) => {
    e.preventDefault();
    setSuccessMsg();
    setError();
    // setFileHash("");
   try {
    const transcript = await fetchBlockchain(
      fileHash,
      setTransactioninfo,
      setShowTransactionInfo,
      setContractAddress,
      setTimeStamp
    );
    const data = new FormData(e.target);
    const file = data.get("file");
    const signature = transcript.digitalSignature;
    const address = transcript.signerAddress;

    if (!file) {
      setError("Please select a file.");
      return;
    }

    const isValid = await verifyFileSignature({
      file,
      address,
      signature,
    });

    if (isValid) {
      setSuccessMsg("Signature is valid!");
      // await fetch('127.0.0.1:5000/genCert').then(res=>console.log(res))
      // axios.get('http://localhost:5000/genCert', { responseType: 'blob' }).then(res=>console.log(res))
      // fetch and send student details as parameters for downloadCert()
      downloadCert(fileHash);

      // add function to generate genuiness certificate.
    } else {
      setError("Invalid signature");
    }
   } catch (error) {
    setError("Invalid signature")
   }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileBuffer = await selectedFile.arrayBuffer();
      const hashArray = new Uint8Array(
        await crypto.subtle.digest("SHA-256", fileBuffer)
      );
      const hash = ethers.utils.hexlify(hashArray);
      // fetchBlockchain(hash)
      setFileHash(hash);
    } else {
      setFileHash("");
    }
  };

  return (
    <form
      className="m-4 flex items-center justify-evenly"
      onSubmit={handleVerification}
    >
      <div
        className="credit-card w-full shadow-lg mx-auto rounded-xl bg-white overflow-hidden"
        style={{ width: "600px", height: "400px" }}
      >
        <main className="mt-4 p-4">
          <h1 className="text-xl font-semibold text-gray-700 text-center form-heading">
            Verify Document
          </h1>
          <div className="">
            <div className="my-2">
              <div className="file-input-wrapper">
                <label htmlFor="file-input" className="file-input-label">
                  Choose File
                </label>
                <input
                  required
                  type="file"
                  id="file-input"
                  name="file"
                  className="file-input"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            {/* {fileHash && (
            <div className="textarea w-full h-14 textarea-bordered focus:ring focus:outline-none">
              <p style={{fontSize:12}}>File Hash: {fileHash}</p>
            </div>
          )} */}
          </div>
        </main>
        <footer className="p-3">
          <button
            type="submit"
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Verify
          </button>
          {/* <button
            // type="submit"
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full mt-2"
            onClick={downloadCert}
          >
            Download Certificate
          </button> */}
          <div className="p-1 mt-1">
            <ErrorMessage message={error} />
            <SuccessMessage message={successMsg} />
          </div>
        </footer>
      </div>
      {showTransactionInfo ? (
        <div className="transaction__info__container">
          <p className="mt-2 text-white">Transaction Hash:</p>
          <p style={{ fontSize: 12, paddingRight: "10px", color: "#fff" }}>
            {transactionInfo.hash}
          </p>
          <p className="mt-2 text-white">Block Hash:</p>
          <p style={{ fontSize: 12, paddingRight: "10px", color : "#fff" }}>
            {transactionInfo.blockHash}
          </p>
          <p className="mt-2 text-white">Block Number:</p>
          <p style={{ fontSize: 12, paddingRight: "10px", color : "#fff" }}>
            {transactionInfo.blockNumber}
          </p>
          <p className="mt-2 text-white">Issuer's Public Key:</p>
          <p style={{ fontSize: 12, paddingRight: "10px", color : "#fff" }}>
            {transactionInfo.from}
          </p>
          <p className="mt-2 text-white">Smart Contract Address:</p>
          <p style={{ fontSize: 12, paddingRight: "10px", color : "#fff" }}>
            {contractAddress}
          </p>
          <p className="mt-2 text-white">Transaction Date:</p>
          <p style={{fontSize:12,paddingRight:"10px", color : "#fff"}}>{timeStamp}</p>
        </div>
      ) : null}
    </form>
  );
}
