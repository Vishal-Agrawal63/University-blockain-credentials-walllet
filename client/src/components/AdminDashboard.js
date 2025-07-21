// src/components/AdminDashboard.js
import React, { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

// =================== IMPORTANT: PASTE YOUR VALUES HERE ===================
const contractAddress = "0x09eBD0B12D3C9CA685662aFE8191384d6FFc1bf5";
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "CredentialIssued",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "ownerOf",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "tokenURI",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "universityAdmin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "student",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "credentialUrl",
                "type": "string"
            }
        ],
        "name": "issueCredential",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
// =======================================================================

const AdminDashboard = () => {
    const [account, setAccount] = useState(null);
    const [file, setFile] = useState(null);
    const [studentAddress, setStudentAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                setStatus("Please install MetaMask to use this feature.");
                return;
            }
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            if (accounts.length > 0) {
                setAccount(accounts[0]);
            }
        } catch (error) {
            setStatus("Failed to connect wallet.");
            console.error(error);
        }
    };

    const handleIssueCredential = async () => {
        if (!file || !ethers.isAddress(studentAddress)) {
            setStatus("Please provide a valid student address and a file.");
            return;
        }
        setLoading(true);
        setStatus('Uploading to IPFS via Pinata...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
                    'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_API_KEY,
                },
            });

            const ipfsHash = res.data.IpfsHash;
            setStatus(`File uploaded successfully! IPFS Hash: ${ipfsHash}`);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            setStatus('Awaiting transaction confirmation...');
            const tx = await contract.issueCredential(studentAddress, ipfsHash);
            await tx.wait();

            setStatus("Credential issued successfully on the blockchain!");

        } catch (error) {
            setStatus('Error: ' + (error.reason || 'An error occurred. See console.'));

            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <nav className="navbar navbar-dark bg-dark">
                <div className="container-fluid">
                    <span className="navbar-brand mb-0 h1">University Credential Wallet</span>
                </div>
            </nav>
            <div className="container mt-5">
                <div className="card shadow-sm">
                    <div className="card-header">
                        <h3>Admin Dashboard (with Pinata)</h3>
                    </div>
                    <div className="card-body">
                        {
                            !account ? (
                                <div className="text-center">
                                    <p>Please connect your wallet to continue.</p>
                                    <button className="btn btn-success" onClick={connectWallet}>Connect Wallet</button>
                                </div>
                            ) : (
                                <div>
                                    <div className="alert alert-info">
                                        <strong>Connected Account:</strong> {account}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="studentAddress" className="form-label">Student Wallet Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="studentAddress"
                                            placeholder="0x..."
                                            onChange={(e) => setStudentAddress(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="credentialFile" className="form-label">Credential File</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="credentialFile"
                                            onChange={(e) => setFile(e.target.files[0])}
                                        />
                                    </div>
                                    <button onClick={handleIssueCredential} className="btn btn-primary w-100" disabled={loading}>
                                        {loading ?
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                {' '}Processing...
                                            </>
                                            : "Issue Credential"
                                        }
                                    </button>
                                    {status &&
                                        <div className={`alert mt-3 ${status.includes('Error') ? 'alert-danger' : 'alert-secondary'}`} role="alert">
                                            <strong>Status:</strong> {status}
                                        </div>
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;