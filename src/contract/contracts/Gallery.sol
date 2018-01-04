pragma solidity ^0.4.14;

contract ERC721 {
  function totalSupply() public view returns (uint256 total);
  function balanceOf(address _owner) public view returns (uint256 balance);
  function ownerOf(uint256 _tokenId) external view returns (address owner);
  function approve(address _to, uint256 _tokenId) external;
  function transfer(address _to, uint256 _tokenId) external;
  function transferFrom(address _from, address _to, uint256 _tokenId) external;

  event Transfer(address from, address to, uint256 tokenId);
  event Approval(address owner, address approved, uint256 tokenId);

  function supportsInterface(bytes4 _interfaceID) external view returns (bool);
}

contract GalleryAccessControl {
  event ContractUpgrade(address newContract);

  address public grandCuratorAddress;

  bool public paused = false;

  modifier onlyGC() {
    require(msg.sender == grandCuratorAddress);
    _;
  }

  function setGC(address _newGC) external onlyGC {
    require(_newGC != address(0));

    grandCuratorAddress = _newGC;
  }

  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  modifier whenPaused {
    require(paused);
    _;
  }

  function pause() external onlyGC whenNotPaused {
    paused = true;
  }

  function unpause() public onlyGC whenPaused {
    paused = false;
  }
}

contract DataReader {
  function _utfStringLength(string str) internal constant returns (uint length) {
    uint i=0;
    bytes memory string_rep = bytes(str);

    while (i<string_rep.length)
      {
        if (string_rep[i]>>7==0)
          i+=1;
        else if (string_rep[i]>>5==0x6)
          i+=2;
        else if (string_rep[i]>>4==0xE)
          i+=3;
        else if (string_rep[i]>>3==0x1E)
          i+=4;
        else
          i+=1;

          length++;
      }
  }

  function _bytes32ToString (bytes32 data) returns (string) {
    bytes memory bytesString = new bytes(32);
    for (uint j=0; j<32; j++) {
      byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
      if (char != 0) {
        bytesString[j] = char;
      }
    }
    return string(bytesString);
  }
}

contract GalleryBase is GalleryAccessControl, DataReader {
  uint256 constant GWEI = 1000000000;

  event NewPainting(address owner, uint256 id, bytes32[] image, uint256 size, string name, string description);
  event Transfer(address from, address to, uint256 id);

  struct Painting {
    uint256 id;
  }

  Painting[] paintings;
  mapping(uint256 => address) paintingIdToOwner;
  mapping(uint256 => address) paintingIdToApproved;
  mapping(address => uint256) ownershipTokenCount;

  function _transfer(address _from, address _to, uint256 _tokenId) internal {
    paintingIdToOwner[_tokenId] = _to;

    ownershipTokenCount[_from]--;
    ownershipTokenCount[_to]++;

    Transfer(_from, _to, _tokenId);
  }

  function _createPainting(bytes32[] _image, uint256 _size, string _name, string _description) internal returns (uint256) {
    uint nameLength = _utfStringLength(_name);
    uint descriptionLength = _utfStringLength(_description);

    require(nameLength <= 350 && nameLength > 0);
    require(descriptionLength <= 1000 && descriptionLength > 0);
    require(msg.value == (_size * GWEI));
    require(_size <= (_image.length * 32) && _size > ((_image.length - 1) * 32));

    uint256 offset = 0;

    if (_size < 32) {
      offset = (32 - _size) * 8;
    }

    require((_image[0] >> (224 - offset)) == 0x464c4946);
    require(((_image[0] << 32) >> (252 - offset)) == 0x3);
    require(((_image[0] << 36) >> (252 - offset)) == 0x3);
    require(((_image[0] << 48) >> (248 - offset)) == 0x3f);
    require(((_image[0] << 56) >> (248 - offset)) == 0x3f);

    _image[_image.length - 1] = _image[_image.length - 1] & bytes32(~(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff << (8 * (_size % 32))));

    uint256 id = uint256(keccak256(_image));

    require(paintingIdToOwner[id] == address(0));

    paintingIdToOwner[id] = msg.sender;

    paintings.push(Painting({
      id: id
    }));

    NewPainting(msg.sender, id, _image, _size, _name, _description);

    return id;
  }
}

