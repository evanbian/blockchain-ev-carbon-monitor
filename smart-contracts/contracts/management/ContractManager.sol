// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../access/AccessControl.sol";

/**
 * @title ContractManager
 * @dev 管理所有合约的升级和互操作
 */
contract ContractManager {
    AccessControl private _accessControl;
    
    // 合约地址映射 contractName => address
    mapping(bytes32 => address) public contractAddresses;
    
    // 合约版本映射 contractName => version
    mapping(bytes32 => uint256) public contractVersions;
    
    // 合约名称列表
    bytes32[] public contractNames;
    
    // 事件
    event ContractRegistered(bytes32 indexed contractName, address indexed contractAddress, uint256 version);
    event ContractUpgraded(bytes32 indexed contractName, address indexed oldAddress, address indexed newAddress, uint256 newVersion);
    
    /**
     * @dev 构造函数
     * @param accessControl 访问控制合约地址
     */
    constructor(address accessControl) {
        _accessControl = AccessControl(accessControl);
    }
    
    /**
     * @dev 注册合约
     * @param contractName 合约名称
     * @param contractAddress 合约地址
     * @param version 合约版本
     */
    function registerContract(
        bytes32 contractName,
        address contractAddress,
        uint256 version
    ) public {
        require(
            _accessControl.hasRole(keccak256("ADMIN_ROLE"), msg.sender),
            "ContractManager: caller is not admin"
        );
        
        require(
            contractName != bytes32(0),
            "ContractManager: contract name cannot be empty"
        );
        
        require(
            contractAddress != address(0),
            "ContractManager: contract address cannot be zero"
        );
        
        // 检查合约是否已注册
        if (contractAddresses[contractName] == address(0)) {
            // 新合约
            contractNames.push(contractName);
        }
        
        // 更新映射
        contractAddresses[contractName] = contractAddress;
        contractVersions[contractName] = version;
        
        emit ContractRegistered(contractName, contractAddress, version);
    }
    
    /**
     * @dev 升级合约
     * @param contractName 合约名称
     * @param newContractAddress 新合约地址
     * @param newVersion 新合约版本
     */
    function upgradeContract(
        bytes32 contractName,
        address newContractAddress,
        uint256 newVersion
    ) public {
        require(
            _accessControl.hasRole(keccak256("ADMIN_ROLE"), msg.sender),
            "ContractManager: caller is not admin"
        );
        
        require(
            contractAddresses[contractName] != address(0),
            "ContractManager: contract not registered"
        );
        
        require(
            newContractAddress != address(0),
            "ContractManager: new contract address cannot be zero"
        );
        
        require(
            newVersion > contractVersions[contractName],
            "ContractManager: new version must be greater than current version"
        );
        
        address oldAddress = contractAddresses[contractName];
        
        // 更新映射
        contractAddresses[contractName] = newContractAddress;
        contractVersions[contractName] = newVersion;
        
        emit ContractUpgraded(contractName, oldAddress, newContractAddress, newVersion);
    }
    
    /**
     * @dev 获取合约地址
     * @param contractName 合约名称
     * @return 合约地址
     */
    function getContractAddress(bytes32 contractName) public view returns (address) {
        require(
            contractAddresses[contractName] != address(0),
            "ContractManager: contract not registered"
        );
        
        return contractAddresses[contractName];
    }
    
    /**
     * @dev 获取合约版本
     * @param contractName 合约名称
     * @return 合约版本
     */
    function getContractVersion(bytes32 contractName) public view returns (uint256) {
        require(
            contractAddresses[contractName] != address(0),
            "ContractManager: contract not registered"
        );
        
        return contractVersions[contractName];
    }
    
    /**
     * @dev 获取合约数量
     * @return 合约数量
     */
    function getContractCount() public view returns (uint256) {
        return contractNames.length;
    }
    
    /**
     * @dev 检查合约是否已注册
     * @param contractName 合约名称
     * @return 是否已注册
     */
    function isContractRegistered(bytes32 contractName) public view returns (bool) {
        return contractAddresses[contractName] != address(0);
    }
}
