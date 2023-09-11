const elliptic = require('elliptic');
const ethUtil = require('ethereumjs-util');
const ethers = require('ethers')

// Create an instance of the secp256k1 curve (used in Ethereum)
const ec = new elliptic.ec('secp256k1');

// Function to generate a new private key and corresponding public key
function generateKeyPair() {
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

    return {
        privateKey: privateKeyHex,
        publicKey: signerAddress,
    };
}
// Example usage
// const keyPair = generateKeyPair();

// console.log('Private Key:', keyPair.privateKey);
// console.log('Public Key:', keyPair.publicKey);
// b9fa0f91091bb58575cdee06a242206ef924fca3315d180e730ae3f9ad2909d2
// 0x9486a0bb833436bc39054c0411625052fbf45b61


// Function to generate a public key from a private key
function getPublicKeyFromPrivateKey(privateKeyHex) {
    // Convert the private key from hexadecimal to a Buffer
    const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');

    // Generate the public key from the private key
    // const publicKeyBuffer = ec.keyFromPrivate(privateKeyBuffer).getPublic();
    // Get the public key in hexadecimal format
    // const publicKeyHex = publicKeyBuffer.encode('hex', true);

    // Calculate public key from private key
    const publicKeyBuffer = ethUtil.privateToPublic(privateKeyBuffer);

    const addressBuffer = ethUtil.pubToAddress(publicKeyBuffer);
    const signerAddress = ethUtil.bufferToHex(addressBuffer);



    return signerAddress;
}
// Example usage

// console.log(getPublicKeyFromPrivateKey("3b3063d29e03a0eb95d4fe6cbd8abdfd9ce0044ccb91612c410caf05961121df"))
// console.log(getPublicKeyFromPrivateKey("4a0956727c78cfc2eb77308c766f81d11ffb292624aee3f910bc7ccefea22acb"))

// Function to generate a digital signature and signer address
function signText(text, privateKeyHex) {
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

    return {
        signature: serializedSignature,
        signerAddress: signerAddress,
    };
}

const verifyFileSignature = async (message, address, signature) => {
    try {
        console.log(`message : ${message}`)
        console.log(`address : ${address}`)
        console.log(`signature : ${signature}`)
      const signerAddr = await ethers.utils.verifyMessage(message, signature);
      console.log(signerAddr)
      if (signerAddr !== address) {
        return false;
      }
  
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

const main = async() => {
    // Example usage
const privateKeyHex = 'b9fa0f91091bb58575cdee06a242206ef924fca3315d180e730ae3f9ad2909d2';
const message = '0x1513f4bcde090f3aa6a2e2973070d39db48bc5570a27baa58c0f06e2915d99d4';
const result = signText(message, privateKeyHex);
console.log(result)
const signature = result.signature
const address = result.signerAddress

// console.log('Digital Signature:', signature);
// console.log('Signer Address:', address);
// console.log("Verifying signature...");
// const signerAddr = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
// const sign = "0xbdd32943122731e8c32d2c8037736f49b919bc05516e5b2e9ba85f185974bf723d9b83ff6bbde9839418f79c41961ecb5a3aa436477eb51abf62c428f9c467571b"
// const isValied = await verifyFileSignature(message, signerAddr, sign);
// console.log(isValied)
}

main()