module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8449,
      network_id: "*" // Match any network id
    }
  },
  solc: {
   optimizer: {
     enabled: true,
     runs: 200
    }
  }
};
