const UniversityCredentials = artifacts.require("UniversityCredentials");

module.exports = function (deployer) {
    deployer.deploy(UniversityCredentials);
};
