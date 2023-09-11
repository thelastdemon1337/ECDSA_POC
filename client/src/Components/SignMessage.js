import { useState } from "react";
import { ethers, utils } from "ethers";
import ErrorMessage from "./ErrorMessage";
import axios from "axios";
import { abi, contractAddress } from "../utils/constants";
import "./SignMessage1.css";
const URID = process.env.REACT_APP_BACKEND_URI
const config = {
  headers: {
    "ngrok-skip-browser-warning": true
  }
}



const signFilesInFolder = async ({ setError, folder }) => {
  try {

    const files = folder.files;

    const signatures = [];

    for (const file of files) {
      console.log(file);
      const fileBuffer = await file.arrayBuffer();
      const hashArray = new Uint8Array(
        await crypto.subtle.digest("SHA-256", fileBuffer)
      );
      const hash = ethers.utils.hexlify(hashArray);

      await axios
      .post(
        `${URID}/ecdsa/sign`,
        {
          text: hash,
          privateKeyHex: 'b9fa0f91091bb58575cdee06a242206ef924fca3315d180e730ae3f9ad2909d2'
        }, config
      )
      .then((res) => {
        console.log("API response: ", res.data);
        const signature = res.data.signature
        const address = res.data.signerAddress

      signatures.push({
        fileName: file.name,
        fileHash: hash,
        signature,
        signerAddress: address,
      });
      })
      .catch((err) => {
        console.log("API Error: ", err);
      });
    }
    console.log(`signatures : ${signatures}`)
    return signatures;
  } catch (err) {
    setError(err.message);
  }
};

export default function SignMessage() {
  const [error, setError] = useState();
  const [signatures, setSignatures] = useState([]);
  const [csvContent, setCsvContent] = useState(null);

  const handleSign = async (e) => {
    e.preventDefault();
    setError();
    const folder = e.target.folder;
    if (!folder) {
      setError("Please select a folder.");
      return;
    }

    const files = Array.from(folder.files);

    const sigs = await signFilesInFolder({
      setError,
      folder: { files },
    });
    console.log(`sigs : ${sigs}`)

    if (sigs && sigs.length > 0) {
      setSignatures([...signatures, ...sigs]);
    }
  };

  const generateCsvContent = () => {
    if (signatures.length === 0) {
      return;
    }

    const csvRows = [
      ["File Name", "File Hash", "Digital Signature", "Signer Address"],
    ];
    signatures.forEach((sig) => {
      csvRows.push([
        sig.fileName,
        sig.fileHash,
        sig.signature,
        sig.signerAddress,
      ]);
    });

    // console.log(csvRows)
    for (let i = 1; i < csvRows.length; i++) {
      console.log(csvRows[i]);
    }
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    setCsvContent(csvContent);
  };

  const listenForTransactionMine = (transactionResponse, provider) => {
    console.log(`Mining Txn : ${transactionResponse.hash}`);
    return new Promise((resolve, reject) => {
      try {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
          console.log(
            `Completed with ${transactionReceipt.confirmations} confirmations. `
          );
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const storeBlockchain = async () => {
    // fetching data to store on chain
    if (signatures.length === 0) {
      return;
    }

    const certs = [];
    signatures.forEach((sig) => {
      certs.push([
        sig.fileName,
        sig.fileHash,
        sig.signature,
        sig.signerAddress,
      ]);
    });
    console.log("certs", certs);
    // End of data fetch

    // Blockchain logic

    if (typeof window.ethereum !== "undefined") {
      console.log("Storing Transcript on blockchain");
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.log(error);
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/f6-isSCf5OjiqBkWaONyDJCeUe-OPlzG")
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      console.log(contract);

      certs.forEach(async (cert) => {
        try {
          const transcript = await contract.transcripts(cert[1]);
          console.log(transcript);
          if (transcript[0] !== "") {
            console.log("Transcript already exists in blockchain");
            alert("Transcript already exists in blockchain");
          } else {
            const transactionResponse = await contract.addTranscript(cert);
            console.log(`Blockchain ID : ${transactionResponse.hash}`);
            // api call to store file hash and transaction response hash
            axios
              .post(
                `${URID}/api/transactions/store`,
                {
                  cert_hash: cert[1],
                  trans_hash: transactionResponse.hash,
                }, config
              )
              .then((res) => {
                console.log("API response: ", res);
              })
              .catch((err) => {
                console.log("API Storing Error: ", err);
              });

            await listenForTransactionMine(transactionResponse, provider);
            const transaction = await provider.getTransaction(
              transactionResponse.hash
            );
            console.log("ransation info", transaction);
          }
        } catch (error) {
          console.log(`Debug Error Reason : ${error.reason}`);
          console.log(error);
        }
      });
    } else {
      alert("Metamask Not Found.");
    }
  };

  const handleDownload = () => {
    generateCsvContent();

    if (csvContent) {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "file_signatures.csv";
      a.click();
    }
  };
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const fileList = Array.from(event.target.files);
    setSelectedFiles(fileList);
  };

  return (
    <div className="center-container">
      <form className="m-4" onSubmit={handleSign}>
        <div className="credit-card w-full shadow-lg mx-auto rounded-xl bg-white">
          <main className="mt-4 p-4">
            <h1 className="form-heading text-center">Securely Sign Documents</h1>
            <div className="">
              <div className="my-3">
                <div className="file-input-wrapper">
                  <label
                    htmlFor="file-input"
                    className={`file-input-label ${
                      selectedFiles.length > 0 ? "active" : ""
                    }`}
                  >
                    {selectedFiles.length > 0
                      ? "Files Selected"
                      : "Choose File"}
                  </label>
                  <input
                    required
                    type="file"
                    id="file-input"
                    name="folder"
                    multiple
                    className="file-input"
                    onChange={handleFileChange}
                  />
                </div>
                {selectedFiles.length > 0 && (
                  <div className="selected-files">
                    <p>Selected Files:</p>
                    <ul>
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </main>
          <footer className="p-4">
            <button
              type="submit"
              className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
            >
              Sign
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="btn btn-secondary submit-button focus:ring focus:outline-none w-full mt-2"
              disabled={signatures.length === 0}
            >
              Download CSV
            </button>
            <button
              type="button"
              onClick={storeBlockchain}
              className="btn btn-secondary submit-button focus:ring focus:outline-none w-full mt-2"
              disabled={signatures.length === 0}
            >
              Blockchain
            </button>
            <ErrorMessage message={error} />
          </footer>
        </div>
      </form>
      {/* <h1> Nothing</h1> */}
    </div>
  );
}
