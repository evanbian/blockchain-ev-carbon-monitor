// tools/data-generator/ui/app.js
document.addEventListener('DOMContentLoaded', function() {
    // Socket.io 连接
    const socket = io();
    
    // 全局状态
    let isGenerating = false;
    let generationMode = 'batch';
    
    // DOM 元素
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const logContainer = document.getElementById('logContainer');
    const vehicleCountValue = document.getElementById('vehicleCountValue');
    const streamIntervalValue = document.getElementById('streamIntervalValue');
    const streamVehicleCountValue = document.getElementById('streamVehicleCountValue');
    const anomalyRateValue = document.getElementById('anomalyRateValue');
    const vehicleCountDisplay = document.getElementById('vehicleCount');
    const drivingCountDisplay = document.getElementById('drivingCount');
    const carbonCountDisplay = document.getElementById('carbonCount');
    const blockchainCountDisplay = document.getElementById('blockchainCount');
    
    // 表单元素
    const batchGenerationForm = document.getElementById('batchGenerationForm');
    const streamGenerationForm = document.getElementById('streamGenerationForm');
    const startStreamBtn = document.getElementById('startStreamBtn');
    const stopStreamBtn = document.getElementById('stopStreamBtn');
    const resetDataBtn = document.getElementById('resetDataBtn');
    const submitApiBtn = document.getElementById('submitApiBtn');
    const importDbBtn = document.getElementById('importDbBtn');
    const vehicleCountRange = document.getElementById('vehicleCountRange');
    const streamIntervalRange = document.getElementById('streamIntervalRange');
    const streamVehicleCountRange = document.getElementById('streamVehicleCountRange');
    const anomalyRateRange = document.getElementById('anomalyRateRange');
    const refreshFilesBtn = document.getElementById('refreshFilesBtn');
    const refreshVehiclesBtn = document.getElementById('refreshVehiclesBtn');
    const refreshCarbonBtn = document.getElementById('refreshCarbonBtn');
    const jsonFilesDropdown = document.getElementById('jsonFilesDropdown');
    const jsonViewer = document.getElementById('jsonViewer');
    
    // 配置表单元素
    const basicSettingsForm = document.getElementById('basicSettingsForm');
    const carbonSettingsForm = document.getElementById('carbonSettingsForm');
    const apiSettingsForm = document.getElementById('apiSettingsForm');
    const dbSettingsForm = document.getElementById('dbSettingsForm');
    const blockchainSettingsForm = document.getElementById('blockchainSettingsForm');
    const testApiBtn = document.getElementById('testApiBtn');
    const testDbBtn = document.getElementById('testDbBtn');
    const testBlockchainBtn = document.getElementById('testBlockchainBtn');
    
    // 初始化滑块值显示
    vehicleCountRange.addEventListener('input', function() {
      vehicleCountValue.textContent = this.value;
    });
    
    streamIntervalRange.addEventListener('input', function() {
      streamIntervalValue.textContent = `${this.value}秒`;
    });
    
    streamVehicleCountRange.addEventListener('input', function() {
      streamVehicleCountValue.textContent = this.value;
    });
    
    anomalyRateRange.addEventListener('input', function() {
      anomalyRateValue.textContent = `${this.value}%`;
    });
    
    // Socket事件监听
    socket.on('connect', function() {
      addLog('系统', '已连接到服务器', 'info');
      refreshStatus();
    });
    
    socket.on('disconnect', function() {
      addLog('系统', '与服务器断开连接', 'error');
      updateStatus(false);
    });
    
    socket.on('status', function(data) {
      updateStatus(data.isGenerating);
      updateStats(data.stats);
    });
    
    socket.on('generation-started', function(stats) {
      addLog('系统', '开始生成数据', 'info');
      updateStatus(true);
      updateStats(stats);
      updateProgress(0);
    });
    
    socket.on('generation-completed', function(stats) {
      addLog('系统', '数据生成完成', 'info');
      updateStatus(false);
      updateStats(stats);
      updateProgress(100);
      refreshFiles();
    });
    
    socket.on('stream-generation-started', function(data) {
      addLog('系统', `开始流式生成数据，间隔：${data.interval}ms`, 'info');
      updateStatus(true);
      generationMode = 'stream';
      toggleStreamButtons(true);
      updateStats(data.stats);
    });
    
    socket.on('generation-stopped', function(stats) {
      addLog('系统', '生成过程已停止', 'warn');
      updateStatus(false);
      toggleStreamButtons(false);
      updateStats(stats);
    });
    
    socket.on('data-generated', function(data) {
      addLog('系统', `生成了新批次数据：${formatBatchInfo(data.batchSize)}`, 'info');
      updateStats(data.stats);
      updateProgress(calculateProgress(data.stats));
    });
    
    socket.on('data-reset', function() {
      addLog('系统', '数据已重置', 'info');
      resetDisplays();
      refreshFiles();
    });
    
    socket.on('error', function(message) {
      addLog('错误', message, 'error');
      showAlert('错误', message);
    });
    
    // 表单提交事件
    batchGenerationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (isGenerating) {
        showAlert('警告', '已有生成过程正在进行，请先停止当前过程');
        return;
      }
      
      // 收集表单数据
      const params = {
        mode: 'batch',
        vehicleCount: parseInt(vehicleCountRange.value),
        timeRange: {
          start: document.getElementById('timeRangeStart').value,
          end: document.getElementById('timeRangeEnd').value
        },
        generate: {
          vehicles: document.getElementById('generateVehicles').checked,
          driving: document.getElementById('generateDriving').checked,
          carbon: document.getElementById('generateCarbon').checked,
          blockchain: document.getElementById('generateBlockchain').checked
        },
        seed: document.getElementById('randomSeed').value
      };
      
      // 发送生成请求
      socket.emit('start-generation', params);
      addLog('用户', '请求批量生成数据', 'info');
      generationMode = 'batch';
    });
    
    streamGenerationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (isGenerating) {
        showAlert('警告', '已有生成过程正在进行，请先停止当前过程');
        return;
      }
      
      // 收集表单数据
      const params = {
        mode: 'stream',
        interval: parseInt(streamIntervalRange.value) * 1000, // 转换为毫秒
        vehicleCount: parseInt(streamVehicleCountRange.value),
        anomalyRate: parseInt(anomalyRateRange.value),
        autoSubmit: document.getElementById('autoSubmit').checked
      };
      
      // 发送生成请求
      socket.emit('start-generation', params);
      addLog('用户', '请求流式生成数据', 'info');
      generationMode = 'stream';
    });
    
    // 停止生成按钮
    stopStreamBtn.addEventListener('click', function() {
      socket.emit('stop-generation');
      addLog('用户', '请求停止数据生成', 'warn');
    });
    
    // 重置数据按钮
    resetDataBtn.addEventListener('click', function() {
      if (isGenerating) {
        showAlert('警告', '请先停止当前生成过程');
        return;
      }
      
      if (confirm('确定要清空所有生成的数据吗?')) {
        socket.emit('reset-data');
        addLog('用户', '请求重置数据', 'warn');
      }
    });
    
    // 提交数据到API按钮
    submitApiBtn.addEventListener('click', function() {
      if (isGenerating) {
        showAlert('警告', '请先停止当前生成过程');
        return;
      }
      
      fetch('/api/submit-to-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          addLog('系统', '数据已成功提交到API', 'info');
          showAlert('成功', `数据已成功提交到API: 车辆:${data.vehicles.submittedCount}, 行驶:${data.driving.submittedCount}, 碳减排:${data.carbon.submittedCount}`);
        } else {
          addLog('错误', '提交数据到API失败: ' + data.message, 'error');
          showAlert('错误', '提交数据到API失败: ' + data.message);
        }
      })
      .catch(error => {
        addLog('错误', '提交数据到API失败: ' + error.message, 'error');
        showAlert('错误', '提交数据到API失败: ' + error.message);
      });
    });
    
    // 导入数据到数据库按钮
    importDbBtn.addEventListener('click', function() {
      if (isGenerating) {
        showAlert('警告', '请先停止当前生成过程');
        return;
      }
      
      fetch('/api/import-to-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          addLog('系统', '数据已成功导入到数据库', 'info');
          showAlert('成功', `数据已成功导入到数据库: 车辆:${data.vehiclesCount}, 行驶:${data.drivingCount}, 碳减排:${data.carbonCount}`);
        } else {
          addLog('错误', '导入数据到数据库失败: ' + data.message, 'error');
          showAlert('错误', '导入数据到数据库失败: ' + data.message);
        }
      })
      .catch(error => {
        addLog('错误', '导入数据到数据库失败: ' + error.message, 'error');
        showAlert('错误', '导入数据到数据库失败: ' + error.message);
      });
    });
    
    // 刷新文件列表
    refreshFilesBtn.addEventListener('click', refreshFiles);
    
    // 刷新车辆数据
    refreshVehiclesBtn.addEventListener('click', refreshVehicles);
    
    // 刷新碳减排数据
    refreshCarbonBtn.addEventListener('click', refreshCarbon);
    
    // 配置表单保存
    basicSettingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveSettings('basic-settings', {
        outputDir: document.getElementById('outputDir').value,
        defaultMode: document.getElementById('defaultMode').value
      });
    });
    
    carbonSettingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveSettings('carbon-settings', {
        gridEmissionFactor: parseFloat(document.getElementById('gridEmissionFactor').value),
        traditionalVehicleEmission: parseFloat(document.getElementById('traditionalVehicleEmission').value),
        creditsConversionRate: parseFloat(document.getElementById('creditsConversionRate').value)
      });
    });
    
    apiSettingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveSettings('api-settings', {
        apiBaseUrl: document.getElementById('apiBaseUrl').value,
        apiKey: document.getElementById('apiKey').value
      });
    });
    
    dbSettingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveSettings('db-settings', {
        host: document.getElementById('dbHost').value,
        port: parseInt(document.getElementById('dbPort').value),
        database: document.getElementById('dbName').value,
        user: document.getElementById('dbUser').value,
        password: document.getElementById('dbPassword').value
      });
    });
    
    blockchainSettingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveSettings('blockchain-settings', {
        provider: document.getElementById('blockchainProvider').value,
        blockInterval: parseInt(document.getElementById('blockInterval').value)
      });
    });
    
    // 测试连接按钮
    testApiBtn.addEventListener('click', function() {
      testConnection('api');
    });
    
    testDbBtn.addEventListener('click', function() {
      testConnection('db');
    });
    
    testBlockchainBtn.addEventListener('click', function() {
      testConnection('blockchain');
    });
    
    // JSON文件查看器
    jsonFilesDropdown.addEventListener('click', function(e) {
      if (e.target.classList.contains('dropdown-item')) {
        const filename = e.target.textContent;
        loadJsonFile(filename);
      }
    });
    
    // 辅助函数
    function updateStatus(status) {
      isGenerating = status;
      
      if (status) {
        statusIndicator.classList.remove('status-inactive');
        statusIndicator.classList.add('status-active');
        statusText.textContent = '正在生成';
      } else {
        statusIndicator.classList.remove('status-active');
        statusIndicator.classList.add('status-inactive');
        statusText.textContent = '未运行';
        
        if (generationMode === 'stream') {
          toggleStreamButtons(false);
        }
      }
    }
    
    function toggleStreamButtons(isStreaming) {
      if (isStreaming) {
        startStreamBtn.classList.add('d-none');
        stopStreamBtn.classList.remove('d-none');
      } else {
        startStreamBtn.classList.remove('d-none');
        stopStreamBtn.classList.add('d-none');
      }
    }
    
    function updateStats(stats) {
      if (!stats) return;
      
      if (stats.recordsGenerated) {
        vehicleCountDisplay.textContent = stats.recordsGenerated.vehicles || 0;
        drivingCountDisplay.textContent = stats.recordsGenerated.driving || 0;
        carbonCountDisplay.textContent = stats.recordsGenerated.carbon || 0;
        
        const blockchainCount = stats.recordsGenerated.blockchain 
          ? (stats.recordsGenerated.blockchain.blocks || 0) + (stats.recordsGenerated.blockchain.transactions || 0)
          : 0;
        
        blockchainCountDisplay.textContent = blockchainCount;
      }
    }
    
    function updateProgress(percent) {
      progressBar.style.width = `${percent}%`;
      progressPercent.textContent = `${percent}%`;
    }
    
    function calculateProgress(stats) {
      // 简单实现，根据生成的记录数来估算进度
      if (!stats || !stats.recordsGenerated) return 0;
      
      const vehicles = stats.recordsGenerated.vehicles || 0;
      const driving = stats.recordsGenerated.driving || 0;
      const carbon = stats.recordsGenerated.carbon || 0;
      
      // 假设每辆车会生成多条行驶和碳减排记录
      const estimatedTotal = vehicles * (vehicles > 0 ? 50 : 1); // 假设平均每辆车50条记录
      const current = driving + carbon;
      
      return Math.min(Math.round((current / (estimatedTotal || 1)) * 100), 99);
    }
    
    function resetDisplays() {
      vehicleCountDisplay.textContent = '0';
      drivingCountDisplay.textContent = '0';
      carbonCountDisplay.textContent = '0';
      blockchainCountDisplay.textContent = '0';
      progressBar.style.width = '0%';
      progressPercent.textContent = '0%';
    }
    
    function addLog(source, message, level = 'info') {
      const now = new Date().toLocaleTimeString();
      const logEntry = document.createElement('div');
      logEntry.className = `log-entry log-${level}`;
      logEntry.innerHTML = `<span class="log-time">[${now}]</span> <strong>${source}:</strong> ${message}`;
      logContainer.appendChild(logEntry);
      logContainer.scrollTop = logContainer.scrollHeight;
      
      // 限制日志条数
      if (logContainer.children.length > 100) {
        logContainer.removeChild(logContainer.children[0]);
      }
    }
    
    function formatBatchInfo(batchSize) {
      if (!batchSize) return '';
      
      const parts = [];
      if (batchSize.driving) parts.push(`行驶数据 ${batchSize.driving}条`);
      if (batchSize.carbon) parts.push(`碳减排数据 ${batchSize.carbon}条`);
      if (batchSize.blockchain) {
        const blocks = batchSize.blockchain.blocks || 0;
        const txs = batchSize.blockchain.transactions || 0;
        if (blocks) parts.push(`区块 ${blocks}个`);
        if (txs) parts.push(`交易 ${txs}笔`);
      }
      
      return parts.join(', ');
    }
    
    function showAlert(title, message) {
      const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
      document.getElementById('alertModalTitle').textContent = title;
      document.getElementById('alertModalBody').textContent = message;
      alertModal.show();
    }
    
    function refreshStatus() {
      fetch('/api/status')
        .then(response => response.json())
        .then(data => {
          updateStatus(data.isGenerating);
          updateStats(data.stats);
          
          if (data.isGenerating) {
            updateProgress(calculateProgress(data.stats));
          }
        })
        .catch(error => {
          console.error('获取状态失败:', error);
        });
    }
    
    function refreshFiles() {
      fetch('/api/files')
        .then(response => response.json())
        .then(files => {
          const filesList = document.getElementById('filesList');
          
          if (!files || files.length === 0) {
            filesList.innerHTML = '<tr><td colspan="4" class="text-center">暂无数据文件</td></tr>';
            return;
          }
          
          filesList.innerHTML = '';
          files.forEach(file => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${file.name}</td>
              <td>${formatFileSize(file.size)}</td>
              <td>${new Date(file.lastModified).toLocaleString()}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary file-download" data-file="${file.name}">
                  <i class="bi bi-download"></i>
                </button>
                <button class="btn btn-sm btn-outline-info file-view" data-file="${file.name}">
                  <i class="bi bi-eye"></i>
                </button>
              </td>
            `;
            filesList.appendChild(tr);
          });
          
          // 添加文件下载事件
          document.querySelectorAll('.file-download').forEach(btn => {
            btn.addEventListener('click', function() {
              const filename = this.getAttribute('data-file');
              window.open(`/api/files/${filename}`, '_blank');
            });
          });
          
          // 添加文件查看事件
          document.querySelectorAll('.file-view').forEach(btn => {
            btn.addEventListener('click', function() {
              const filename = this.getAttribute('data-file');
              loadJsonFile(filename);
              
              // 切换到数据预览标签
              const dataPreviewTab = document.querySelector('[data-bs-target="#dataPreviewTab"]');
              bootstrap.Tab.getInstance(dataPreviewTab).show();
            });
          });
          
          // 更新JSON文件下拉列表
          updateJsonFilesDropdown(files.map(file => file.name));
        })
        .catch(error => {
          console.error('获取文件列表失败:', error);
        });
    }
    
    function refreshVehicles() {
      fetch('/api/data/vehicles')
        .then(response => response.json())
        .then(vehicles => {
          const vehiclesList = document.getElementById('vehiclesList');
          
          if (!vehicles || vehicles.length === 0) {
            vehiclesList.innerHTML = '<tr><td colspan="4" class="text-center">暂无车辆数据</td></tr>';
            return;
          }
          
          // 最多显示10辆车
          const displayVehicles = vehicles.slice(0, 10);
          
          vehiclesList.innerHTML = '';
          displayVehicles.forEach(vehicle => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${vehicle.vin}</td>
              <td>${vehicle.model}</td>
              <td>${vehicle.licensePlate}</td>
              <td>
                <span class="badge ${vehicle.status === 'online' ? 'bg-success' : vehicle.status === 'offline' ? 'bg-secondary' : 'bg-danger'}">
                  ${vehicle.status}
                </span>
              </td>
            `;
            vehiclesList.appendChild(tr);
          });
        })
        .catch(error => {
          console.error('获取车辆数据失败:', error);
        });
    }
    
    function refreshCarbon() {
      fetch('/api/data/carbon')
        .then(response => response.json())
        .then(data => {
          const carbonList = document.getElementById('carbonList');
          
          if (!data || !data.records || data.records.length === 0) {
            carbonList.innerHTML = '<tr><td colspan="4" class="text-center">暂无碳减排数据</td></tr>';
            return;
          }
          
          // 最多显示10条记录
          const displayRecords = data.records.slice(0, 10);
          
          carbonList.innerHTML = '';
          displayRecords.forEach(record => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${record.calculationDate}</td>
              <td>${record.vin}</td>
              <td>${record.carbonReduction.toFixed(2)}</td>
              <td>${record.carbonCredits.toFixed(2)}</td>
            `;
            carbonList.appendChild(tr);
          });
        })
        .catch(error => {
          console.error('获取碳减排数据失败:', error);
        });
    }
    
    function loadJsonFile(filename) {
      fetch(`/api/files/${filename}`)
        .then(response => response.json())
        .then(data => {
          jsonViewer.textContent = JSON.stringify(data, null, 2);
        })
        .catch(error => {
          console.error('加载JSON文件失败:', error);
          jsonViewer.textContent = `加载文件 ${filename} 失败: ${error.message}`;
        });
    }
    
    function updateJsonFilesDropdown(files) {
      // 过滤只保留JSON文件
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      jsonFilesDropdown.innerHTML = '';
      jsonFiles.forEach(file => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = '#';
        a.textContent = file;
        li.appendChild(a);
        jsonFilesDropdown.appendChild(li);
      });
    }
    
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function saveSettings(type, data) {
      fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: type,
          data: data
        })
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          addLog('系统', `${type} 配置已保存`, 'info');
          showAlert('成功', '配置已保存');
        } else {
          addLog('错误', `保存 ${type} 配置失败: ${result.message}`, 'error');
          showAlert('错误', `保存配置失败: ${result.message}`);
        }
      })
      .catch(error => {
        addLog('错误', `保存 ${type} 配置失败: ${error.message}`, 'error');
        showAlert('错误', `保存配置失败: ${error.message}`);
      });
    }
    
    function testConnection(type) {
      let url, data;
      
      switch (type) {
        case 'api':
          url = '/api/test-api';
          data = {
            baseUrl: document.getElementById('apiBaseUrl').value,
            apiKey: document.getElementById('apiKey').value
          };
          break;
        case 'db':
          url = '/api/test-db';
          data = {
            host: document.getElementById('dbHost').value,
            port: parseInt(document.getElementById('dbPort').value),
            database: document.getElementById('dbName').value,
            user: document.getElementById('dbUser').value,
            password: document.getElementById('dbPassword').value
          };
          break;
        case 'blockchain':
          url = '/api/test-blockchain';
          data = {
            provider: document.getElementById('blockchainProvider').value
          };
          break;
        default:
          return;
      }
      
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          addLog('系统', `${type} 连接测试成功`, 'info');
          showAlert('成功', `${type} 连接测试成功`);
        } else {
          addLog('错误', `${type} 连接测试失败: ${result.message}`, 'error');
          showAlert('错误', `${type} 连接测试失败: ${result.message}`);
        }
      })
      .catch(error => {
        addLog('错误', `${type} 连接测试失败: ${error.message}`, 'error');
        showAlert('错误', `${type} 连接测试失败: ${error.message}`);
      });
    }
    
    // 初始化
    function init() {
      // 获取当前状态
      refreshStatus();
      
      // 获取设置
      fetch('/api/config')
        .then(response => response.json())
        .then(config => {
          // 设置默认值
          if (config.global) {
            if (config.global.outputDir) {
              document.getElementById('outputDir').value = config.global.outputDir;
            }
            if (config.global.mode) {
              document.getElementById('defaultMode').value = config.global.mode;
            }
          }
          
          if (config.carbon) {
            if (config.carbon.gridEmissionFactor) {
              document.getElementById('gridEmissionFactor').value = config.carbon.gridEmissionFactor;
            }
            if (config.carbon.traditionalVehicleEmission) {
              document.getElementById('traditionalVehicleEmission').value = config.carbon.traditionalVehicleEmission;
            }
            if (config.carbon.creditsConversionRate) {
              document.getElementById('creditsConversionRate').value = config.carbon.creditsConversionRate;
            }
          }
          
          if (config.global && config.global.integration) {
            if (config.global.integration.apiBaseUrl) {
              document.getElementById('apiBaseUrl').value = config.global.integration.apiBaseUrl;
            }
            
            if (config.global.integration.database) {
              const db = config.global.integration.database;
              if (db.host) document.getElementById('dbHost').value = db.host;
              if (db.port) document.getElementById('dbPort').value = db.port;
              if (db.database) document.getElementById('dbName').value = db.database;
              if (db.user) document.getElementById('dbUser').value = db.user;
              // 密码通常不会通过API返回
            }
            
            if (config.global.integration.blockchain && config.global.integration.blockchain.provider) {
              document.getElementById('blockchainProvider').value = config.global.integration.blockchain.provider;
            }
          }
          
          if (config.blockchain && config.blockchain.blockInterval) {
            document.getElementById('blockInterval').value = config.blockchain.blockInterval;
          }
        })
        .catch(error => {
          console.error('获取配置失败:', error);
        });
      
      // 获取文件列表
      refreshFiles();
      
      // 获取车辆和碳减排数据
      refreshVehicles();
      refreshCarbon();
      
      // 添加初始日志
      addLog('系统', '数据模拟器控制面板已加载', 'info');
    }
    
    // 启动初始化
    init();
  });