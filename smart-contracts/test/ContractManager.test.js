// smart-contracts/test/ContractManager.test.js
const AccessControl = artifacts.require("AccessControl");
const ContractManager = artifacts.require("ContractManager");

contract("ContractManager", (accounts) => {
  const admin = accounts[0];
  const nonAdmin = accounts[1];
  const dummyAddress1 = accounts[8];
  const dummyAddress2 = accounts[9];
  
  let accessControl;
  let contractManager;
  
  // 测试数据
  const testContractName = web3.utils.keccak256("TestContract");
  const testContractVersion = 1;
  
  before(async () => {
    // 部署合约
    accessControl = await AccessControl.new();
    contractManager = await ContractManager.new(accessControl.address);
  });
  
  it("should register new contract", async () => {
    await contractManager.registerContract(
      testContractName,
      dummyAddress1,
      testContractVersion,
      { from: admin }
    );
    
    const address = await contractManager.getContractAddress(testContractName);
    const version = await contractManager.getContractVersion(testContractName);
    
    assert.equal(address, dummyAddress1, "Contract address should be correct");
    assert.equal(version.toNumber(), testContractVersion, "Contract version should be correct");
    
    const count = await contractManager.getContractCount();
    assert.equal(count.toNumber(), 1, "Contract count should be 1");
  });
  
  it("should check if contract is registered", async () => {
    const isRegistered = await contractManager.isContractRegistered(testContractName);
    assert.equal(isRegistered, true, "Contract should be registered");
    
    const randomName = web3.utils.keccak256("RandomContract");
    const isRandomRegistered = await contractManager.isContractRegistered(randomName);
    assert.equal(isRandomRegistered, false, "Random contract should not be registered");
  });
  
  it("should not allow non-admin to register contract", async () => {
    const randomName = web3.utils.keccak256("RandomContract");
    
    try {
      await contractManager.registerContract(
        randomName,
        dummyAddress1,
        1,
        { from: nonAdmin }
      );
      assert.fail("Non-admin should not be able to register contract");
    } catch (error) {
      assert(error.message.includes("caller is not admin"), "Expected 'caller is not admin' error");
    }
  });
  
  it("should update existing contract", async () => {
    const updatedVersion = 2;
    
    await contractManager.registerContract(
      testContractName,
      dummyAddress2,
      updatedVersion,
      { from: admin }
    );
    
    const address = await contractManager.getContractAddress(testContractName);
    const version = await contractManager.getContractVersion(testContractName);
    
    assert.equal(address, dummyAddress2, "Contract address should be updated");
    assert.equal(version.toNumber(), updatedVersion, "Contract version should be updated");
    
    // 合约数量不应变化
    const count = await contractManager.getContractCount();
    assert.equal(count.toNumber(), 1, "Contract count should still be 1");
  });
  
  it("should upgrade contract", async () => {
    const newVersion = 3;
    
    await contractManager.upgradeContract(
      testContractName,
      dummyAddress1, // 切换回原来的地址
      newVersion,
      { from: admin }
    );
    
    const address = await contractManager.getContractAddress(testContractName);
    const version = await contractManager.getContractVersion(testContractName);
    
    assert.equal(address, dummyAddress1, "Contract address should be upgraded");
    assert.equal(version.toNumber(), newVersion, "Contract version should be upgraded");
  });
  
  it("should not allow upgrading to lower version", async () => {
    const lowerVersion = 2;
    
    try {
      await contractManager.upgradeContract(
        testContractName,
        dummyAddress2,
        lowerVersion,
        { from: admin }
      );
      assert.fail("Should not allow upgrading to lower version");
    } catch (error) {
      assert(error.message.includes("new version must be greater"), "Expected 'new version must be greater' error");
    }
  });
  
  it("should not allow non-admin to upgrade contract", async () => {
    const newVersion = 4;
    
    try {
      await contractManager.upgradeContract(
        testContractName,
        dummyAddress2,
        newVersion,
        { from: nonAdmin }
      );
      assert.fail("Non-admin should not be able to upgrade contract");
    } catch (error) {
      assert(error.message.includes("caller is not admin"), "Expected 'caller is not admin' error");
    }
  });
  
  it("should not allow upgrading non-existent contract", async () => {
    const randomName = web3.utils.keccak256("RandomContract");
    
    try {
      await contractManager.upgradeContract(
        randomName,
        dummyAddress1,
        1,
        { from: admin }
      );
      assert.fail("Should not allow upgrading non-existent contract");
    } catch (error) {
      assert(error.message.includes("contract not registered"), "Expected 'contract not registered' error");
    }
  });
  
  it("should fail when getting address of non-existent contract", async () => {
    const randomName = web3.utils.keccak256("RandomContract");
    
    try {
      await contractManager.getContractAddress(randomName);
      assert.fail("Should not allow getting address of non-existent contract");
    } catch (error) {
      assert(error.message.includes("contract not registered"), "Expected 'contract not registered' error");
    }
  });
  
  it("should fail when getting version of non-existent contract", async () => {
    const randomName = web3.utils.keccak256("RandomContract");
    
    try {
      await contractManager.getContractVersion(randomName);
      assert.fail("Should not allow getting version of non-existent contract");
    } catch (error) {
      assert(error.message.includes("contract not registered"), "Expected 'contract not registered' error");
    }
  });
});
