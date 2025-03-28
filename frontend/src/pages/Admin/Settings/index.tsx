// src/pages/Admin/Settings/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  InputNumber, 
  Divider, 
  message, 
  Table,
  Switch,
  Space,
  Popconfirm
} from 'antd';
import { 
  SaveOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

// 模拟的系统参数数据
const initialParams = [
  {
    key: 'grid_emission_factor',
    name: '电网排放因子',
    value: '0.8547',
    unit: 'kg CO2/kWh',
    description: '中国区域电网平均碳排放因子'
  },
  {
    key: 'traditional_vehicle_emission',
    name: '传统车排放因子',
    value: '0.196',
    unit: 'kg CO2/km',
    description: '传统燃油车平均碳排放因子'
  },
  {
    key: 'credits_conversion_rate',
    name: '碳积分转换系数',
    value: '0.05',
    unit: '积分/kg CO2',
    description: '每减排1kg CO2可获得的碳积分数量'
  },
  {
    key: 'data_collection_interval',
    name: '数据采集间隔',
    value: '5',
    unit: '分钟',
    description: '车辆数据采集的时间间隔'
  }
];

// 模拟的用户数据
const initialUsers = [
  {
    id: 1,
    username: 'admin',
    role: 'administrator',
    email: 'admin@example.com',
    status: true,
    lastLogin: '2023-07-01 14:32:15'
  },
  {
    id: 2,
    username: 'operator',
    role: 'operator',
    email: 'operator@example.com',
    status: true,
    lastLogin: '2023-06-28 09:42:30'
  },
  {
    id: 3,
    username: 'viewer',
    role: 'viewer',
    email: 'viewer@example.com',
    status: false,
    lastLogin: '2023-06-15 11:21:09'
  }
];

const SettingsPage: React.FC = () => {
  const [paramForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // 提交参数设置
  const handleParamSubmit = (values: any) => {
    setLoading(true);
    
    // 实际项目中应调用API
    // 模拟API调用
    setTimeout(() => {
      const newParams = [...params];
      
      // 更新参数值
      Object.keys(values).forEach(key => {
        const index = newParams.findIndex(param => param.key === key);
        if (index !== -1) {
          newParams[index].value = values[key];
        }
      });
      
      setParams(newParams);
      setLoading(false);
      message.success('参数保存成功');
    }, 800);
  };
  
  // 初始化参数表单
  useEffect(() => {
    const initialValues: any = {};
    params.forEach(param => {
      initialValues[param.key] = param.value;
    });
    paramForm.setFieldsValue(initialValues);
  }, [params, paramForm]);
  
  // 添加/编辑用户
  const handleUserSubmit = (values: any) => {
    if (editingUser) {
      // 编辑现有用户
      const newUsers = users.map(user => 
        user.id === editingUser.id ? { ...user, ...values } : user
      );
      setUsers(newUsers);
      message.success('用户更新成功');
    } else {
      // 添加新用户
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        ...values,
        status: true,
        lastLogin: '-'
      };
      setUsers([...users, newUser]);
      message.success('用户添加成功');
    }
    
    userForm.resetFields();
    setEditingUser(null);
  };
  
  // 编辑用户
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    userForm.setFieldsValue({
      username: user.username,
      role: user.role,
      email: user.email,
      password: '' // 密码字段不回填
    });
  };
  
  // 删除用户
  const handleDeleteUser = (userId: number) => {
    const newUsers = users.filter(user => user.id !== userId);
    setUsers(newUsers);
    message.success('用户删除成功');
  };
  
  // 切换用户状态
  const handleToggleUserStatus = (userId: number, status: boolean) => {
    const newUsers = users.map(user => 
      user.id === userId ? { ...user, status } : user
    );
    setUsers(newUsers);
    message.success(`用户${status ? '激活' : '禁用'}成功`);
  };
  
  // 渲染参数设置界面
  const renderParamSettings = () => (
    <Card title="系统参数设置">
      <Form
        form={paramForm}
        layout="vertical"
        onFinish={handleParamSubmit}
      >
        {params.map(param => (
          <Form.Item
            key={param.key}
            name={param.key}
            label={
              <span>
                {param.name} 
                <span style={{ fontSize: '12px', color: '#888', marginLeft: '8px' }}>
                  ({param.unit})
                </span>
              </span>
            }
            tooltip={param.description}
            rules={[{ required: true, message: `请输入${param.name}` }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              step="0.0001"
              stringMode
            />
          </Form.Item>
        ))}
        
        <Divider />
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SaveOutlined />}
          >
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
  
  // 用户表格列定义
  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const labels: Record<string, string> = {
          administrator: '管理员',
          operator: '操作员',
          viewer: '查看者'
        };
        return labels[role] || role;
      }
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean, record: any) => (
        <Switch 
          checked={status} 
          onChange={(checked) => handleToggleUserStatus(record.id, checked)}
        />
      )
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: any) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
          />
          <Popconfirm
            title="确定要删除此用户吗?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={record.username === 'admin'} // 禁止删除admin用户
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  // 渲染用户管理界面
  const renderUserSettings = () => (
    <div>
      <Card title={editingUser ? '编辑用户' : '添加用户'} style={{ marginBottom: 24 }}>
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { 
                required: !editingUser, 
                message: '请输入密码' 
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                message: '密码必须包含大小写字母和数字，且长度不少于8位',
                warningOnly: editingUser // 编辑模式下仅警告
              }
            ]}
          >
            <Input.Password placeholder={editingUser ? "留空表示不修改密码" : "请输入密码"} />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Input.Group compact>
              <Button 
                type={userForm.getFieldValue('role') === 'administrator' ? 'primary' : 'default'}
                onClick={() => userForm.setFieldsValue({ role: 'administrator' })}
                style={{ width: '33%' }}
              >
                管理员
              </Button>
              <Button 
                type={userForm.getFieldValue('role') === 'operator' ? 'primary' : 'default'}
                onClick={() => userForm.setFieldsValue({ role: 'operator' })}
                style={{ width: '33%' }}
              >
                操作员
              </Button>
              <Button 
                type={userForm.getFieldValue('role') === 'viewer' ? 'primary' : 'default'}
                onClick={() => userForm.setFieldsValue({ role: 'viewer' })}
                style={{ width: '34%' }}
              >
                查看者
              </Button>
            </Input.Group>
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={editingUser ? <SaveOutlined /> : <PlusOutlined />}
              >
                {editingUser ? '保存修改' : '添加用户'}
              </Button>
              {editingUser && (
                <Button onClick={() => {
                  userForm.resetFields();
                  setEditingUser(null);
                }}>
                  取消
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      <Card title="用户列表">
        <Table 
          columns={userColumns} 
          dataSource={users} 
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
  
  return (
    <div className="settings-page">
      <Tabs defaultActiveKey="params">
        <TabPane tab="系统参数" key="params">
          {renderParamSettings()}
        </TabPane>
        <TabPane tab="用户管理" key="users">
          {renderUserSettings()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
