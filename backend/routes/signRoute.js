const router = require('express').Router()
const elliptic = require('elliptic');
const ethUtil = require('ethereumjs-util');
const ethers = require('ethers')

const ec = new elliptic.ec('secp256k1');

router.post('/sign', async (req, res) => {
    try {
        console.log(req.body)
        const { text, privateKeyHex } = req.body
        // Convert the private key from hexadecimal to a Buffer
        const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
        
        // Calculate the public key from the private key
        const publicKeyBuffer = ethUtil.privateToPublic(privateKeyBuffer);
        

        // Convert the text to a Buffer and then create a SHA-256 hash of the Buffer
        const textBuffer = Buffer.from(text);
        const textHash = ethUtil.keccak256(textBuffer);
        
        // Sign the text hash with the private key
        const signature = ec.sign(textHash, privateKeyBuffer, 'hex', { canonical: true });

        // Serialize the signature
        const serializedSignature = signature.r.toString(16, 64) + signature.s.toString(16, 64);

        // Derive the Ethereum address from the public key
        const addressBuffer = ethUtil.pubToAddress(publicKeyBuffer);
        const signerAddress = ethUtil.bufferToHex(addressBuffer);
        console.log(`Signature : ${serializedSignature} \n SignerAddress : ${signerAddress}`)

        res.status(200).json({
            signature: serializedSignature,
            signerAddress: signerAddress,
        })
    } catch (err) {
        res.status(500).json({ errorMessage: err })
    }
})

router.get("/genKeys", async (req, res) => {
    try {
        // Generate a new random private key
    const privateKey = ec.genKeyPair();

    // Get the private key in hexadecimal format
    const privateKeyHex = privateKey.getPrivate('hex');
    const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');

    // Get the corresponding public key
    //   const publicKey = privateKey.getPublic('hex');
    const publicKeyBuffer = ethUtil.privateToPublic(privateKeyBuffer);

    const addressBuffer = ethUtil.pubToAddress(publicKeyBuffer);
    const signerAddress = ethUtil.bufferToHex(addressBuffer);

    res.status(200).json({
        privateKey: privateKeyHex,
        publicKey: signerAddress,
    })
    } catch (err) {
        res.status(500).json({ errorMessage: err })
    }
})

module.exports = router