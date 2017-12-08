pragma solidity ^0.4.11;

/// @title TBD.
contract Gallery {
  // constants
  int8 constant INT8_MIN = int8((uint8(1) << 7));
  int8 constant INT8_MAX = int8(~((uint8(1) << 7)));
  uint8 constant UINT8_MIN = 0;
  uint8 constant UINT8_MAX = ~uint8(0);
  int256 constant INT256_MIN = int256((uint256(1) << 255));
  int256 constant INT256_MAX = int256(~((uint256(1) << 255)));
  uint256 constant UINT256_MIN = 0;
  uint256 constant UINT256_MAX = ~uint256(0);

  // structs
  struct Developer {
    address delegate;
  }

  // enum MonsterTypes { Fire, Water, Electric, Shadow, Light }

  struct Picture {
    uint256 id;
    uint256 marketValue;
    address owner;
    byte[] data;
  }

  struct User {
    address delegate;
    mapping(uint256 => uint256) pictures;
    mapping(uint256 => uint256) inboundTradeRequests;
    mapping(uint256 => uint256) outboundTradeRequests;
  }

  struct Trade {
    unit256 id;
    address from;
    address to;
    uint256 pId;
    uint256 price;
  }

  // global vars
  // mapping(address => uint256) private balanceOf;
  mapping(address => Developer) private developers;
  mapping(uint256 => Picture) public pictureIds;
  mapping(address => User) public users;
  uint256 public totalPictureCount;

  function Gallery() {
  }

  modifier onlyDeveloper() {
    require(developers[msg.sender].delegate != 0);
    _;
  }

  modifier onlyUser() {
    require(users[msg.sender].delegate != 0);
    _;
  }

  function initializeUser() {
    require(users[msg.sender].delegate == 0);

    users[msg.sender] = User({
      delegate: msg.sender
    });
  }

  function tradeRequest(address _receiver, uint256 _pictureId, uint256 _askingPrice) onlyUser {
    require(users[_receiver]);

    TradeRequest memory newTradeRequest = TradeRequest({
      id: globalTradeCount++,
      from: msg.sender,
      to: _receiver,
      price: _askingPrice
    });

    tradeRequests[newTradeRequest.id] = newTradeRequest;
    users[newTradeRequest.from].tradeRequestIds.push(newTradeRequest.id);
    users[newTradeRequest.to].tradeRequestIds.push(newTradeRequest.id);
  }

  function tradeAccept(uint256 _tradeRequestId) payable onlyUser {
    require(tradeRequests[_tradeRequestId]);
    
    tradeRequests[_tradeRequestId].from

    delete tradeRequests[_tradeRequestId];
  }

  function tradeDeny(uint256 _tradeRequestId) onlyUser {

  }

  function transfer(uint256

  function generateRandomUInt8() private returns(uint8 _random) {
    uint8 random;
    uint8 r1 = uint8(block.blockhash(block.number-1));
    uint8 r2 = uint8(block.blockhash(block.number-2));

    assembly {
      random := xor(r1, r2)
    }

    return random;
  }

  function generateRandomUInt256() private returns(uint256 _random) {
    return generateRandomUInt256(0);
  }

  function generateRandomUInt256(uint256 offset) private returns(uint256 _random) {
    uint256 random;
    uint256 r1 = uint8(block.blockhash(block.number-1-offset));
    uint256 r2 = uint8(block.blockhash(block.number-2-offset));

    assembly {
      random := xor(r1, r2)
    }

    return random;
  }
}
