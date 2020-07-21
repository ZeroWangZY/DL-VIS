package com.zju.elkgraph.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
    	log.info("----加载跨域配置----");
        registry.addMapping("/**")
        .allowedOrigins("*") //允许任何域名
        .allowedMethods("*") //允许任何方法
        .allowedHeaders("*"); //允许任何请求头
    }
}