// smart-contracts/test/CreditsGenerator.test.js
const AccessControl = artifacts.require("AccessControl");
const VehicleRegistry = artifacts.require("VehicleRegistry");
const CarbonCalculator = artifacts.require("CarbonCalculator");
const CreditsGenerator = artifacts.require("CreditsGenerator");

contract("CreditsGenerator", (accounts) => {
  const admin = accounts[0];
  const vehicleManager = accounts[1];
  const calculator = accounts[2];
  const creditsManager = accounts[3];
  
  let accessControl;
  let vehicleRegistry;
  let carbonCalculator;
  let creditsGenerator;
  
  // 测试数据
  const testVin = "TEST123456789";
  const testModel = "TEST_MODEL";
  const testBatteryCapacity = 75000; // 75 kWh in Wh
  const testDate = Math.floor(Date.now() / 1000);
  const testMileage = 100000; // 100 km in m
  const testEnergyConsumption = 15000; // 15 kWh in Wh
  
  before(async () => {
    // 部署合约
    accessControl = await AccessControl.new();
    vehicleRegistry = await VehicleRegistry.new(accessControl.address);
    carbonCalculator = await CarbonCalculator.new(accessControl.address);
    creditsGenerator = await CreditsGenerator.new(accessControl.address, carbonCalculator.address);
    
    // 设置角色
    const vehicleManagerRole = web3.utils.keccak256("VEHICLE_MANAGER_ROLE");
    await accessControl.grantRole(vehicleManagerRole, vehicleManager);
    
    const calculatorRole = web3.utils.keccak256("CALCULATOR_ROLE");
    await accessControl.grantRole(calculatorRole, calculator);
    
    const creditsManagerRole = web3.utils.keccak256("CREDITS_MANAGER_ROLE");
    await accessControl.grantRole(creditsManagerRole, creditsManager);
    
    // 注册测试车辆
    await vehicleRegistry.registerVehicle(
      testVin,
      testModel,
      testBatteryCapacity,
      { from: vehicleManager }
    );
  });
  
  it("should have the correct conversion rate", async () => {
    const rate = await creditsGenerator.conversionRate();
    assert.equal(rate.toString(), "50000", "Conversion rate should be 0.05 * 10^6");
  });
  
  it("should allow admin to set the conversion rate", async () => {
    const newRate = 60000; // 0.06 * 10^6
    await creditsGenerator.setConversionRate(newRate, { from: admin });
    
    const rate = await creditsGenerator.conversionRate();
    assert.equal(rate.toString(), newRate.toString(), "Conversion rate should be updated");
  });
  
  it("should not allow non-admin to set the conversion rate", async () => {
    const newRate = 70000; // 0.07 * 10^6
    
    try {
      await creditsGenerator.setConversionRate(newRate, { from: vehicleManager });
      assert.fail("Non-admin should not be able to set conversion rate");
    } catch (error) {
      assert(error.message.includes("caller is not admin"), "Expected 'caller is not admin' error");
    }
  });
  
  it("should generate credits from a verified carbon calculation", async () => {
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
    const calculationId = carbonReductionEvent.args.calculationId;
    
    // 验证计算结果
    await carbonCalculator.verifyCalculation(calculationId, { from: admin });
    
    // 生成积分
    const generationTx = await creditsGenerator.generateCredits(calculationId, { from: creditsManager });
    
    // 从事件中获取creditId
    const creditsGeneratedEvent = generationTx.logs.find(
      log => log.event === 'CreditsGenerated'
    );
    const creditId = creditsGeneratedEvent.args.creditId;
    
    // 检查积分记录
    const creditRecord = await creditsGenerator.getCreditRecord(creditId);
    assert.equal(creditRecord.calculationId, calculationId, "Credit record should reference the correct calculation");
    assert.equal(creditRecord.vin, testVin, "Credit record should have the correct VIN");
    assert.equal(creditRecord.isIssued, false, "Credit record should not be marked as issued yet");
    
    // 检查映射
    const mappedCreditId = await creditsGenerator.getCreditIdForCalculation(calculationId);
    assert.equal(mappedCreditId, creditId, "Mapping from calculation to credit should be correct");
    
    // 检查车辆积分记录
    const creditRecordCount = await creditsGenerator.getVehicleCreditRecordCount(testVin);
    assert.equal(creditRecordCount.toNumber(), 1, "Vehicle should have one credit record");
    
    const vehicleCreditId = await creditsGenerator.getVehicleCreditId(testVin, 0);
    assert.equal(vehicleCreditId, creditId, "Vehicle's credit record should match");
  });
  
  it("should not generate credits twice for the same calculation", async () => {
    // 获取第一条车辆记录的creditId
    const creditId = await creditsGenerator.getVehicleCreditId(testVin, 0);
    // 获取积分记录
    const creditRecord = await creditsGenerator.getCreditRecord(creditId);
    
    try {
      await creditsGenerator.generateCredits(creditRecord.calculationId, { from: creditsManager });
      assert.fail("Should not allow generating credits twice for the same calculation");
    } catch (error) {
      assert(error.message.includes("credits already generated"), "Expected 'credits already generated' error");
    }
  });
  
  it("should not generate credits for unverified calculations", async () => {
    // 计算另一条碳减排记录
    const calculationTx = await carbonCalculator.calculateCarbonReduction(
      testVin,
      testDate + 86400, // 一天后
      testMileage + 50000, // 增加50km
      testEnergyConsumption + 7500, // 增加7.5kWh
      { from: calculator }
    );
    
    const carbonReductionEvent = calculationTx.logs.find(
      log => log.event === 'CarbonReductionCalculated'
    );
    const calculationId = carbonReductionEvent.args.calculationId;
    
    // 不验证计算结果，直接尝试生成积分
    try {
      await creditsGenerator.generateCredits(calculationId, { from: creditsManager });
      assert.fail("Should not allow generating credits for unverified calculations");
    } catch (error) {
      assert(error.message.includes("calculation not verified"), "Expected 'calculation not verified' error");
    }
  });
  
  it("should allow credits manager to mark credits as issued", async () => {
    // 获取第一条车辆记录的creditId
    const creditId = await creditsGenerator.getVehicleCreditId(testVin, 0);
    
    // 标记为已发放
    await creditsGenerator.markAsIssued(creditId, { from: creditsManager });
    
    // 检查状态
    const creditRecord = await creditsGenerator.getCreditRecord(creditId);
    assert.equal(creditRecord.isIssued, true, "Credit record should be marked as issued");
  });
  
  it("should not allow non-credits manager to mark credits as issued", async () => {
    // 获取第一条车辆记录的creditId
    const creditId = await creditsGenerator.getVehicleCreditId(testVin, 0);
    
    try {
      await creditsGenerator.markAsIssued(creditId, { from: calculator });
      assert.fail("Non-credits manager should not be able to mark credits as issued");
    } catch (error) {
      assert(error.message.includes("caller is not credits manager"), "Expected 'caller is not credits manager' error");
    }
  });
});
