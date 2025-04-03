// src/App.tsx
import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import AppRouter from './router';
import './App.css';

// 设置中文环境
dayjs.locale('zh-cn');

// 日期选择器问题已修复
// 默认使用dayjs，并确保年份选择功能正常

const App: React.FC = () => {
  return (
    <ConfigProvider 
      locale={zhCN}
      theme={{
        components: {
          DatePicker: {
            // 增加日期选择器样式调整
            controlItemBgActiveHover: '#1890ff',
            cellActiveWithRangeBg: 'rgba(24, 144, 255, 0.1)'
          }
        }
      }}
      form={{ 
        validateMessages: {
          required: '${label}不能为空',
        } 
      }}
      // 添加 DatePicker 的全局默认配置
      componentSize="middle"
      input={{ autoComplete: 'off' }}
      getPopupContainer={(triggerNode) => {
        return triggerNode?.parentElement || document.body;
      }}
    >
      <AppRouter />
    </ConfigProvider>
  );
};

export default App;
