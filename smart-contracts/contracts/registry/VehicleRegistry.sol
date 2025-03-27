// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../access/AccessControl.sol";

/**
 * @title VehicleRegistry
 * @dev 车辆信息注册和管理
 */
contract VehicleRegistry {
    AccessControl private _accessControl;
    
    // 车辆结构
    struct Vehicle {
        string vin;               // 车辆识别码
        string model;             // 车型
        uint256 batteryCapacity;  // 电池容量(Wh)
        uint256 registerTime;     // 注册时间戳
        bool isActive;            // 是否激活
    }
    
    // 所有注册车辆
    mapping(string => Vehicle) public vehicles;
    
    // 车辆VIN码列表
    string[] public vehicleVINs;
    
    // 事件
    event VehicleRegistered(string vin, string model, uint256 batteryCapacity, uint256 registerTime);
    event VehicleStatusUpdated(string vin, bool isActive);
    
    /**
     * @dev 构造函数
     * @param accessControl 访问控制合约地址
     */
    constructor(address accessControl) {
        _accessControl = AccessControl(accessControl);
    }
    
    /**
     * @dev 注册新车辆
     * @param vin 车辆识别码
     * @param model 车型
     * @param batteryCapacity 电池容量(Wh)
     */
    function registerVehicle(
        string memory vin,
        string memory model,
        uint256 batteryCapacity
    ) public {
        require(
            _accessControl.hasRole(keccak256("VEHICLE_MANAGER_ROLE"), msg.sender),
            "VehicleRegistry: caller is not vehicle manager"
        );
        require(bytes(vin).length > 0, "VehicleRegistry: vin cannot be empty");
        require(bytes(vehicles[vin].vin).length == 0, "VehicleRegistry: vehicle already registered");
        
        vehicles[vin] = Vehicle({
            vin: vin,
            model: model,
            batteryCapacity: batteryCapacity,
            registerTime: block.timestamp,
            isActive: true
        });
        
        vehicleVINs.push(vin);
        
        emit VehicleRegistered(vin, model, batteryCapacity, block.timestamp);
    }
    
    /**
     * @dev 更新车辆状态
     * @param vin 车辆识别码
     * @param isActive 是否激活
     */
    function updateVehicleStatus(string memory vin, bool isActive) public {
        require(
            _accessControl.hasRole(keccak256("VEHICLE_MANAGER_ROLE"), msg.sender),
            "VehicleRegistry: caller is not vehicle manager"
        );
        require(bytes(vehicles[vin].vin).length > 0, "VehicleRegistry: vehicle not registered");
        
        vehicles[vin].isActive = isActive;
        
        emit VehicleStatusUpdated(vin, isActive);
    }
    
    /**
     * @dev 获取车辆数量
     */
    function getVehicleCount() public view returns (uint256) {
        return vehicleVINs.length;
    }
    
    /**
     * @dev 检查车辆是否已注册
     * @param vin 车辆识别码
     */
    function isVehicleRegistered(string memory vin) public view returns (bool) {
        return bytes(vehicles[vin].vin).length > 0;
    }
}
