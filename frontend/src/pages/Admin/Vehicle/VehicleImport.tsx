// src/pages/Admin/Vehicle/VehicleImport.tsx
import React, { useState } from 'react';
import { 
  Modal, 
  Upload, 
  Button, 
  message, 
  Alert, 
  Steps, 
  Typography, 
  Table, 
  Space,
  Descriptions,
  Card
} from 'antd';
import { 
  UploadOutlined, 
  FileExcelOutlined, 
  CheckCircleOutlined, 
  InboxOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import vehicleAPI from '@/services/vehicles';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;

interface VehicleImportProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const VehicleImport: React.FC<VehicleImportProps> = ({ open, onCancel, onSuccess }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  
  const steps = [
    {
      title: '准备数据',
      content: '下载模板并填充数据',
    },
    {
      title: '上传文件',
      content: '上传CSV文件',
    },
    {
      title: '导入结果',
      content: '查看导入结果',
    },
  ];
  
  const handleImport = async () => {
    if (fileList.length === 0) {
      message.error('请选择要上传的文件');
      return;
    }
    
    const file = fileList[0].originFileObj;
    
    try {
      setUploading(true);
      
      // 实际项目中调用API
      // const result = await vehicleAPI.importVehicles(file);
      
      // 模拟导入结果
      const mockResult = {
        total: 10,
        success: 8,
        failed: 2,
        failures: [
          { 
            line: 3, 
            vin: "INVALID_VIN",
            reason: "VIN码格式不正确" 
          },
          { 
            line: 7, 
            vin: "LSVAU2180N2123456",
            reason: "车辆已存在" 
          }
        ],
        newVehicles: [
          {
            vin: "LSVAU2180N2183295",
            model: "比亚迪汉EV",
            licensePlate: "京A12346"
          },
          {
            vin: "LSVAU2180N2183296",
            model: "比亚迪汉EV",
            licensePlate: "京A12347"
          }
        ]
      };
      
      // 模拟API延迟
      setTimeout(() => {
        setImportResult(mockResult);
        setCurrentStep(2);
        setUploading(false);
      }, 1500);
      
    } catch (error) {
      message.error('导入失败');
      setUploading(false);
    }
  };
  
  const uploadProps: UploadProps = {
    onRemove: (file) => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // 检查文件类型，只允许.csv文件
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
      
      if (!isCSV) {
        message.error('只能上传CSV文件!');
        return Upload.LIST_IGNORE;
      }
      
      // 限制文件大小为10MB
      const isLessThan10M = file.size / 1024 / 1024 < 10;
      if (!isLessThan10M) {
        message.error('文件必须小于10MB!');
        return Upload.LIST_IGNORE;
      }
      
      // 添加到fileList但不自动上传
      setFileList([file]);
      return false;
    },
    fileList,
    maxCount: 1,
    multiple: false
  };
  
  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Card>
              <div style={{ marginBottom: 20 }}>
                <FileExcelOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 20 }} />
                <Title level={4}>第一步：准备数据</Title>
                <Paragraph>
                  请下载车辆信息导入模板，按照模板格式填写车辆信息，然后进行导入。
                </Paragraph>
              </div>
              
              <Alert
                message="模板格式说明"
                description={
                  <ul style={{ textAlign: 'left', paddingLeft: 20 }}>
                    <li>VIN码：17位车辆识别码，必填</li>
                    <li>车牌号：车辆牌照号码，必填</li>
                    <li>车型：车辆型号，必填</li>
                    <li>制造商：车辆制造商，必填</li>
                    <li>生产年份：车辆生产年份，必填</li>
                    <li>电池容量：电池容量(kWh)，必填</li>
                    <li>最大续航里程：最大续航里程(km)，必填</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ marginBottom: 20, textAlign: 'left' }}
              />
              
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                // 实际项目中应该提供真实的模板下载链接
                // href="/templates/vehicle_import_template.csv"
                // download="vehicle_import_template.csv"
              >
                下载导入模板
              </Button>
            </Card>
          </div>
        );
      
      case 1:
        return (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Upload.Dragger {...uploadProps} style={{ padding: '30px 0' }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持单个.csv文件上传，文件大小不超过10MB
              </p>
            </Upload.Dragger>
            
            {fileList.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <Button 
                  type="primary" 
                  onClick={handleImport} 
                  loading={uploading}
                  style={{ marginRight: 8 }}
                >
                  开始导入
                </Button>
                <Button onClick={() => setFileList([])}>清除</Button>
              </div>
            )}
          </div>
        );
      
      case 2:
        if (!importResult) {
          return <div>加载中...</div>;
        }
        
        return (
          <div style={{ padding: '20px 0' }}>
            <Descriptions title="导入结果概况" bordered>
              <Descriptions.Item label="总记录数">{importResult.total}</Descriptions.Item>
              <Descriptions.Item label="成功导入">
                <Text type="success">{importResult.success}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="导入失败">
                <Text type="danger">{importResult.failed}</Text>
              </Descriptions.Item>
            </Descriptions>
            
            {importResult.failed > 0 && (
              <div style={{ marginTop: 20 }}>
                <Title level={5}>导入失败记录</Title>
                <Table
                  dataSource={importResult.failures}
                  columns={[
                    { title: '行号', dataIndex: 'line', key: 'line' },
                    { title: 'VIN码', dataIndex: 'vin', key: 'vin' },
                    { title: '失败原因', dataIndex: 'reason', key: 'reason' }
                  ]}
                  pagination={false}
                  size="small"
                  rowKey="line"
                />
              </div>
            )}
            
            {importResult.success > 0 && (
              <div style={{ marginTop: 20 }}>
                <Alert
                  message="导入成功"
                  description={`成功导入 ${importResult.success} 辆车辆`}
                  type="success"
                  showIcon
                />
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Modal
      title="批量导入车辆"
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          关闭
        </Button>,
        currentStep > 0 && currentStep < steps.length - 1 && (
          <Button key="back" onClick={() => setCurrentStep(currentStep - 1)}>
            上一步
          </Button>
        ),
        currentStep < steps.length - 1 && (
          <Button
            key="next"
            type="primary"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={currentStep === 1 && fileList.length === 0}
          >
            下一步
          </Button>
        ),
        currentStep === steps.length - 1 && (
          <Button 
            key="done" 
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              onSuccess();
              onCancel();
            }}
          >
            完成
          </Button>
        )
      ]}
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      
      <div className="steps-content">{renderStepContent()}</div>
    </Modal>
  );
};

export default VehicleImport;
