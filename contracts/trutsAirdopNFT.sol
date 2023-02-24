//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "@thirdweb-dev/contracts/base/ERC721Base.sol";
import "./erc721a/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// import "@openzeppelin/contracts/utils/Counters.sol";

contract trutsAirdopNFT is ERC721A, Ownable, ReentrancyGuard {
    // using Counters for Counters.Counter;
    // Counters.Counter private _tokenIds;

    using Strings for uint8;

    bool public publicSaleActive;
    mapping(uint256 => string) public tokenIdToTokenUri;
    address[] public admins;

    mapping(address => bool) public ownerByAddress;

    //Constructor
    constructor(string memory _name, string memory _symbol)
        ERC721A(_name, _symbol)
    {
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

    function mintforAddress(address _userAddress, string memory _tokenURI)
        public
        onlyOwner
    {
        require(publicSaleActive, "not ready for sale");
        require(
            _userAddress != address(0),
            "User Address cannot be address(0)"
        );
        require(balanceOf(_userAddress) < 1, "Max NFT mint Limit reached");
        mintAirdrop(_userAddress, _tokenURI);
    }

    function mintForMultipleAddress(
        address[] calldata _userAddresses,
        string[] memory _tokenURIs
    ) public onlyOwner {
        require(publicSaleActive, "not ready for sale");
        require(
            _userAddresses.length == _tokenURIs.length,
            "Each address should have single URIs"
        );
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            require(
                _userAddresses[i] != address(0),
                "User Address cannot be address(0)"
            );
            require(
                balanceOf(_userAddresses[i]) < 1,
                "Max NFT mint Limit reached"
            );
            mintAirdrop(_userAddresses[i], _tokenURIs[i]);
        }
    }

    function mintAirdrop(address _useraddress, string memory _tokenURI)
        internal
        onlyOwner
    {
        uint256 supply = totalSupply();
        _safeMint(_useraddress, 1);

        tokenIdToTokenUri[supply] = _tokenURI;
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

    function burn(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner of the token can burn it."
        );
        _burn(tokenId);
    }

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
}
