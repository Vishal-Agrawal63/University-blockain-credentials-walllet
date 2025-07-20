// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UniversityCredentials {
    address public universityAdmin;
    uint256 private _tokenIds;

    // Maps a credential ID to the student's address (the owner)
    mapping(uint256 => address) public ownerOf;
    // Maps a credential ID to its metadata URL (from Firebase Storage)
    mapping(uint256 => string) public tokenURI;

    event CredentialIssued(address indexed to, uint256 indexed tokenId);

    constructor() {
        universityAdmin = msg.sender;
    }

    function issueCredential(address student, string memory credentialUrl) public returns (uint256) {
        require(msg.sender == universityAdmin, "Only the university admin can issue credentials.");
        
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        ownerOf[newItemId] = student;
        tokenURI[newItemId] = credentialUrl;

        emit CredentialIssued(student, newItemId);
        return newItemId;
    }
}