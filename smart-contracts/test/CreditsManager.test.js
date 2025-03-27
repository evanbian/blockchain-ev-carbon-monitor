// smart-contracts/test/CreditsManager.test.js
const AccessControl = artifacts.require("AccessControl");
const VehicleRegistry = artifacts.require("VehicleRegistry");
const CarbonCalculator = artifacts.require("CarbonCalculator");
const CreditsGenerator = artifacts.require("CreditsGenerator");
const CreditsManager = artifacts.require("CreditsManager");

contract("CreditsManager", (accounts) => {
  const admin = accounts[0];
  const vehicleManager = accounts[1];
  const calculator = accounts[2];
  const creditsManager = accounts[3];
  const user1 = accounts[4];
  const user2 = accounts[5];
  
  let accessControl;
  let vehicleRegistry;
  let carbonCalculator;
  let creditsGenerator;
  let creditsManagerContract;
  
  // 测试数据
  const testVin = "TEST123456789";
  const testModel = "TEST_MODEL";
  const testBatteryCapacity = 75000; // 75 kWh in Wh
  const testDate = Math.floor(Date.now() / 1000);
  const testMileage = 100000; // 100 km in m
  const testEnergyConsumption = 15000; // 15 kWh in Wh
  let testCreditId;
  let calculationId;
  
  before(async () => {
    // 部署合约
    accessControl = await AccessControl.new();
    
    // 设置角色 - 这一步非常重要！
    const adminRole = web3.utils.keccak256("ADMIN_ROLE");
    const vehicleManagerRole = web3.utils.keccak256("VEHICLE_MANAGER_ROLE");
    const calculatorRole = web3.utils.keccak256("CALCULATOR_ROLE");
    const creditsManagerRole = web3.utils.keccak256("CREDITS_MANAGER_ROLE");
    
    // 确保角色正确设置
    // admin角色在构造函数中已自动赋予部署者
    await accessControl.grantRole(vehicleManagerRole, vehicleManager);
    await accessControl.grantRole(calculatorRole, calculator);
    await accessControl.grantRole(creditsManagerRole, creditsManager);
    
    // 部署其他合约
    vehicleRegistry = await VehicleRegistry.new(accessControl.address);
    carbonCalculator = await CarbonCalculator.new(accessControl.address);
    creditsGenerator = await CreditsGenerator.new(accessControl.address, carbonCalculator.address);
    creditsManagerContract = await CreditsManager.new(accessControl.address, creditsGenerator.address);
    
    // 重要：给CreditsManager合约本身授予CREDITS_MANAGER_ROLE权限
    await accessControl.grantRole(creditsManagerRole, creditsManagerContract.address);
    
    // 设置CreditsGenerator合约的CreditsManager合约地址
    await creditsGenerator.setCreditsManagerContract(creditsManagerContract.address);
    
    // 注册测试车辆
    await vehicleRegistry.registerVehicle(
      testVin,
      testModel,
      testBatteryCapacity,
      { from: vehicleManager }
    );
    
    // 计算碳减排
    const calculationTx = await carbonCalculator.calculateCarbonReduction(
      testVin,
      testDate,
      testMileage,
      testEnergyConsumption,
      { from: calculator }
    );
    
    // 从事件中获取calculationId
    const carbonReductionEvent = calculationTx.logs.find(
      log => log.event === 'CarbonReductionCalculated'
    );
    calculationId = carbonReductionEvent.args.calculationId;
    
    // 验证计算结果
    await carbonCalculator.verifyCalculation(calculationId, { from: admin });
    
    // 生成积分
    const generationTx = await creditsGenerator.generateCredits(calculationId, { from: creditsManager });
    
    // 从事件中获取creditId
    const creditsGeneratedEvent = generationTx.logs.find(
      log => log.event === 'CreditsGenerated'
    );
    testCreditId = creditsGeneratedEvent.args.creditId;
  });
  
  it("should have zero balance initially", async () => {
    const vehicleBalance = await creditsManagerContract.getVehicleBalance(testVin);
    assert.equal(vehicleBalance.toNumber(), 0, "Vehicle should have zero balance initially");
    
    const userBalance = await creditsManagerContract.getAccountBalance(user1);
    assert.equal(userBalance.toNumber(), 0, "User should have zero balance initially");
  });
  
  it("should issue credits to vehicle", async () => {
    // 发放积分
    await creditsManagerContract.issueCredits(testCreditId, { from: creditsManager });
    
    // 检查车辆余额
    const vehicleBalance = await creditsManagerContract.getVehicleBalance(testVin);
    assert.isAbove(vehicleBalance.toNumber(), 0, "Vehicle should have positive balance after issuance");
    
    // 检查总发行量
    const totalIssued = await creditsManagerContract.totalCreditsIssued();
    assert.equal(totalIssued.toString(), vehicleBalance.toString(), "Total issued should match vehicle balance");
    
    // 获取积分记录
    const creditRecord = await creditsGenerator.getCreditRecord(testCreditId);
    assert.equal(creditRecord.isIssued, true, "Credit record should be marked as issued");
  });
  
  it("should not issue the same credits twice", async () => {
    try {
      await creditsManagerContract.issueCredits(testCreditId, { from: creditsManager });
      assert.fail("Should not allow issuing the same credits twice");
    } catch (error) {
      assert(error.message.includes("credits already issued"), "Expected 'credits already issued' error");
    }
  });
  
  it("should transfer credits from vehicle to account", async () => {
    const vehicleBalanceBefore = await creditsManagerContract.getVehicleBalance(testVin);
    const userBalanceBefore = await creditsManagerContract.getAccountBalance(user1);
    
    const transferAmount = 10;
    
    // 确保车辆有足够的积分
    assert.isAtLeast(vehicleBalanceBefore.toNumber(), transferAmount, 
      "Vehicle should have enough credits for transfer");
    
    await creditsManagerContract.transferFromVehicle(
      testVin,
      user1,
      transferAmount,
      { from: creditsManager }
    );
    
    const vehicleBalanceAfter = await creditsManagerContract.getVehicleBalance(testVin);
    const userBalanceAfter = await creditsManagerContract.getAccountBalance(user1);
    
    assert.equal(
      vehicleBalanceAfter.toNumber(),
      vehicleBalanceBefore.toNumber() - transferAmount,
      "Vehicle balance should decrease"
    );
    
    assert.equal(
      userBalanceAfter.toNumber(),
      userBalanceBefore.toNumber() + transferAmount,
      "User balance should increase"
    );
  });
  
  it("should not allow non-credits manager to transfer from vehicle", async () => {
    try {
      await creditsManagerContract.transferFromVehicle(
        testVin,
        user1,
        5,
        { from: calculator }
      );
      assert.fail("Non-credits manager should not be able to transfer from vehicle");
    } catch (error) {
      assert(error.message.includes("caller is not credits manager"), "Expected 'caller is not credits manager' error");
    }
  });
  
  it("should transfer credits between accounts", async () => {
    const user1BalanceBefore = await creditsManagerContract.getAccountBalance(user1);
    const user2BalanceBefore = await creditsManagerContract.getAccountBalance(user2);
    
    // 确保用户1有足够的积分
    const transferAmount = 3;
    assert.isAtLeast(user1BalanceBefore.toNumber(), transferAmount, 
      "User1 should have enough credits for transfer");
    
    await creditsManagerContract.transfer(
      user2,
      transferAmount,
      { from: user1 }
    );
    
    const user1BalanceAfter = await creditsManagerContract.getAccountBalance(user1);
    const user2BalanceAfter = await creditsManagerContract.getAccountBalance(user2);
    
    assert.equal(
      user1BalanceAfter.toNumber(),
      user1BalanceBefore.toNumber() - transferAmount,
      "Sender balance should decrease"
    );
    
    assert.equal(
      user2BalanceAfter.toNumber(),
      user2BalanceBefore.toNumber() + transferAmount,
      "Receiver balance should increase"
    );
  });
  
  it("should not allow transfer if account has insufficient balance", async () => {
    const user1Balance = await creditsManagerContract.getAccountBalance(user1);
    
    try {
      await creditsManagerContract.transfer(
        user2,
        user1Balance.toNumber() + 1, // 余额+1
        { from: user1 }
      );
      assert.fail("Should not allow transfer if account has insufficient balance");
    } catch (error) {
      assert(error.message.includes("insufficient account credits"), "Expected 'insufficient account credits' error");
    }
  });
  
  it("should allow user to use credits", async () => {
    const user1BalanceBefore = await creditsManagerContract.getAccountBalance(user1);
    const totalUsedBefore = await creditsManagerContract.totalCreditsUsed();
    
    // 确保用户有足够的积分
    const useAmount = 2;
    assert.isAtLeast(user1BalanceBefore.toNumber(), useAmount, 
      "User should have enough credits to use");
    
    const purpose = "Testing credits usage";
    
    const usageTx = await creditsManagerContract.useCredits(
      useAmount,
      purpose,
      { from: user1 }
    );
    
    // 从事件中获取usageId
    const creditsUsedEvent = usageTx.logs.find(
      log => log.event === 'CreditsUsed'
    );
    const usageId = creditsUsedEvent.args.usageId;
    
    const user1BalanceAfter = await creditsManagerContract.getAccountBalance(user1);
    const totalUsedAfter = await creditsManagerContract.totalCreditsUsed();
    
    assert.equal(
      user1BalanceAfter.toNumber(),
      user1BalanceBefore.toNumber() - useAmount,
      "User balance should decrease"
    );
    
    assert.equal(
      totalUsedAfter.toNumber(),
      totalUsedBefore.toNumber() + useAmount,
      "Total used should increase"
    );
    
    // 检查使用记录
    const usageRecord = await creditsManagerContract.getUsageRecord(usageId);
    assert.equal(usageRecord.user, user1, "Usage record should have correct user");
    
    // 修复：转换为string后比较数值
    assert.equal(usageRecord.amount.toString(), useAmount.toString(), "Usage record should have correct amount");
    
    assert.equal(usageRecord.purpose, purpose, "Usage record should have correct purpose");
    
    // 检查账户使用记录
    const usageCount = await creditsManagerContract.getAccountUsageCount(user1);
    assert.equal(usageCount.toNumber(), 1, "User should have one usage record");
    
    const accountUsageId = await creditsManagerContract.getAccountUsageId(user1, 0);
    assert.equal(accountUsageId, usageId, "Account usage record should match");
  });
  
  it("should not allow using credits with insufficient balance", async () => {
    const user1Balance = await creditsManagerContract.getAccountBalance(user1);
    
    try {
      await creditsManagerContract.useCredits(
        user1Balance.toNumber() + 1, // 余额+1
        "Testing insufficient balance",
        { from: user1 }
      );
      assert.fail("Should not allow using credits with insufficient balance");
    } catch (error) {
      assert(error.message.includes("insufficient account credits"), "Expected 'insufficient account credits' error");
    }
  });
});
