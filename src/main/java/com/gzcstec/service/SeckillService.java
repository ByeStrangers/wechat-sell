package com.gzcstec.service;

/**
 * @CalssName: SeckillService
 * @Description: 秒杀接口
 * @Author: Xuxiong
 * @Date: 2020/5/6 0006 18:30
 * @Version: 1.0
 */
public interface SeckillService {
    //查询商品信息
    String querySeckillProductInfo(String productId);

    //商品秒杀
    String orderProductMockDiffUser(String productId);

    //秒杀测试，模拟并发
    String seckillTest(Integer threadNum);
}
