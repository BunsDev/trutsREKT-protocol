//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "@thirdweb-dev/contracts/base/ERC721Base.sol";
import "./erc721a/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract trutsREKT is ERC2771Context, ERC721A, Ownable, ReentrancyGuard {
    using Strings for uint8;
    string private baseURI;
    bool public publicSaleActive;
    string[] public arrayOfTokenUri;
    mapping(bytes => bool) internal signatureUsed;
    address private _signerAddress = 0x50CB4b45B7C3eee59c8e5897af7DD1eFbfCecED4;
    mapping(address => uint256[]) private _ownerTokens;
    mapping(uint256 => uint8) private tokenIdToNumber;

    //Constructor
    constructor(
        string memory _name,
        string memory _symbol,
        address _trustedForwarder
    ) ERC721A(_name, _symbol) ERC2771Context(_trustedForwarder) {}

    function _msgSender()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (address sender)
    {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            /// @solidity memory-safe-assembly
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }

    function recoverSigner(bytes memory signature)
        internal
        view
        returns (address)
    {
        bytes32 messageDigest = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                bytes32(uint256(uint160(_msgSender())))
            )
        );
        return ECDSA.recover(messageDigest, signature);
    }

    function mintNewNFT(bytes memory signature, uint8 _idNUmber) public {
        require(publicSaleActive, "not ready for sale");
        require(_idNUmber < 6, "Token URI does not exist");
        require(balanceOf(_msgSender()) < 1, "Max NFT mint Limit reached");
        require(!signatureUsed[signature], "Signature has already been used.");
        uint256 supply = totalSupply();

        require(
            _signerAddress == recoverSigner(signature),
            "Signer address mismatch."
        );

        // require(balanceOf(_msgSender()) == 0, "User already minted");
        _safeMint(_msgSender(), 1);
        tokenIdToNumber[supply + 1] = _idNUmber;
        _ownerTokens[_msgSender()].push(supply + 1);
        signatureUsed[signature] = true;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Non Existent Token");
        string memory currentBaseURI = _baseURI();

        return (
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenIdToNumber[tokenId].toString(),
                        ".json"
                    )
                )
                : ""
        );
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setPublicSaleActive(bool _state) public onlyOwner {
        publicSaleActive = _state;
    }
}
