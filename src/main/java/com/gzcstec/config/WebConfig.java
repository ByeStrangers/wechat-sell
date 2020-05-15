package com.gzcstec.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

/**
 * @CalssName: WebConfig
 * @Description:
 * @Author: Xuxiong
 * @Date: 2020/5/15 0015 11:52
 * @Version: 1.0
 */
@Configuration
public class WebConfig extends WebMvcConfigurationSupport {

    //静态资源映射
    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }
}
