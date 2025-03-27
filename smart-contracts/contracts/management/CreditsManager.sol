// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../access/AccessControl.sol";
import "../carbon/CreditsGenerator.sol";
/**
 * @title CreditsManager
 * @dev 管理碳积分的发放、转移和使用
 */
contract CreditsManager {
    AccessControl private _accessControl;
    CreditsGenerator private _creditsGenerator;
    
    // 积分使用记录结构
    struct UsageRecord {
        address user;            // 使用者
        uint256 amount;          // 使用数量
        uint256 timestamp;       // 使用时间
        string purpose;          // 使用目的
        bytes32 usageId;         // 使用记录ID
    }
    
    // 车辆积分余额
    mapping(string => uint256) public vehicleCreditsBalance;
    
    // 账户积分余额
    mapping(address => uint256) public accountCreditsBalance;
    
    // 使用记录
    mapping(bytes32 => UsageRecord) public usageRecords;
    
    // 账户使用记录
    mapping(address => bytes32[]) public accountUsageRecords;
    
    // 总积分发行量
    uint256 public totalCreditsIssued;
    
    // 总积分使用量
    uint256 public totalCreditsUsed;
    
    // 事件
    event CreditsIssued(bytes32 creditId, string vin, uint256 amount);
    event CreditsTransferredFromVehicle(string vin, address to, uint256 amount);
    event CreditsTransferred(address from, address to, uint256 amount);
    event CreditsUsed(address user, uint256 amount, string purpose, bytes32 usageId);
    
    /**
     * @dev 构造函数
     * @param accessControl 访问控制合约地址
     * @param creditsGenerator 积分生成合约地址
     */
    constructor(address accessControl, address creditsGenerator) {
        _accessControl = AccessControl(accessControl);
        _creditsGenerator = CreditsGenerator(creditsGenerator);
    }
    
    /**
     * @dev 发放积分到车辆账户
     * @param creditId 积分ID
     */
    function issueCredits(bytes32 creditId) public {
        require(
            _accessControl.hasRole(keccak256("CREDITS_MANAGER_ROLE"), msg.sender),
            "CreditsManager: caller is not credits manager"
        );
        
        // 获取积分记录
        CreditsGenerator.CreditRecord memory record = _creditsGenerator.getCreditRecord(creditId);
        
        require(
            record.creditId == creditId,
            "CreditsManager: invalid credit id"
        );
        
        require(
            !record.isIssued,
            "CreditsManager: credits already issued"
        );
        
        // 更新车辆积分余额
        vehicleCreditsBalance[record.vin] += record.amount;
        
        // 更新总发行量
        totalCreditsIssued += record.amount;
        
        // 标记为已发放
        _creditsGenerator.markAsIssued(creditId);
        
        emit CreditsIssued(creditId, record.vin, record.amount);
    }
    
    /**
     * @dev 从车辆转移积分到账户
     * @param vin 车辆识别码
     * @param to 接收账户
     * @param amount 积分数量
     */
    function transferFromVehicle(string memory vin, address to, uint256 amount) public {
        require(
            _accessControl.hasRole(keccak256("CREDITS_MANAGER_ROLE"), msg.sender),
            "CreditsManager: caller is not credits manager"
        );
        
        require(
            vehicleCreditsBalance[vin] >= amount,
            "CreditsManager: insufficient vehicle credits"
        );
        
        require(
            to != address(0),
            "CreditsManager: transfer to the zero address"
        );
        
        // 更新余额
        vehicleCreditsBalance[vin] -= amount;
        accountCreditsBalance[to] += amount;
        
        emit CreditsTransferredFromVehicle(vin, to, amount);
    }
    
    /**
     * @dev 从账户转移积分到另一账户
     * @param to 接收账户
     * @param amount 积分数量
     */
    function transfer(address to, uint256 amount) public {
        require(
            accountCreditsBalance[msg.sender] >= amount,
            "CreditsManager: insufficient account credits"
        );
        
        require(
            to != address(0),
            "CreditsManager: transfer to the zero address"
        );
        
        require(
            to != msg.sender,
            "CreditsManager: transfer to self"
        );
        
        // 更新余额
        accountCreditsBalance[msg.sender] -= amount;
        accountCreditsBalance[to] += amount;
        
        emit CreditsTransferred(msg.sender, to, amount);
    }
    
    /**
     * @dev 使用积分
     * @param amount 积分数量
     * @param purpose 使用目的
     * @return usageId 使用记录ID
     */
    function useCredits(uint256 amount, string memory purpose) public returns (bytes32) {
        require(
            accountCreditsBalance[msg.sender] >= amount,
            "CreditsManager: insufficient account credits"
        );
        
        require(
            bytes(purpose).length > 0,
            "CreditsManager: purpose cannot be empty"
        );
        
        // 更新余额
        accountCreditsBalance[msg.sender] -= amount;
        
        // 更新总使用量
        totalCreditsUsed += amount;
        
        // 生成使用记录ID
        bytes32 usageId = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            block.timestamp,
            purpose
        ));
        
        // 存储使用记录
        usageRecords[usageId] = UsageRecord({
            user: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            purpose: purpose,
            usageId: usageId
        });
        
        // 添加到账户使用记录
        accountUsageRecords[msg.sender].push(usageId);
        
        emit CreditsUsed(msg.sender, amount, purpose, usageId);
        
        return usageId;
    }
    
    /**
     * @dev 获取车辆积分余额
     * @param vin 车辆识别码
     * @return 积分余额
     */
    function getVehicleBalance(string memory vin) public view returns (uint256) {
        return vehicleCreditsBalance[vin];
    }
    
    /**
     * @dev 获取账户积分余额
     * @param account 账户地址
     * @return 积分余额
     */
    function getAccountBalance(address account) public view returns (uint256) {
        return accountCreditsBalance[account];
    }
    
    /**
     * @dev 获取账户使用记录数量
     * @param account 账户地址
     * @return 使用记录数量
     */
    function getAccountUsageCount(address account) public view returns (uint256) {
        return accountUsageRecords[account].length;
    }
    
    /**
     * @dev 获取账户使用记录ID
     * @param account 账户地址
     * @param index 索引
     * @return 使用记录ID
     */
    function getAccountUsageId(address account, uint256 index) public view returns (bytes32) {
        require(
            index < accountUsageRecords[account].length,
            "CreditsManager: index out of bounds"
        );
        
        return accountUsageRecords[account][index];
    }
    
    /**
     * @dev 获取使用记录
     * @param usageId 使用记录ID
     * @return UsageRecord 使用记录
     */
    function getUsageRecord(bytes32 usageId) public view returns (UsageRecord memory) {
        require(
            usageRecords[usageId].usageId == usageId,
            "CreditsManager: usage record not found"
        );
        
        return usageRecords[usageId];
    }
}
