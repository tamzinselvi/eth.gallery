pragma solidity ^0.4.24;

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
    require(
      msg.sender == grandCuratorAddress,
      "You must be the Grant Curator to do this."  
    );
    _;
  }

  function setGC(address _newGC) external onlyGC {
    require(
      _newGC != address(0),
      "The new Grand Curator cannot be address(0)."
    );

    grandCuratorAddress = _newGC;
  }

  modifier whenNotPaused() {
    require(
      !paused,
      "You may not do this when the Gallery is paused."
    );
    _;
  }

  modifier whenPaused {
    require(
      paused,
      "You may only do this while the Gallery is paused."
    );
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
  function _utfStringLength(string memory str) internal pure returns (uint length) {
    uint i = 0;
    bytes memory string_rep = bytes(str);

    while (i<string_rep.length) {
      if (string_rep[i]>>7==0)
        i += 1;
      else if (string_rep[i]>>5==0x6)
        i += 2;
      else if (string_rep[i]>>4==0xE)
        i += 3;
      else if (string_rep[i]>>3==0x1E)
        i += 4;
      else
        i += 1;

      length++;
    }
  }

  function _bytes32ToString (bytes32 data) internal pure returns (string memory) {
    bytes memory bytesString = new bytes(32);
    for (uint j = 0; j < 32; j++) {
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

    emit Transfer(_from, _to, _tokenId);
  }

  function _createPainting(
    bytes32[] memory _image,
    uint256 _size,
    string memory _name,
    string memory _description
  ) internal returns (uint256) {
    uint nameLength = _utfStringLength(_name);
    uint descriptionLength = _utfStringLength(_description);

    require(
      nameLength <= 350 && nameLength > 0,
      "Your painting name must be between 1 and 350 characters."
    );
    require(
      descriptionLength <= 1000 && descriptionLength > 0,
      "Your painting description must be between 1 and 1000 characters."
    );
    require(
      msg.value == (_size * GWEI),
      "You must pay the exact needed amount for this transaction."
    );
    require(
      _size <= (_image.length * 32) && _size > ((_image.length - 1) * 32),
      "Your painting size did not align with your image length."
    );

    uint256 offset = 0;

    if (_size < 32) {
      offset = (32 - _size) * 8;
    }

    require(
      (_image[0] >> (224 - offset)) == 0x464c4946,
      "Your painting has an invalid FLIF header."
    );
    require(
      ((_image[0] << 32) >> (252 - offset)) == 0x3,
      "Your painting has an invalid FLIF header."
    );
    require(
      ((_image[0] << 36) >> (252 - offset)) == 0x3,
      "Your painting has an invalid FLIF header."
    );
    require(
      ((_image[0] << 48) >> (248 - offset)) == 0x3f,
      "Your painting has an invalid FLIF header."
    );
    require(
      ((_image[0] << 56) >> (248 - offset)) == 0x3f,
      "Your painting has an invalid FLIF header."
    );

    _image[_image.length - 1] = _image[_image.length - 1] &
      bytes32(~(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff << (8 * (_size % 32))));

    uint256 id = uint256(keccak256(abi.encodePacked(_image)));

    require(
      paintingIdToOwner[id] == address(0),
      "Your painting has the same ID as another, this is either because it is a copy or you are very un/lucky."
    );

    paintingIdToOwner[id] = msg.sender;

    paintings.push(Painting({
      id: id
    }));

    emit NewPainting(msg.sender, id, _image, _size, _name, _description);

    return id;
  }
}

contract GalleryToken is GalleryBase, ERC721 {
  string public constant name = "Painting";
  string public constant symbol = "ART";

  bytes4 constant InterfaceSignature_ERC165 =
    bytes4(keccak256("supportsInterface(bytes4)"));

  bytes4 constant InterfaceSignature_ERC721 =
    bytes4(keccak256("name()")) ^
    bytes4(keccak256("symbol()")) ^
    bytes4(keccak256("totalSupply()")) ^
    bytes4(keccak256("balanceOf(address)")) ^
    bytes4(keccak256("ownerOf(uint256)")) ^
    bytes4(keccak256("approve(address,uint256)")) ^
    bytes4(keccak256("transfer(address,uint256)")) ^
    bytes4(keccak256("transferFrom(address,address,uint256)")) ^
    bytes4(keccak256("tokensOfOwner(address)"));

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
    require(
      _to != address(0),
      "You cannot make a transfer to address(0)."
    );
    require(
      _to != address(this),
      "You cannot make a transfer to this contract."
    );
    require(
      _owns(msg.sender, _tokenId),
      "You must own a token to send it to someone."
    );
    _transfer(msg.sender, _to, _tokenId);
  }

  function approve(address _to, uint256 _tokenId) external whenNotPaused {
    require(
      _owns(msg.sender, _tokenId),
      "You must own a token to make an approval on it's behalf."
    );

    _approve(_tokenId, _to);

    emit Approval(msg.sender, _to, _tokenId);
  }

  function transferFrom(address _from, address _to, uint256 _tokenId) external whenNotPaused {
    require(
      _to != address(0),
      "You cannot make a transfer to address(0)."
    );
    require(
      _to != address(this),
      "You cannot make a transfer to this contract."
    );
    require(
      _approvedFor(msg.sender, _tokenId),
      "You cannot make a transfer from another without approval."
    );
    require(
      _owns(_from, _tokenId),
      "You specified a from address of a user who does not own this token."
    );
    _transfer(_from, _to, _tokenId);
  }

  function totalSupply() public view returns (uint256) {
    return paintings.length;
  }

  function ownerOf(uint256 _tokenId) external view returns (address owner) {
    owner = paintingIdToOwner[_tokenId];

    require(
      owner != address(0),
      "You cannot have a painting owned by a user who does not exist."
    );
  }

  function tokensOfOwner(address _owner) external view returns(uint256[] memory ownerTokens) {
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
    emit Transfer(address(0), msg.sender, id);
  }

  function createAuction(uint256 _id, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration) external {
    require(
      msg.sender == paintingIdToOwner[_id],
      "You must be the owner of a painting to create an auction."
    );

    Auction storage auction = auctions[_id];

    if (auction.owner != address(0)) {
      require(
        !auction.active || ((auction.startingBlock + auction.duration) < block.number),
        "You cannot create an auction for a painting when one already exists."
      );
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

    emit NewAuction(_id, _startingPrice, _endingPrice, _duration);
  }

  // function cancelAuction(uint256 _id) external {
  //   
  // }

  function acceptOffer(address _from, uint256 _id) external payable {
    address ownerId = paintingIdToOwner[_id];

    require(
      ownerId == msg.sender,
      "You must be the owner of a painting to accept an offer."
    );
    require(
      _from != msg.sender,
      "You cannot accept an offer from yourself."
    );
    require(
      offers[_from][_id].offeror != address(0),
      "You cannot accept an offer one one has not been made."
    );
    require(
      offers[_from][_id].id == _id,
      "You cannot accept this offer as the ID is mismatched."
    );

    Offer storage offer = offers[_from][_id];

    delete offers[_from][_id];

    require(
      msg.sender.send((msg.value / 105) * 100),
      "You cannot accept this offer as the contract does not have enough to pay you."
    );

    _transfer(msg.sender, _from, _id);

    emit AcceptedOffer(_from, _id, (offer.price / 105) * 100);
  }

  function createOffer(uint256 _id) external payable {
    address ownerId = paintingIdToOwner[_id];

    require(
      ownerId != address(0),
      "You cannot create an offer for a painting that does not exist."
    );
    require(
      ownerId != msg.sender,
      "You cannot create an offer for your own painting."
    );
    require(
      offers[msg.sender][_id].offeror == address(0),
      "You cannot create an offer if you have already made one."
    );

    offers[msg.sender][_id] = Offer({
      offeror: msg.sender,
      id: _id,
      price: msg.value
    });

    emit NewOffer(msg.sender, _id, (msg.value / 105) * 100);
  }

  function cancelOffer(uint256 _id) external payable {
    require(
      offers[msg.sender][_id].offeror != address(0),
      "You cannot cancel an offer if you have not made one."
    );

    Offer storage offer = offers[msg.sender][_id];
    delete offers[msg.sender][_id];

    require(
      msg.sender.send(offer.price),
      "You cannot cancel this offer as the contract cannot pay you back."
    );

    emit CanceledOffer(msg.sender, _id, offer.price);
  }

  function buy(uint256 _id) external payable {
    Auction storage auction = auctions[_id];

    uint256 startingBlock = auction.startingBlock;
    uint256 duration = auction.duration;

    require(
      auctions[_id].active,
      "You cannot buy a painting in an auction that is not active."
    );

    auctions[_id].active = false;

    require(
      auction.owner != address(0),
      "You cannot buy a painting from an auction that does not exist."
    );
    require(
      (startingBlock + duration) >= block.number,
      "You cannot buy a painting from an auction that has expired."
    );

    uint256 currentPrice = auction.startingPrice - ((auction.startingPrice - auction.endingPrice) * ((block.number - startingBlock) / duration));
    uint256 commission = ((currentPrice * 5) / 100);
    require(
      msg.value >= (currentPrice + commission),
      "You must pay the correct price for the painting to buy it."
    );

    address previousOwner = paintingIdToOwner[_id];

    require(
      previousOwner.send(currentPrice),
      "You cannot buy this painting as the contract does not have enough funds to facilitate the transaction."
    );
    require(
      msg.sender.send(msg.value - currentPrice - commission),
      "You cannot buy this painting as the contract does not have enough funds to facilitate the transaction."
    );

    _transfer(previousOwner, msg.sender, _id);

    emit PurchasedAuction(msg.sender, _id, currentPrice + commission);
  }
}
