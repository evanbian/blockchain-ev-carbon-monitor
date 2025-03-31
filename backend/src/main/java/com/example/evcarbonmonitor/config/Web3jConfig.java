// backend/src/main/java/com/example/evcarbonmonitor/config/Web3jConfig.java
package com.example.evcarbonmonitor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

@Configuration
public class Web3jConfig {

    @Value("${blockchain.web3-provider}")
    private String web3ProviderUrl;

    @Bean
    public Web3j web3j() {
        return Web3j.build(new HttpService(web3ProviderUrl));
    }
}
