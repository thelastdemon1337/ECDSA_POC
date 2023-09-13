const router = require('express').Router()
const elliptic = require('elliptic');
const ethUtil = require('ethereumjs-util');
const ethers = require('ethers')
const prefetch = require('../middleware/prefetch')

const ec = new elliptic.ec('secp256k1');
let keyCount = 0

router.post('/sign', prefetch, async (req, res) => {
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
        console.log(`Signed ${text}`)

        res.status(200).json({
            signature: serializedSignature,
            signerAddress: signerAddress,
        })
    } catch (err) {
        res.status(500).json({ errorMessage: err })
    }
})

router.post("/storeBlockchain", async (req, res) => {

    // functions
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

    try {
        // Blockchain logic
        const { contractAddress, abi, certs } = req.body

        // if (typeof window.ethereum !== "undefined") {
        console.log("Storing Transcript on blockchain");
        const providerUrl = 'http://localhost:8545'; // Replace with your local node's URL
        const privateKey = 'df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e';
        // try {
        //   await window.ethereum.request({ method: "eth_requestAccounts" });
        // } catch (error) {
        //   console.log(error);
        // }
        const provider = new ethers.providers.JsonRpcProvider({ url: providerUrl });
        const customWallet = new ethers.Wallet(privateKey, provider);
        // const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/f6-isSCf5OjiqBkWaONyDJCeUe-OPlzG")
        // const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, customWallet);
        // console.log(contract);

        certs.forEach(async (cert) => {
            console.log(`Trying ${cert}`)
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
                            `/api/transactions/store`,
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
                    console.log("transation info", transaction);
                }
            } catch (error) {
                console.log(`Debug Error Reason : ${error.reason}`);
                console.log(error);
            }
        });
    } catch (error) {
        res.status(500).json({ errorMessage: error })
    }
})

