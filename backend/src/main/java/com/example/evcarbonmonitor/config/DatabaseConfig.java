// backend/src/main/java/com/example/evcarbonmonitor/config/DatabaseConfig.java
package com.example.evcarbonmonitor.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.example.evcarbonmonitor.repository")
@EnableTransactionManagement
@EnableJpaAuditing
public class DatabaseConfig {
    // JPA配置可以在这里进行自定义
}
