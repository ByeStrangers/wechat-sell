package com.gzcstec;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@SpringBootApplication
@MapperScan(basePackages = "com.gzcstec.dataobject.mapper")
@EnableCaching
@Controller
public class SellApplication {

	public static void main(String[] args) {
		SpringApplication.run(SellApplication.class, args);
	}

	@RequestMapping("flow")
	public String getIndex(Model model){
		model.addAttribute("title", "流程图渲染案例");
		return "flow";
	}
}
