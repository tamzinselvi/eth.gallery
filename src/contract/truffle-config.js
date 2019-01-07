module.exports = {
  compilers: {
    solc: {
      version: "0.4.24",
    },
  },
  networks: {
    develop: {
      accounts: 5,
      defaultEtherBalance: 10000,
      host: "localhost",
      port: 8545,
      network_id: "*"
    }
  },
  live: {
    network_id: 15,
    from: "0x391357ad95a037ee570ef392acdf7f2266d5d078"
  }
};
