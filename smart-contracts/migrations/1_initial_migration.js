// smart-contracts/migrations/1_initial_migration.js
const AccessControl = artifacts.require("AccessControl");
const VehicleRegistry = artifacts.require("VehicleRegistry");
const CarbonCalculator = artifacts.require("CarbonCalculator");

module.exports = async function (deployer, network, accounts) {
  // 部署访问控制合约
  await deployer.deploy(AccessControl);
  const accessControl = await AccessControl.deployed();
  
  // 部署车辆注册合约
  await deployer.deploy(VehicleRegistry, accessControl.address);
  
  // 部署碳减排计算合约
  await deployer.deploy(CarbonCalculator, accessControl.address);
  
  // 设置车辆管理角色
  const vehicleManagerRole = web3.utils.keccak256("VEHICLE_MANAGER_ROLE");
  await accessControl.grantRole(vehicleManagerRole, accounts[0]);
  
  // 设置计算员角色
  const calculatorRole = web3.utils.keccak256("CALCULATOR_ROLE");
  await accessControl.grantRole(calculatorRole, accounts[0]);
  
  console.log("合约部署完成!");
  console.log("AccessControl地址:", accessControl.address);
  console.log("VehicleRegistry地址:", VehicleRegistry.address);
  console.log("CarbonCalculator地址:", CarbonCalculator.address);
};
