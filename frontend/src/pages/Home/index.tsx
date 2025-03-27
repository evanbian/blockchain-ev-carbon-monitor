// src/pages/Home/index.tsx
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h2>欢迎使用新能源车辆碳减排计量系统</h2>
      <p>请选择左侧菜单进入相应平台</p>
      <div style={{ marginTop: '40px' }}>
        <p>本系统旨在建立一个完整的新能源车辆碳减排监测和积分管理平台。系统主要功能包括：</p>
        <ul style={{ display: 'inline-block', textAlign: 'left' }}>
          <li>车辆行驶数据采集与上链</li>
          <li>基于国标方法学的碳减排计算</li>
          <li>碳积分生成与管理</li>
          <li>数据分析与可视化展示</li>
          <li>区块链浏览和数据透明化</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
