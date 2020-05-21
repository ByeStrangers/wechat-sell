package com.gzcstec.service.impl;

import com.gzcstec.enums.ExceptionCodeEnums;
import com.gzcstec.exception.SellException;
import com.gzcstec.service.RedisLockService;
import com.gzcstec.service.SeckillService;
import com.gzcstec.utils.KeyUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @CalssName: SeckillServiceImpl
 * @Description: 秒杀接口
 * @Author: Xuxiong
 * @Date: 2020/5/6 0006 18:32
 * @Version: 1.0
 */
@Service
@Slf4j
public class SeckillServiceImpl implements SeckillService {
    @Autowired
    private RedisLockService redisLockService;

    private static final int TIMEOUT = 10 * 1000; //锁超时时间

    /**
     * 国庆活动，皮蛋粥特价，限量100000份
     */
    static Map<String, Integer> products;
    static Map<String, Integer> stock;
    static Map<String, String> orders;

    static {
        /**
         * 模拟多个表，商品信息表、库存表、秒杀成功订单表
         */
        products = new HashMap<>();
        stock = new HashMap<>();
        orders = new HashMap<>();
        products.put("123456", 100000);
        stock.put("123456", 100000);
    }

    private String queryMap(String productId){
        return String.format("国庆活动，皮蛋粥特价，限量份%s，还剩：%s份，该商品成功下单用户数目：%s人", products.get(productId), stock.get(productId), orders.size());
    }

    @Override
    public String querySeckillProductInfo(String productId) {
        return this.queryMap(productId);
    }

    @Override
    public String orderProductMockDiffUser(String productId) {
        //加锁
        long time = System.currentTimeMillis() + TIMEOUT;
        if(!redisLockService.lock(productId, String.valueOf(time))){
            throw new SellException(ExceptionCodeEnums.GET_LOCK_FAIL);
        }

        //1、查询该商品库存，为0则活动结束
        int  stockNum = stock.get(productId);
        if(stockNum == 0){
            throw new SellException(ExceptionCodeEnums.ACTIVITY_END);
        }

        //2、下单（模拟不同用户openId不同）
        String openId = KeyUtils.gen();
        if(orders.containsKey(openId)){
            throw new SellException(ExceptionCodeEnums.HAS_ORDER);
        }
        orders.put(openId, productId);

        //3、减库存
        stockNum -= 1;

        //4、设置库存
        stock.put(productId, stockNum);

        //解锁
        redisLockService.unlock(productId, String.valueOf(time));
        return openId;
    }

    @Override
    public String seckillTest(Integer threadNum) {
        //每次执行秒杀初始化
        stock.put("123456", 100000);
        orders = new HashMap<>();
        threadNum = threadNum == null ? 500 : threadNum;//创建指定线程进行测试
        CountDownLatch countDownLatch = new CountDownLatch(threadNum);
        try{
            //1、创建一个缓存线程池
            ExecutorService executorService =  Executors.newCachedThreadPool();
            for(int i = 0; i < threadNum; i++){
                //执行线程
                executorService.execute(() -> {
                    countDownLatch.countDown();
                    String userId = orderProductMockDiffUser("123456");//秒杀
//                    System.out.println(userId + "秒杀完毕");
                });
            }
            countDownLatch.await();
            //当所有线程执行完毕，执行下面，使用countDownLatch类，具体参考https://www.jianshu.com/p/e233bb37d2e6，此处采用线程池方式
            return querySeckillProductInfo("123456");
        }catch (Exception e){
            e.printStackTrace();
            return e.getMessage();
        }
    }
}
