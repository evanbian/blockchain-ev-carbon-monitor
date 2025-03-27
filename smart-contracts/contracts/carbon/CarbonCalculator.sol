// smart-contracts/contracts/carbon/CarbonCalculator.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../access/AccessControl.sol";

/**
 * @title CarbonCalculator
 * @dev 碳减排计算合约，实现基于国标方法学的碳减排量计算
 */
contract CarbonCalculator {
    AccessControl private _accessControl;
    
    // 计算员角色
    bytes32 public constant CALCULATOR_ROLE = keccak256("CALCULATOR_ROLE");
    
    // 碳减排计算结果结构
    struct CarbonReduction {
        string vin;                // 车辆识别码
        uint256 date;              // 计算日期(时间戳)
        uint256 mileage;           // 行驶里程(m)
        uint256 energyConsumption; // 能耗(Wh)
        uint256 carbonReduction;   // 碳减排量(g)
        bytes32 calculationId;     // 计算ID
        bool isVerified;           // 是否已验证
    }
    
    // 电网碳排放因子(g CO2/kWh)，默认为854.7，使用10^6精度
    uint256 public gridEmissionFactor = 854700000; // 854.7 * 10^6
    
    // 传统燃油车排放因子(g CO2/km)，默认为196，使用10^6精度
    uint256 public traditionalVehicleEmissionFactor = 196000000; // 196 * 10^6
    
    // 计算精度
    uint256 private constant PRECISION = 1000000; // 10^6
    
    // 计算记录映射 calculationId => CarbonReduction
    mapping(bytes32 => CarbonReduction) public calculations;
    
    // 车辆计算记录映射 vin => calculationId[]
    mapping(string => bytes32[]) public vehicleCalculations;
    
    // 事件
    event EmissionFactorsUpdated(uint256 gridFactor, uint256 vehicleFactor);
    event CarbonReductionCalculated(
        bytes32 calculationId,
        string vin,
        uint256 date,
        uint256 mileage,
        uint256 energyConsumption,
        uint256 carbonReduction
    );
    event CalculationVerified(bytes32 calculationId);
    
    /**
     * @dev 构造函数
     * @param accessControl 访问控制合约地址
     */
    constructor(address accessControl) {
        _accessControl = AccessControl(accessControl);
    }
    
    /**
     * @dev 设置排放因子
     * @param _gridFactor 电网排放因子(g CO2/kWh * 10^6)
     * @param _vehicleFactor 传统车排放因子(g CO2/km * 10^6)
     */
    function setEmissionFactors(
        uint256 _gridFactor,
        uint256 _vehicleFactor
    ) public {
        require(
            _accessControl.hasRole(keccak256("ADMIN_ROLE"), msg.sender),
            "CarbonCalculator: caller is not admin"
        );
        
        gridEmissionFactor = _gridFactor;
        traditionalVehicleEmissionFactor = _vehicleFactor;
        
        emit EmissionFactorsUpdated(_gridFactor, _vehicleFactor);
    }
    
    /**
     * @dev 计算碳减排量
     * @param vin 车辆识别码
     * @param date 计算日期(时间戳)
     * @param mileage 行驶里程(m)
     * @param energyConsumption 能耗(Wh)
     * @return 计算ID
     */
    function calculateCarbonReduction(
        string memory vin,
        uint256 date,
        uint256 mileage,
        uint256 energyConsumption
    ) public returns (bytes32) {
        require(
            _accessControl.hasRole(keccak256("CALCULATOR_ROLE"), msg.sender),
            "CarbonCalculator: caller is not calculator"
        );
        require(bytes(vin).length > 0, "CarbonCalculator: vin cannot be empty");
        
        // 计算碳减排量
        // 1. 将米转换为千米
        uint256 mileageInKm = mileage / 1000;
        
        // 2. 将Wh转换为kWh
        uint256 energyInKwh = energyConsumption / 1000;
        
        // 3. 计算电动车产生的碳排放
        uint256 evEmission = energyInKwh * gridEmissionFactor / PRECISION;
        
        // 4. 计算传统车产生的碳排放
        uint256 traditionalEmission = mileageInKm * traditionalVehicleEmissionFactor / PRECISION;
        
        // 5. 计算碳减排量
        uint256 carbonReduction = 0;
        if (traditionalEmission > evEmission) {
            carbonReduction = traditionalEmission - evEmission;
        }
        
        // 生成计算ID
        bytes32 calculationId = keccak256(abi.encodePacked(vin, date, mileage, energyConsumption, block.timestamp));
        
        // 存储计算结果
        calculations[calculationId] = CarbonReduction({
            vin: vin,
            date: date,
            mileage: mileage,
            energyConsumption: energyConsumption,
            carbonReduction: carbonReduction,
            calculationId: calculationId,
            isVerified: false
        });
        
        // 添加到车辆计算记录
        vehicleCalculations[vin].push(calculationId);
        
        emit CarbonReductionCalculated(
            calculationId,
            vin,
            date,
            mileage,
            energyConsumption,
            carbonReduction
        );
        
        return calculationId;
    }
    
    /**
     * @dev 验证计算结果
     * @param calculationId 计算ID
     */
    function verifyCalculation(bytes32 calculationId) public {
        require(
            _accessControl.hasRole(keccak256("ADMIN_ROLE"), msg.sender),
            "CarbonCalculator: caller is not admin"
        );
        require(calculations[calculationId].calculationId == calculationId, "CarbonCalculator: calculation not found");
        require(!calculations[calculationId].isVerified, "CarbonCalculator: calculation already verified");
        
        calculations[calculationId].isVerified = true;
        
        emit CalculationVerified(calculationId);
    }
    
    /**
     * @dev 获取计算结果
     * @param calculationId 计算ID
     * @return CarbonReduction 计算结果
     */
    function getCalculation(bytes32 calculationId) public view returns (CarbonReduction memory) {
        require(calculations[calculationId].calculationId == calculationId, "CarbonCalculator: calculation not found");
        return calculations[calculationId];
    }
    
    /**
     * @dev 获取车辆计算记录数量
     * @param vin 车辆识别码
     * @return 计算记录数量
     */
    function getVehicleCalculationCount(string memory vin) public view returns (uint256) {
        return vehicleCalculations[vin].length;
    }
    
    /**
     * @dev 获取车辆计算记录ID
     * @param vin 车辆识别码
     * @param index 索引
     * @return 计算ID
     */
    function getVehicleCalculationId(string memory vin, uint256 index) public view returns (bytes32) {
        require(index < vehicleCalculations[vin].length, "CarbonCalculator: index out of bounds");
        return vehicleCalculations[vin][index];
    }
    
    /**
     * @dev 获取车辆最新计算ID
     * @param vin 车辆识别码
     * @return 最新计算ID
     */
    function getLatestCalculationId(string memory vin) public view returns (bytes32) {
        uint256 count = vehicleCalculations[vin].length;
        require(count > 0, "CarbonCalculator: no calculations for vehicle");
        return vehicleCalculations[vin][count - 1];
    }
}
