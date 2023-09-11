import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import "./SignMessage2.css"

export default function StudentForm() {
  const [fileList, setFileList] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const updateStudentDetails = async () => {
      const updatedDetails = [];
  
      for (const file of fileList) {
        const hash = await calculateHash(file.data);
        const updatedFile = {
          ...file,
          cert_hash: hash,
        };
        updatedDetails.push(updatedFile);
      }
  
      setStudentDetails(updatedDetails);
    };
  
    updateStudentDetails();
  }, [fileList]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFileList(
      selectedFiles.map((file) => ({
        data: file,
        regNo: "",
        name: "",
        yearOfPassing: "",
        collegeName: "",
      }))
    );
  };

  const handleInputChange = (index, e) => {
    // console.log(studentDetails)
    const { name, value } = e.target;
    const updatedStudentDetails = [...studentDetails];
    updatedStudentDetails[index][name] = value;
    setStudentDetails(updatedStudentDetails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(fileList)
    console.log(`studentDetails`)
    console.log(studentDetails)

    try {
      const URID = process.env.REACT_APP_NGROK_BACKEND_URI
      // const URID = "http://localhost:5000"

      const config = {
        headers: {
          "ngrok-skip-browser-warning": true
        }
      }
      for (const studentInfo of studentDetails) {
        const response = await axios.post(
          `${URID}/uploadStudent`,
          studentInfo,
          config
        ).catch(error => {
          console.log(error.response.data.message)
          if (error.response.status === 409) {
            alert(`Student certificate ${error.response.data.message} already exists in the database!`)
          }
        })
        if (response.status === 201) {
          console.log(response);
        }
      }

      setError("");
      alert("Student details saved successfully!");
      setFileList([]);
      setStudentDetails([]);
    } catch (error) {
      setError("An error occurred while saving student details.");
    }
  };

  const calculateHash = async (data) => {
    // console.log("Inside calculateHash function")

    const fileBuffer = await data.arrayBuffer();
    const hashArray = new Uint8Array(await crypto.subtle.digest('SHA-256', fileBuffer));
    const hash = ethers.utils.hexlify(hashArray);
    // console.log(`hash : ${hash}`)
    // console.log(`type : ${typeof(hash)}`)
    return hash;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4 form-heading">Student Information</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="block text-sm font-medium">Select Directory</label>
          <div className="file-input-wrapper">
            <label htmlFor="file-input" className="file-input-label">
              Choose Directory
            </label>
            <input
              type="file"
              id="file-input"
              className="file-input"
              name="files"
              onChange={handleFileChange}
              multiple
            />
          </div>
        </div>

        {fileList.map((file, index) => (
          <div key={index} className="form-container">
            <h2 className="text-lg font-semibold mb-4">File {index + 1}</h2>
            <div className="mb-4">
              <label className="form-label">Registration Number</label>
              <input
                type="text"
                className="form-input"
                name="regNo"
                value={studentDetails[index]?.regNo || ""}
                onChange={(e) => handleInputChange(index, e)}
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                className="form-input"
                name="name"
                value={studentDetails[index]?.name || ""}
                onChange={(e) => handleInputChange(index, e)}
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium">Year of Passing</label>
              <input
                type="text"
                className="form-input"
                name="yearOfPassing"
                value={studentDetails[index]?.yearOfPassing || ""}
                onChange={(e) => handleInputChange(index, e)}
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium">College Name</label>
              <input
                type="text"
                className="form-input"
                name="collegeName"
                value={studentDetails[index]?.collegeName || ""}
                onChange={(e) => handleInputChange(index, e)}
              />
            </div>
            <div className="mb-2">
              <strong>Certificate Name:</strong> {file.data.name}
            </div>
            <div className="mb-2">
              <strong>Certificate Hash:</strong> {studentDetails[index]?.cert_hash || ""}
            </div>
          </div>
        ))}

        <button type="submit" className="save-button">
          Save
        </button>
      </form>
      {error && <p className="text-red-500 mt-3">{error}</p>}
    </div>
  );
};









  