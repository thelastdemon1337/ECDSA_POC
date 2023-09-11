export const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const abi = [
  {
    "inputs": [
      {
        "internalType": "string[]",
        "name": "transcriptData",
        "type": "string[]"
      }
    ],
    "name": "addTranscript",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "transcripts",
    "outputs": [
      {
        "internalType": "string",
        "name": "cert_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "cert_hash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "digitalSignature",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "signerAddress",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];