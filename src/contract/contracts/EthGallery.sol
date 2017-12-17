pragma solidity ^0.4.18;

/// @title TBD.
contract EthGallery {
  uint256 constant GWEI = 1000000000;

  struct Painting {
    address owner;
  }

  event NewPainting(address owner, bytes32 id, bytes32[] image, uint256 size, string name);

  mapping(bytes32 => Painting) public paintings;

  address public owner = msg.sender;

  function EthGallery() public {}

  function createPainting(bytes32[] _image, uint256 _size, string _name) payable public {
    uint nameLength = utfStringLength(_name);

    require(nameLength < 350 && nameLength > 0);
    require(msg.value == (_size * GWEI));
    require(_size <= (_image.length * 32) && _size > ((_image.length - 1) * 32));

    uint256 offset = 0;

    if (_size < 32) {
      offset = (32 - _size) * 8;
    }

    // require((_image[0] >> (224 - offset)) == 0x464c4946);
    // require(((_image[0] << 48) >> (248 - offset)) == 0x3f);
    // require(((_image[0] << 56) >> (248 - offset)) == 0x3f);

    _image[_image.length - 1] = _image[_image.length - 1] & bytes32(~(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff << (8 * (_size % 32))));

    bytes32 id = keccak256(_image);

    require(paintings[id].owner == 0);

    paintings[id] = Painting({
      owner: msg.sender
    });

    NewPainting(msg.sender, id, _image, _size, _name);
  }

  function test() public returns(uint256) {
    return this.balance;
  }


  function utfStringLength(string str) private constant returns (uint length) {
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
          //For safety
          i+=1;

          length++;
      }
  }
}
