// smart-contracts/migrations/2_deploy_contracts.js
const AccessControl = artifacts.require("AccessControl");
const VehicleRegistry = artifacts.require("VehicleRegistry");
const CarbonCalculator = artifacts.require("CarbonCalculator");
const CreditsGenerator = artifacts.require("CreditsGenerator");
const CreditsManager = artifacts.require("CreditsManager");
const ContractManager = artifacts.require("ContractManager");

module.exports = async function (deployer, network, accounts) {
  // 获取已部署的合约实例
  const accessControl = await AccessControl.deployed();
  const vehicleRegistry = await VehicleRegistry.deployed();
  const carbonCalculator = await CarbonCalculator.deployed();
  
  // 部署CreditsGenerator合约
  await deployer.deploy(CreditsGenerator, accessControl.address, carbonCalculator.address);
  const creditsGenerator = await CreditsGenerator.deployed();
  
  // 部署CreditsManager合约
  await deployer.deploy(CreditsManager, accessControl.address, creditsGenerator.address);
  const creditsManager = await CreditsManager.deployed();
  
  // 部署ContractManager合约
  await deployer.deploy(ContractManager, accessControl.address);
  const contractManager = await ContractManager.deployed();
  
  // 设置积分管理员角色
  const creditsManagerRole = web3.utils.keccak256("CREDITS_MANAGER_ROLE");
  await accessControl.grantRole(creditsManagerRole, accounts[0]);
  
  // 重要：给CreditsManager合约本身授予CREDITS_MANAGER_ROLE权限
  await accessControl.grantRole(creditsManagerRole, creditsManager.address);
  
  // 设置CreditsGenerator合约的CreditsManager合约地址
  await creditsGenerator.setCreditsManagerContract(creditsManager.address);
  
  // 在ContractManager中注册所有合约
  await contractManager.registerContract(
    web3.utils.keccak256("AccessControl"),
    accessControl.address,
    1
  );
  
  await contractManager.registerContract(
    web3.utils.keccak256("VehicleRegistry"),
    vehicleRegistry.address,
    1
  );
  
  await contractManager.registerContract(
    web3.utils.keccak256("CarbonCalculator"),
    carbonCalculator.address,
    1
  );
  
  await contractManager.registerContract(
    web3.utils.keccak256("CreditsGenerator"),
    creditsGenerator.address,
    1
  );
  
  await contractManager.registerContract(
    web3.utils.keccak256("CreditsManager"),
    creditsManager.address,
    1
  );
  
  await contractManager.registerContract(
    web3.utils.keccak256("ContractManager"),
    contractManager.address,
    1
  );
  
  console.log("所有合约部署完成!");
  console.log("AccessControl地址:", accessControl.address);
  console.log("VehicleRegistry地址:", vehicleRegistry.address);
  console.log("CarbonCalculator地址:", carbonCalculator.address);
  console.log("CreditsGenerator地址:", creditsGenerator.address);
  console.log("CreditsManager地址:", creditsManager.address);
  console.log("ContractManager地址:", contractManager.address);
};
