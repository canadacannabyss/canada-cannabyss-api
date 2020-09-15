pragma solidity >=0.4.21;

contract CanadaCannabyss {
    address payable public owner;

    constructor() public {
        owner = msg.sender;
    }

    uint256 id;
    uint256 purchaseId;
    struct seller {
        string name;
        address addr;
        uint256 bankGuaraantee;
        bool bgPaid;
    }
    struct product {
        string productId;
        string productName;
        string Category;
        uint256 price;
        string description;
        address payable seller;
        bool isActive;
    }

    function buyProduct(uint256 memory _amount, string memory _address)
        public
        payable
    {}
}
