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

// import "@openzeppelin/contracts/utils/Counters.sol";

contract trutsPlatformNFT is ERC2771Context, ERC721A, Ownable, ReentrancyGuard {
    // using Counters for Counters.Counter;
    // Counters.Counter private _tokenIds;

    using Strings for uint8;

    bool public publicSaleActive;
    mapping(bytes => bool) internal signatureUsed;
    address private _signerAddress = 0x50CB4b45B7C3eee59c8e5897af7DD1eFbfCecED4;
    mapping(uint256 => string) public tokenIdToTokenUri;
    address[] public admins;

    mapping(address => bool) public ownerByAddress;

    //Constructor
    constructor(
        string memory _name,
        string memory _symbol,
        address _trustedForwarder
    ) ERC721A(_name, _symbol) ERC2771Context(_trustedForwarder) {
        admins.push(msg.sender);
        ownerByAddress[msg.sender] = true;
    }

    modifier onlyAdmins() {
        require(
            ownerByAddress[msg.sender] == true,
            "only admins can call this fucntion "
        );
        _;
    }

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

    function mintNewNFT(bytes memory signature, string memory _tokenURI)
        public
    {
        require(publicSaleActive, "not ready for sale");
        require(balanceOf(_msgSender()) < 1, "Max NFT mint Limit reached");
        require(!signatureUsed[signature], "Signature has already been used.");
        uint256 supply = totalSupply();
        // _tokenIds.increment();
        // uint256 newItemId = _tokenIds.current();

        require(
            _signerAddress == recoverSigner(signature),
            "Signer address mismatch."
        );
        // require(balanceOf(_msgSender()) == 0, "User already minted");
        _safeMint(_msgSender(), 1);

        tokenIdToTokenUri[supply] = _tokenURI;
        signatureUsed[signature] = true;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        return tokenIdToTokenUri[tokenId];
    }

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override {
        require(
            from == address(0) || to == address(0),
            "This a Soulbound token. It cannot be transferred. It can only be burned by the token owner."
        );
    }

    // function burn(uint256 tokenId) external {
    //     require(
    //         ownerOf(tokenId) == msg.sender,
    //         "Only the owner of the token can burn it."
    //     );
    //     _burn(tokenId);
    // }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 0;
    }

    function setPublicSaleActive(bool _state) public onlyAdmins {
        publicSaleActive = _state;
    }

    function updateOwner(address _newAddress) public onlyOwner {
        transferOwnership(_newAddress);
    }

    function addAdminAddress(address _adminAddress) public onlyAdmins {
        admins.push(_adminAddress);
        ownerByAddress[_adminAddress] = true;
    }

    function getAdmins() public view returns (address[] memory) {
        return admins;
    }

    function SetSignerAddress(address _newSignerAddress) external onlyAdmins {
        _signerAddress = _newSignerAddress;
    }
}
