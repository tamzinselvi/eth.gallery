pragma solidity ^0.4.18;

/// @title TBD.
contract EthGallery {
  struct Player {
    string name;
  }

  mapping(address => Player) public players;

  function EthGallery() {}

  function initializePlayer(string name) returns (Player _player) {
    Player memory player = Player({
      name: name
    });

    players[msg.sender] = _player;
  }

  function test() returns (uint256 _int) {
    _int = 7;

    return _int;
  }
}