contract GalleryToken is GalleryBase, ERC721 {
  string public constant name = "Painting";
  string public constant symbol = "ART";

  bytes4 constant InterfaceSignature_ERC165 =
    bytes4(keccak256('supportsInterface(bytes4)'));

  bytes4 constant InterfaceSignature_ERC721 =
    bytes4(keccak256('name()')) ^
  bytes4(keccak256('symbol()')) ^
  bytes4(keccak256('totalSupply()')) ^
  bytes4(keccak256('balanceOf(address)')) ^
  bytes4(keccak256('ownerOf(uint256)')) ^
  bytes4(keccak256('approve(address,uint256)')) ^
  bytes4(keccak256('transfer(address,uint256)')) ^
  bytes4(keccak256('transferFrom(address,address,uint256)')) ^
  bytes4(keccak256('tokensOfOwner(address)'));

  function supportsInterface(bytes4 _interfaceID) external view returns (bool) {
    // require((InterfaceSignature_ERC165 == 0x01ffc9a7) && (InterfaceSignature_ERC721 == 0x9a20483d));

    return ((_interfaceID == InterfaceSignature_ERC165) || (_interfaceID == InterfaceSignature_ERC721));
  }

  function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
    return paintingIdToOwner[_tokenId] == _claimant;
  }

  function _approvedFor(address _claimant, uint256 _tokenId) internal view returns (bool) {
    return paintingIdToApproved[_tokenId] == _claimant;
  }

  function _approve(uint256 _tokenId, address _approved) internal {
    paintingIdToApproved[_tokenId] = _approved;
  }

  function balanceOf(address _owner) public view returns (uint256 count) {
    return ownershipTokenCount[_owner];
  }

  function transfer(address _to,uint256 _tokenId) external whenNotPaused {
    require(_to != address(0));
    require(_to != address(this));
    require(_owns(msg.sender, _tokenId));
    _transfer(msg.sender, _to, _tokenId);
  }

  function approve(address _to, uint256 _tokenId) external whenNotPaused {
    require(_owns(msg.sender, _tokenId));

    _approve(_tokenId, _to);

    Approval(msg.sender, _to, _tokenId);
  }

  function transferFrom(address _from, address _to, uint256 _tokenId) external whenNotPaused {
    require(_to != address(0));
    require(_to != address(this));
    require(_approvedFor(msg.sender, _tokenId));
    require(_owns(_from, _tokenId));
    _transfer(_from, _to, _tokenId);
  }

  function totalSupply() public view returns (uint256) {
    return paintings.length;
  }

  function ownerOf(uint256 _tokenId) external view returns (address owner) {
    owner = paintingIdToOwner[_tokenId];

    require(owner != address(0));
  }

  function tokensOfOwner(address _owner) external view returns(uint256[] ownerTokens) {
    uint256 tokenCount = balanceOf(_owner);

    if (tokenCount == 0) {
      return new uint256[](0);
    } else {
      uint256[] memory result = new uint256[](tokenCount);
      uint256 totalPaintings = totalSupply();

      uint256 paintingIndex;

      for (paintingIndex = 0; paintingIndex < totalPaintings; paintingIndex++) {
        if (paintingIdToOwner[paintings[paintingIndex].id] == _owner) {
          result[paintingIndex] = paintings[paintingIndex].id;
        }
      }

      return result;
    }
  }
}

contract Gallery is GalleryToken {
  event NewOffer(address offeror, uint256 id, uint256 price);
  event AcceptedOffer(address offeror, uint256 id, uint256 price);
  event CanceledOffer(address offeror, uint256 id, uint256 price);
  event NewAuction(uint256 id, uint256 startingPrice, uint256 endingPrice, uint256 duration);
  event CanceledAuction(uint256 id);
  event PurchasedAuction(address purchaser, uint256 id, uint256 price);

  struct Auction {
    address owner;
    bool active;
    uint256 id;
    uint256 startingPrice;
    uint256 endingPrice;
    uint256 startingBlock;
    uint256 duration;
  }

  struct Offer {
    address offeror;
    uint256 id;
    uint256 price;
  }

  mapping(address => mapping(uint256 => Offer)) offers;
  mapping(uint256 => Auction) auctions;

  function createPainting(bytes32[] _image, uint256 _size, string _name, string _description) external payable {
    uint256 id = _createPainting(_image, _size, _name, _description);

    ownershipTokenCount[msg.sender]++;
    Transfer(address(0), msg.sender, id);
  }

  function createAuction(uint256 _id, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration) external {
    require(msg.sender == paintingIdToOwner[_id]);

    Auction auction = auctions[_id];

    if (auction.owner != address(0)) {
      require(!auction.active || ((auction.startingBlock + auction.duration) < block.number));
    }

    auctions[_id] = Auction({
      id: _id,
      active: true,
      owner: msg.sender,
      startingPrice: _startingPrice,
      endingPrice: _endingPrice,
      startingBlock: block.number,
      duration: _duration
    });

    NewAuction(_id, _startingPrice, _endingPrice, _duration);
  }

  function cancelAuction(uint256 _id) external {
    
  }

  function acceptOffer(address _from, uint256 _id) external {
    address ownerId = paintingIdToOwner[_id];

    require(ownerId == msg.sender);
    require(_from != msg.sender);
    require(offers[_from][_id].offeror != address(0));
    require(offers[_from][_id].id == _id);

    Offer offer = offers[_from][_id];

    delete offers[_from][_id];

    require(msg.sender.send((msg.value / 105) * 100));

    _transfer(msg.sender, _from, _id);

    AcceptedOffer(_from, _id, (offer.price / 105) * 100);
  }

  function createOffer(uint256 _id) external payable {
    address ownerId = paintingIdToOwner[_id];

    require(ownerId != address(0));
    require(ownerId != msg.sender);
    require(offers[msg.sender][_id].offeror == address(0));

    offers[msg.sender][_id] = Offer({
      offeror: msg.sender,
      id: _id,
      price: msg.value
    });

    NewOffer(msg.sender, _id, (msg.value / 105) * 100);
  }

  function cancelOffer(uint256 _id) external payable {
    require(offers[msg.sender][_id].offeror != address(0));

    Offer offer = offers[msg.sender][_id];
    delete offers[msg.sender][_id];

    require(msg.sender.send(offer.price));

    CanceledOffer(msg.sender, _id, offer.price);
  }

  function buy(uint256 _id) external payable {
    Auction auction = auctions[_id];

    uint256 startingBlock = auction.startingBlock;
    uint256 duration = auction.duration;

    require(auctions[_id].active);

    auctions[_id].active = false;

    require(auction.owner != address(0));
    require((startingBlock + duration) >= block.number);

    uint256 currentPrice = auction.startingPrice - ((auction.startingPrice - auction.endingPrice) * ((block.number - startingBlock) / duration));
    uint256 commission = ((currentPrice * 5) / 100);
    require(msg.value >= (currentPrice + commission));

    address previousOwner = paintingIdToOwner[_id];

    require(previousOwner.send(currentPrice));
    require(msg.sender.send(msg.value - currentPrice - commission));

    _transfer(previousOwner, msg.sender, _id);

    PurchasedAuction(msg.sender, _id, currentPrice + commission);
  }
}
