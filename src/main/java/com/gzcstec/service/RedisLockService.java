package com.gzcstec.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * redis 处理开锁、解锁
 * Created by Administrator on 2017/11/11 0011.
 */
@Component
@Slf4j
public class RedisLockService {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    /**
     * 加锁
     * @param key 唯一键
     * @param value 超时时间
     * @return
     */
    public boolean lock(String key , String value) {
        //1、使用redis中的setnx方法，如果设置失败，说明已经有该key加锁了
        if(stringRedisTemplate.opsForValue().setIfAbsent(key , value)) {
            //加锁成功
            return true;
        }
        //获取key原来的加锁值
        String currentTime = stringRedisTemplate.opsForValue().get(key);
        //2、判断是否有锁是否过期，如果过期则获得锁，否则后续逻辑无法操作
        if(!StringUtils.isEmpty(currentTime) && Long.parseLong(currentTime) < System.currentTimeMillis()) {
            //3、使用redis中的getset方法，获取原来锁值和保存新的锁值
            String oldTime = stringRedisTemplate.opsForValue().getAndSet(key , value);
            //4、防止加锁过程中并发问题，使用比较原锁值，相等则对应的逻辑处理加锁了，否则并发中的其他请求没有抢到锁
            if(!StringUtils.isEmpty(oldTime) && oldTime.equals(currentTime)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 解锁
     */
    public void unlock(String key , String value) {
        //安全解锁
        try {
            //1、根据Key获取原锁值
            String currentTime = stringRedisTemplate.opsForValue().get(key);
            //2、根据锁值相等来解锁
            if(!StringUtils.isEmpty(currentTime) && currentTime.equals(value)) {
                stringRedisTemplate.opsForValue().getOperations().delete(key);
            }
        }catch (Exception e) {
            log.error("【redis分布式锁】解锁失败，{}" , e);
        }
    }
}
