// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AccessControl
 * @dev 实现基于角色的访问控制
 */
contract AccessControl {
    // 角色 => 账户 => 是否拥有角色
    mapping(bytes32 => mapping(address => bool)) private _roles;
    
    // 管理员角色
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // 车辆管理角色
    bytes32 public constant VEHICLE_MANAGER_ROLE = keccak256("VEHICLE_MANAGER_ROLE");
    
    // 事件
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    
    /**
     * @dev 构造函数，将部署者设为管理员
     */
    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev 检查账户是否拥有指定角色
     */
    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }
    
    /**
     * @dev 授予角色，只有管理员可以调用
     */
    function grantRole(bytes32 role, address account) public {
        require(hasRole(ADMIN_ROLE, msg.sender), "AccessControl: caller is not admin");
        _grantRole(role, account);
    }
    
    /**
     * @dev 撤销角色，只有管理员可以调用
     */
    function revokeRole(bytes32 role, address account) public {
        require(hasRole(ADMIN_ROLE, msg.sender), "AccessControl: caller is not admin");
        _revokeRole(role, account);
    }
    
    /**
     * @dev 内部函数：授予角色
     */
    function _grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            _roles[role][account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }
    
    /**
     * @dev 内部函数：撤销角色
     */
    function _revokeRole(bytes32 role, address account) internal {
        if (hasRole(role, account)) {
            _roles[role][account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }
    
    /**
     * @dev 检查是否拥有角色的修饰器
     */
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "AccessControl: caller does not have role");
        _;
    }
}
