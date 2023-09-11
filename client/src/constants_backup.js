export const contractAddress = '0x73d459EF241E916FfCc1F265295a1F211725F93e'
export const listenForTransactionMine = (transactionResponse, provider) => {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                )
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}
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
				"internalType": "address",
				"name": "signerAddress",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]