// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../access/AccessControl.sol";
import "../carbon/CarbonCalculator.sol";

/**
 * @title CreditsGenerator
 * @dev 根据碳减排量生成碳积分
 */
contract CreditsGenerator {
    AccessControl private _accessControl;
    CarbonCalculator private _carbonCalculator;
    
    // 碳积分管理员角色
    bytes32 public constant CREDITS_MANAGER_ROLE = keccak256("CREDITS_MANAGER_ROLE");
    
    // 授权的积分管理合约
    address public creditsManagerContract;
    
    // 积分记录结构
    struct CreditRecord {
        bytes32 calculationId;    // 关联的碳减排计算ID
        string vin;               // 车辆识别码
        uint256 amount;           // 积分数量(wei)
        uint256 timestamp;        // 生成时间戳
        bool isIssued;            // 是否已发放
        bytes32 creditId;         // 积分ID
    }
    
    // 转换系数(g CO2 -> 积分)，默认为0.05，使用10^6精度
    uint256 public conversionRate = 50000; // 0.05 * 10^6
    
    // 精度
    uint256 private constant PRECISION = 1000000; // 10^6
    
    // 积分记录映射 creditId => CreditRecord
    mapping(bytes32 => CreditRecord) public creditRecords;
    
    // 车辆积分记录映射 vin => creditId[]
    mapping(string => bytes32[]) public vehicleCreditRecords;
    
    // 计算ID对应的积分ID映射 calculationId => creditId
    mapping(bytes32 => bytes32) public calculationToCredit;
    
    // 事件
    event ConversionRateUpdated(uint256 newRate);
    event CreditsGenerated(
        bytes32 creditId,
        bytes32 calculationId,
        string vin,
        uint256 amount,
        uint256 timestamp
    );
    event CreditsManagerContractSet(address managerContract);
    
    /**
     * @dev 构造函数
     * @param accessControl 访问控制合约地址
     * @param carbonCalculator 碳减排计算合约地址
     */
    constructor(address accessControl, address carbonCalculator) {
        _accessControl = AccessControl(accessControl);
        _carbonCalculator = CarbonCalculator(carbonCalculator);
    }
    
    /**
     * @dev 设置积分管理合约地址
     * @param managerContract 积分管理合约地址
     */
    function setCreditsManagerContract(address managerContract) public {
        require(
            _accessControl.hasRole(keccak256("ADMIN_ROLE"), msg.sender),
            "CreditsGenerator: caller is not admin"
        );
        
        creditsManagerContract = managerContract;
        
        emit CreditsManagerContractSet(managerContract);
    }
    
    /**
     * @dev 设置转换系数
     * @param _rate 新的转换系数 (g CO2 -> 积分) * 10^6
     */
    function setConversionRate(uint256 _rate) public {
        require(
            _accessControl.hasRole(keccak256("ADMIN_ROLE"), msg.sender),
            "CreditsGenerator: caller is not admin"
        );
        
        conversionRate = _rate;
        
        emit ConversionRateUpdated(_rate);
    }
    
    /**
     * @dev 基于碳减排计算生成积分
     * @param calculationId 碳减排计算ID
     * @return creditId 生成的积分ID
     */
    function generateCredits(bytes32 calculationId) public returns (bytes32) {
        require(
            _accessControl.hasRole(keccak256("CREDITS_MANAGER_ROLE"), msg.sender),
            "CreditsGenerator: caller is not credits manager"
        );
        
        // 检查该计算是否已经生成过积分
        require(
            calculationToCredit[calculationId] == bytes32(0),
            "CreditsGenerator: credits already generated for this calculation"
        );
        
        // 获取计算结果
        CarbonCalculator.CarbonReduction memory reduction = _carbonCalculator.getCalculation(calculationId);
        
        // 验证计算结果
        require(
            reduction.calculationId == calculationId,
            "CreditsGenerator: invalid calculation id"
        );
        
        require(
            reduction.isVerified,
            "CreditsGenerator: calculation not verified"
        );
        
        // 计算积分数量
        uint256 creditAmount = reduction.carbonReduction * conversionRate / PRECISION;
        
        // 生成积分ID
        bytes32 creditId = keccak256(abi.encodePacked(
            calculationId,
            block.timestamp,
            msg.sender
        ));
        
        // 存储积分记录
        creditRecords[creditId] = CreditRecord({
            calculationId: calculationId,
            vin: reduction.vin,
            amount: creditAmount,
            timestamp: block.timestamp,
            isIssued: false,
            creditId: creditId
        });
        
        // 更新映射
        vehicleCreditRecords[reduction.vin].push(creditId);
        calculationToCredit[calculationId] = creditId;
        
        emit CreditsGenerated(
            creditId,
            calculationId,
            reduction.vin,
            creditAmount,
            block.timestamp
        );
        
        return creditId;
    }
    
    /**
     * @dev 标记积分已发放
     * @param creditId 积分ID
     */
    function markAsIssued(bytes32 creditId) public {
        // 允许积分管理员或者积分管理合约调用
        require(
            _accessControl.hasRole(keccak256("CREDITS_MANAGER_ROLE"), msg.sender) || 
            msg.sender == creditsManagerContract,
            "CreditsGenerator: caller is not credits manager"
        );
        
        require(
            creditRecords[creditId].creditId == creditId,
            "CreditsGenerator: credit record not found"
        );
        
        require(
            !creditRecords[creditId].isIssued,
            "CreditsGenerator: credits already issued"
        );
        
        creditRecords[creditId].isIssued = true;
    }
    
    /**
     * @dev 获取车辆积分记录数量
     * @param vin 车辆识别码
     * @return 积分记录数量
     */
    function getVehicleCreditRecordCount(string memory vin) public view returns (uint256) {
        return vehicleCreditRecords[vin].length;
    }
    
    /**
     * @dev 获取车辆积分记录ID
     * @param vin 车辆识别码
     * @param index 索引
     * @return 积分ID
     */
    function getVehicleCreditId(string memory vin, uint256 index) public view returns (bytes32) {
        require(
            index < vehicleCreditRecords[vin].length,
            "CreditsGenerator: index out of bounds"
        );
        
        return vehicleCreditRecords[vin][index];
    }
    
    /**
     * @dev 获取积分记录
     * @param creditId 积分ID
     * @return CreditRecord 积分记录
     */
    function getCreditRecord(bytes32 creditId) public view returns (CreditRecord memory) {
        require(
            creditRecords[creditId].creditId == creditId,
            "CreditsGenerator: credit record not found"
        );
        
        return creditRecords[creditId];
    }
    
    /**
     * @dev 获取计算ID对应的积分ID
     * @param calculationId 计算ID
     * @return 积分ID
     */
    function getCreditIdForCalculation(bytes32 calculationId) public view returns (bytes32) {
        return calculationToCredit[calculationId];
    }
}
