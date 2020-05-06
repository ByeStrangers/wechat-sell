package com.gzcstec.controller;

import com.gzcstec.service.SeckillService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * @CalssName: SeckillController
 * @Description: 秒杀服务
 * @Author: Xuxiong
 * @Date: 2020/5/6 0006 18:25
 * @Version: 1.0
 */
@RestController
@Slf4j
public class SeckillController {
    @Autowired
    private SeckillService seckillService;

    /**
     * 查询秒杀活动特价商品信息
     * @param productId 商品ID
     * @return 商品信息
     * @throws Exception
     */
    @GetMapping("query/{productId}")
    public String query(@PathVariable(value = "productId") String productId) throws Exception{
        return seckillService.querySeckillProductInfo(productId);
    }

    /**
     * 商品秒杀
     * @param productId 商品ID
     * @return 商品信息
     * @throws Exception
     */
    @GetMapping("order/{productId}")
    public String skill(@PathVariable(value = "productId") String productId) throws Exception{
        log.info("@skill request, productId:"+ productId);
        seckillService.orderProductMockDiffUser(productId);
        return seckillService.querySeckillProductInfo(productId);
    }
}