router.get("/genKeys", async (req, res) => {
    try {
        // Old logic : generate key pair using ECDSA
        // const privateKey = ec.genKeyPair();

        // // Get the private key in hexadecimal format
        // const privateKeyHex = privateKey.getPrivate('hex');
        // const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');

        // // Get the corresponding public key
        // //   const publicKey = privateKey.getPublic('hex');
        // const publicKeyBuffer = ethUtil.privateToPublic(privateKeyBuffer);

        // const addressBuffer = ethUtil.pubToAddress(publicKeyBuffer);
        // const signerAddress = ethUtil.bufferToHex(addressBuffer);

        // New logic : fetch keys from hardhat blockchain network
        // store keys as array of objects and assign one for each new user.

        const keys = [
            { 'signer': '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'pvt': '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' },
            { 'signer': '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 'pvt': '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' },
            { 'signer': '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 'pvt': '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a' },
            { 'signer': '0x90F79bf6EB2c4f870365E785982E1f101E93b906', 'pvt': '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6' },
            { 'signer': '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', 'pvt': '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a' },
            { 'signer': '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', 'pvt': '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba' },
            { 'signer': '0x976EA74026E726554dB657fA54763abd0C3a0aa9', 'pvt': '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e' },
            { 'signer': '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', 'pvt': '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356' },
            { 'signer': '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', 'pvt': '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97' },
            { 'signer': '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', 'pvt': '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6' },
            { 'signer': '0xBcd4042DE499D14e55001CcbB24a551F3b954096', 'pvt': '0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897' },
            { 'signer': '0x71bE63f3384f5fb98995898A86B02Fb2426c5788', 'pvt': '0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82' },
            { 'signer': '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a', 'pvt': '0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1' },
            { 'signer': '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec', 'pvt': '0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd' },
            { 'signer': '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097', 'pvt': '0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa' },
            { 'signer': '0xcd3B766CCDd6AE721141F452C550Ca635964ce71', 'pvt': '0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61' },
            { 'signer': '0x2546BcD3c84621e976D8185a91A922aE77ECEc30', 'pvt': '0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0' },
            { 'signer': '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E', 'pvt': '0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd' },
            { 'signer': '0xdD2FD4581271e230360230F9337D5c0430Bf44C0', 'pvt': '0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0' },
            { 'signer': '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', 'pvt': '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e' },
            { 'signer': '0x09DB0a93B389bEF724429898f539AEB7ac2Dd55f', 'pvt': '0xeaa861a9a01391ed3d587d8a5a84ca56ee277629a8b02c22093a419bf240e65d' },
            { 'signer': '0x02484cb50AAC86Eae85610D6f4Bf026f30f6627D', 'pvt': '0xc511b2aa70776d4ff1d376e8537903dae36896132c90b91d52c1dfbae267cd8b' },
            { 'signer': '0x08135Da0A343E492FA2d4282F2AE34c6c5CC1BbE', 'pvt': '0x224b7eb7449992aac96d631d9677f7bf5888245eef6d6eeda31e62d2f29a83e4' },
            { 'signer': '0x5E661B79FE2D3F6cE70F5AAC07d8Cd9abb2743F1', 'pvt': '0x4624e0802698b9769f5bdb260a3777fbd4941ad2901f5966b854f953497eec1b' },
            { 'signer': '0x61097BA76cD906d2ba4FD106E757f7Eb455fc295', 'pvt': '0x375ad145df13ed97f8ca8e27bb21ebf2a3819e9e0a06509a812db377e533def7' },
            { 'signer': '0xDf37F81dAAD2b0327A0A50003740e1C935C70913', 'pvt': '0x18743e59419b01d1d846d97ea070b5a3368a3e7f6f0242cf497e1baac6972427' },
            { 'signer': '0x553BC17A05702530097c3677091C5BB47a3a7931', 'pvt': '0xe383b226df7c8282489889170b0f68f66af6459261f4833a781acd0804fafe7a' },
            { 'signer': '0x87BdCE72c06C21cd96219BD8521bDF1F42C78b5e', 'pvt': '0xf3a6b71b94f5cd909fb2dbb287da47badaa6d8bcdc45d595e2884835d8749001' },
            { 'signer': '0x40Fc963A729c542424cD800349a7E4Ecc4896624', 'pvt': '0x4e249d317253b9641e477aba8dd5d8f1f7cf5250a5acadd1229693e262720a19' },
            { 'signer': '0x9DCCe783B6464611f38631e6C851bf441907c710', 'pvt': '0x233c86e887ac435d7f7dc64979d7758d69320906a0d340d2b6518b0fd20aa998' },
            { 'signer': '0x1BcB8e569EedAb4668e55145Cfeaf190902d3CF2', 'pvt': '0x85a74ca11529e215137ccffd9c95b2c72c5fb0295c973eb21032e823329b3d2d' },
            { 'signer': '0x8263Fce86B1b78F95Ab4dae11907d8AF88f841e7', 'pvt': '0xac8698a440d33b866b6ffe8775621ce1a4e6ebd04ab7980deb97b3d997fc64fb' },
            { 'signer': '0xcF2d5b3cBb4D7bF04e3F7bFa8e27081B52191f91', 'pvt': '0xf076539fbce50f0513c488f32bf81524d30ca7a29f400d68378cc5b1b17bc8f2' },
            { 'signer': '0x86c53Eb85D0B7548fea5C4B4F82b4205C8f6Ac18', 'pvt': '0x5544b8b2010dbdbef382d254802d856629156aba578f453a76af01b81a80104e' },
            { 'signer': '0x1aac82773CB722166D7dA0d5b0FA35B0307dD99D', 'pvt': '0x47003709a0a9a4431899d4e014c1fd01c5aad19e873172538a02370a119bae11' },
            { 'signer': '0x2f4f06d218E426344CFE1A83D53dAd806994D325', 'pvt': '0x9644b39377553a920edc79a275f45fa5399cbcf030972f771d0bca8097f9aad3' },
            { 'signer': '0x1003ff39d25F2Ab16dBCc18EcE05a9B6154f65F4', 'pvt': '0xcaa7b4a2d30d1d565716199f068f69ba5df586cf32ce396744858924fdf827f0' },
            { 'signer': '0x9eAF5590f2c84912A08de97FA28d0529361Deb9E', 'pvt': '0xfc5a028670e1b6381ea876dd444d3faaee96cffae6db8d93ca6141130259247c' },
            { 'signer': '0x11e8F3eA3C6FcF12EcfF2722d75CEFC539c51a1C', 'pvt': '0x5b92c5fe82d4fabee0bc6d95b4b8a3f9680a0ed7801f631035528f32c9eb2ad5' },
            { 'signer': '0x7D86687F980A56b832e9378952B738b614A99dc6', 'pvt': '0xb68ac4aa2137dd31fd0732436d8e59e959bb62b4db2e6107b15f594caf0f405f' },
            { 'signer': '0x9eF6c02FB2ECc446146E05F1fF687a788a8BF76d', 'pvt': '0xc95eaed402c8bd203ba04d81b35509f17d0719e3f71f40061a2ec2889bc4caa7' },
            { 'signer': '0x08A2DE6F3528319123b25935C92888B16db8913E', 'pvt': '0x55afe0ab59c1f7bbd00d5531ddb834c3c0d289a4ff8f318e498cb3f004db0b53' },
            { 'signer': '0xe141C82D99D85098e03E1a1cC1CdE676556fDdE0', 'pvt': '0xc3f9b30f83d660231203f8395762fa4257fa7db32039f739630f87b8836552cc' },
            { 'signer': '0x4b23D303D9e3719D6CDf8d172Ea030F80509ea15', 'pvt': '0x3db34a7bcc6424e7eadb8e290ce6b3e1423c6e3ef482dd890a812cd3c12bbede' },
            { 'signer': '0xC004e69C5C04A223463Ff32042dd36DabF63A25a', 'pvt': '0xae2daaa1ce8a70e510243a77187d2bc8da63f0186074e4a4e3a7bfae7fa0d639' },
            { 'signer': '0x5eb15C0992734B5e77c888D713b4FC67b3D679A2', 'pvt': '0x5ea5c783b615eb12be1afd2bdd9d96fae56dda0efe894da77286501fd56bac64' },
            { 'signer': '0x7Ebb637fd68c523613bE51aad27C35C4DB199B9c', 'pvt': '0xf702e0ff916a5a76aaf953de7583d128c013e7f13ecee5d701b49917361c5e90' },
            { 'signer': '0x3c3E2E178C69D4baD964568415a0f0c84fd6320A', 'pvt': '0x7ec49efc632757533404c2139a55b4d60d565105ca930a58709a1c52d86cf5d3' },
            { 'signer': '0x35304262b9E87C00c430149f28dD154995d01207', 'pvt': '0x755e273950f5ae64f02096ae99fe7d4f478a28afd39ef2422068ee7304c636c0' },
            { 'signer': '0xD4A1E660C916855229e1712090CcfD8a424A2E33', 'pvt': '0xaf6ecabcdbbfb2aefa8248b19d811234cd95caa51b8e59b6ffd3d4bbc2a6be4c' },
            { 'signer': '0xEe7f6A930B29d7350498Af97f0F9672EaecbeeFf', 'pvt': '0x70c2bd1b41084c2e2238551eace483321f8c1a413a471c3b49c8a5d1d6b3d0c4' },
            { 'signer': '0x145e2dc5C8238d1bE628F87076A37d4a26a78544', 'pvt': '0xcb8e373c93609268cdcec93450f3578b92bb20c3ac2e77968d106025005f97b5' },
            { 'signer': '0xD6A098EbCc5f8Bd4e174D915C54486B077a34A51', 'pvt': '0x6f29f6e0b750bcdd31c3403f48f11d72215990375b6d23380b39c9bbf854a7d3' },
            { 'signer': '0x042a63149117602129B6922ecFe3111168C2C323', 'pvt': '0xff249f7eba6d8d3a65794995d724400a23d3b0bd1714265c965870ef47808be8' },
            { 'signer': '0xa0EC9eE47802CeB56eb58ce80F3E41630B771b04', 'pvt': '0x5599a7be5589682da3e0094806840e8510dae6493665a701b06c59cbe9d97968' },
            { 'signer': '0xe8B1ff302A740fD2C6e76B620d45508dAEc2DDFf', 'pvt': '0x93de2205919f5b472723722fedb992e962c34d29c4caaedd82cd33e16f1fd3cf' },
            { 'signer': '0xAb707cb80e7de7C75d815B1A653433F3EEc44c74', 'pvt': '0xd20ecf81c6c3ad87a4e8dbeb7ceef41dd0eebc7a1657efb9d34e47217694b5cb' },
            { 'signer': '0x0d803cdeEe5990f22C2a8DF10A695D2312dA26CC', 'pvt': '0xe4058704ed240d68a94b6fb226824734ddabd4b1fe37bc85ce22f5b17f98830e' },
            { 'signer': '0x1c87Bb9234aeC6aDc580EaE6C8B59558A4502220', 'pvt': '0x4ae4408221b5042c0ee36f6e9e6b586a00d0452aa89df2e7f4f5aec42152ec43' },
            { 'signer': '0x4779d18931B35540F84b0cd0e9633855B84df7b8', 'pvt': '0x0e7c38ba429fa5081692121c4fcf6304ca5895c6c86d31ed155b0493c516107f' },
            { 'signer': '0xC0543b0b980D8c834CBdF023b2d2A75b5f9D1909', 'pvt': '0xd5df67c2e4da3ff9c8c6045d9b7c41581efeb2a3660921ad4ba863cc4b8c211c' },
            { 'signer': '0x73B3074ac649A8dc31c2C90a124469456301a30F', 'pvt': '0x92456ac1fa1ef65a04fb4689580ad5e4cda7369f3620ef3a02fa4015725f460a' },
            { 'signer': '0x265188114EB5d5536BC8654d8e9710FE72C28c4d', 'pvt': '0x65b10e7d7315bb8b7f7c6eefcbd87b36ad4007c4ade9c032354f016e84ad9c5e' },
            { 'signer': '0x924Ba5Ce9f91ddED37b4ebf8c0dc82A40202fc0A', 'pvt': '0x365820b3376c77dab008476d49f7cd7af87fc7bbd57dc490378106c3353b2b33' },
            { 'signer': '0x64492E25C30031EDAD55E57cEA599CDB1F06dad1', 'pvt': '0xb07579b9864bb8e69e8b6e716284ab5b5f39fe5bb57ae4c83af795a242390202' },
            { 'signer': '0x262595fa2a3A86adACDe208589614d483e3eF1C0', 'pvt': '0xbf071d2b017426fcbf763cce3b3efe3ffc9663a42c77a431df521ef6c79cacad' },
            { 'signer': '0xDFd99099Fa13541a64AEe9AAd61c0dbf3D32D492', 'pvt': '0x8bbffff1588b3c4eb8d415382546f6f6d5f0f61087c3be7c7c4d9e0d41d97258' },
            { 'signer': '0x63c3686EF31C03a641e2Ea8993A91Ea351e5891a', 'pvt': '0xb658f0575a14a7ac05075cb0f8727f0aae168a091dfb32d92514d1a7c11cf498' },
            { 'signer': '0x9394cb5f737Bd3aCea7dcE90CA48DBd42801EE5d', 'pvt': '0x228330af91fa515d7514cf5ac6594ab90b296cbd8ff7bc4567306aa66cacd79f' },
            { 'signer': '0x344dca30F5c5f74F2f13Dc1d48Ad3A9069d13Ad9', 'pvt': '0xe6f80f9618311c0cd58f6a3fc6621cdbf6da4a72cc42e2974c98829343e7927b' },
            { 'signer': '0xF23E054D8b4D0BECFa22DeEF5632F27f781f8bf5', 'pvt': '0x36d0435aa9a2c24d72a0aa69673b3acc2649969c38a581103df491aac6c33dd4' },
            { 'signer': '0x6d69F301d1Da5C7818B5e61EECc745b30179C68b', 'pvt': '0xf3ed98f9148171cfed177aef647e8ac0e2579075f640d05d37df28e6e0551083' },
            { 'signer': '0xF0cE7BaB13C99bA0565f426508a7CD8f4C247E5a', 'pvt': '0x8fc20c439fd7cf4f36217471a5db7594188540cf9997a314520a018de27544dd' },
            { 'signer': '0x011bD5423C5F77b5a0789E27f922535fd76B688F', 'pvt': '0x549078aab3adafeff862b2d40b6b27756c5c4669475c3367edfb8dcf63ea1ae5' },
            { 'signer': '0xD9065f27e9b706E5F7628e067cC00B288dddbF19', 'pvt': '0xacf192decb2e4ddd8ad61693ab8edd67e3620b2ed79880ff4e1e04482c52c916' },
            { 'signer': '0x54ccCeB38251C29b628ef8B00b3cAB97e7cAc7D5', 'pvt': '0x47dc59330fb8c356ef61c55c11f9bb49ee463df50cbfe59f389de7637037b029' },
            { 'signer': '0xA1196426b41627ae75Ea7f7409E074BE97367da2', 'pvt': '0xf0050439b33fd77f7183f44375bc43a869a9880dca82a187fab9be91e020d029' },
            { 'signer': '0xE74cEf90b6CF1a77FEfAd731713e6f53e575C183', 'pvt': '0xe995cc7ea38e5c2927b97607765c2a20f4a6052d6810a3a1102e84d77c0df13b' },
            { 'signer': '0x7Df8Efa6d6F1CB5C4f36315e0AcB82b02Ae8BA40', 'pvt': '0x8232e778c8e32eddb268e12aee5e82c7bb540cc176e150d64f35ee4ae2faf2b2' },
            { 'signer': '0x9E126C57330FA71556628e0aabd6B6B6783d99fA', 'pvt': '0xba8c9ff38e4179748925335a9891b969214b37dc3723a1754b8b849d3eea9ac0' },
            { 'signer': '0x586BA39027A74e8D40E6626f89Ae97bA7f616644', 'pvt': '0xe66935494406a2b7cddd5b90f0a416cd499353f9f5b16d3f53e9db79b5af315c' },
            { 'signer': '0x9A50ed082Cf2fc003152580dcDB320B834fA379E', 'pvt': '0xdf1d05a0dc7ff9b702517352bbcc48cd78c4f1c8e7e0be4a7e8c9d8a01318dca' },
            { 'signer': '0xbc8183bac3E969042736f7af07f76223D11D2148', 'pvt': '0xaf905e7d181f83cf2b32316c035db8cc6dc37b8ee658a39c648a40f7f5aea732' },
            { 'signer': '0x586aF62EAe7F447D14D25f53918814e04d3A5BA4', 'pvt': '0x2e07199788560fbb67ad75c647ab4c1288c035e370cd8efd8cc98c117a9e1dbc' },
            { 'signer': '0xCcDd262f272Ee6C226266eEa13eE48D4d932Ce66', 'pvt': '0xbeab65f35a77de7af63a97748e6a3bb90372f9225ebc6e8d0f1dc14098ac683a' },
            { 'signer': '0xF0eeDDC5e015d4c459590E01Dcc2f2FD1d2baac7', 'pvt': '0x0ae04d323697ac9f6590e30ac497b8bb84ba66a3f7db8648792e92a5773c9dc7' },
            { 'signer': '0x4edFEDFf17ab9642F8464D6143900903dD21421a', 'pvt': '0x7cda9d93162b809fb8474f22c724da7e9590ac3bfba54ec15bdd54953ab3e5ff' },
            { 'signer': '0x492C973C16E8aeC46f4d71716E91b05B245377C9', 'pvt': '0xf6702b85537d0a844debc36e28e409af35c683a0d968ff1a01eab8bc17542397' },
            { 'signer': '0xE5D3ab6883b7e8c35c04675F28BB992Ca1129ee4', 'pvt': '0x4034badb4e3cdf45d4032c7671a82d4967a0ce4c1bf3ddb72bf8fba38c151f6f' },
            { 'signer': '0x71F280DEA6FC5a03790941Ad72956f545FeB7a52', 'pvt': '0x967483ff906486d78577d1749000ddcee7c65f480f154fb5d9d45170f0489d33' },
            { 'signer': '0xE77478D9E136D3643cFc6fef578Abf63F9Ab91B1', 'pvt': '0x9c9186fb8f85adc661f3da56dd64e3b9a3f95b17c05ed9c6561f9ee9225da327' },
            { 'signer': '0x6C8EA11559DFE79Ae3dBDD6A67b47F61b929398f', 'pvt': '0xef463dfdd318a103afeb0e4e75b3c3c0b13a681c2dc48b22bc05a949d5fa28d5' },
            { 'signer': '0x48fA7b63049A6F4E7316EB2D9c5BDdA8933BCA2f', 'pvt': '0x165b52d20a0ebc82b1e87bd02e221f3a2bec6ff6f61326eea3e6180cc23ccf43' },
            { 'signer': '0x16aDfbeFdEfD488C992086D472A4CA577a0e5e54', 'pvt': '0x945ff88d4066b8f6d61eb1dbc7c31dc1ad0078b8a781e0ea7b4c4f097e62dfd3' },
            { 'signer': '0x225356FF5d64889D7364Be2c990f93a66298Ee8D', 'pvt': '0x1ecfea2bcec4e5e3af2430ae90d554bc272cd7743efb66138c90840c729ebffe' },
            { 'signer': '0xcBDc0F9a4C38f1e010bD3B6e43598A55D1868c23', 'pvt': '0xa6d83a50114f5bbd5557832caf948c4f202e31e7f8dd3bffdb579bf78dc4c166' },
            { 'signer': '0xBc5BdceE96b1BC47822C74e6f64186fbA7d686be', 'pvt': '0xf6b39438613b3f5dae4e84a73e90ea8a4efa0ab7b69cc532fdfe3932d20d52bb' },
            { 'signer': '0x0536896a5e38BbD59F3F369FF3682677965aBD19', 'pvt': '0x41f789906acc91db1f402d803b8537830856da0211f4ccf22f526d918b26c881' },
            { 'signer': '0xFE0f143FcAD5B561b1eD2AC960278A2F23559Ef9', 'pvt': '0xc1b5e6b1cd081956fa11c35329eeb84d31bceaf7253e84e0f90323d55065aa1f' },
            { 'signer': '0x98D08079928FcCB30598c6C6382ABfd7dbFaA1cD', 'pvt': '0xa3f5fbad1692c5b72802300aefb5b760364018018ddb5fe7589a2203d0d10e60' }

        ]

        const keyPair = keys[keyCount]
        keyCount++

        res.status(200).json({
            privateKey: keyPair.pvt,
            publicKey: keyPair.signer,
        })
    } catch (err) {
        res.status(500).json({ errorMessage: err })
    }
})

router.get("/genKeys/reset", (req, res) => {
    try {
        keyCount = 0
        return res.status(200).send({message : "keyCount reset Success"})
    } catch (error) {
        res.status(500).json({errorMessage : error})
    }
})

module.exports = router