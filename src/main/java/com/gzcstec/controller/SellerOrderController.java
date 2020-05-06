package com.gzcstec.controller;

import com.gzcstec.dto.OrderDTO;
import com.gzcstec.enums.ExceptionCodeEnums;
import com.gzcstec.exception.SellException;
import com.gzcstec.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import javax.persistence.criteria.Order;
import java.util.Map;

/**
 * 卖家端商品
 * Created by Administrator on 2017/11/1 0001.
 */
@Controller
@Slf4j
@RequestMapping("/seller/order")
public class SellerOrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/list")
    public ModelAndView list(@RequestParam(required = false , value = "page" , defaultValue = "1") Integer page,
                             @RequestParam(required = false , value = "size" , defaultValue = "10") Integer size,
                             Map<String ,Object> map) {

        PageRequest pageRequest = new PageRequest(page -1 , size);
        Page<OrderDTO> orderDTOS = orderService.findList(pageRequest);
        map.put("orderDTOS" , orderDTOS);
        map.put("currentPage" , page);
        return new ModelAndView("order/list" , map);
    }

    @GetMapping("cancel")
    public ModelAndView cancel(@RequestParam("orderId") String orderId ,
                               Map<String,Object> map) {
        OrderDTO orderDTO = null;
        try {
            orderDTO = orderService.findOne(orderId);
            orderService.cancel(orderDTO);
        }catch (Exception e) {
            log.error("【卖家取消订单】取消订单失败，e={}" , e);
            map.put("msg" , e.getMessage());
            map.put("url" , "/sell/seller/order/list");
            return new ModelAndView("/common/error" , map);
        }


        map.put("msg" , ExceptionCodeEnums.CANCEL_ORDER_SUCCESS.getMsg());
        map.put("url" , "/sell/seller/order/list");
        return new ModelAndView("/common/success" , map);
    }

    @GetMapping("/detail")
    public ModelAndView detail(@RequestParam("orderId")String orderId,
                               Map<String,Object> map) {
        OrderDTO orderDTO = null;
        try {
            orderDTO = orderService.findOne(orderId);
        }catch (SellException e) {
            log.error("【卖家查询订单详情】发生错误，e={}" , e);
            map.put("msg" , e.getMessage());
            map.put("url" , "/sell/seller/order/list");
            return new ModelAndView("/common/error" , map);
        }

        map.put("orderDTO" , orderDTO);
        return new ModelAndView("order/detail" , map);
    }

    @GetMapping("/finish")
    public ModelAndView finish(@RequestParam("orderId")String orderId,
                               Map<String,Object> map) {
        try {
            OrderDTO orderDTO = orderService.findOne(orderId);
            orderService.finish(orderDTO);
        }catch (SellException e) {
            log.error("【卖家完结订单】发生错误，e={}" , e);
            map.put("msg" , e.getMessage());
            map.put("url" , "/sell/seller/order/list");
            return new ModelAndView("/common/error" , map);
        }

        map.put("msg" , ExceptionCodeEnums.CANCEL_ORDER_SUCCESS.getMsg());
        map.put("url" , "/sell/seller/order/list");
        return new ModelAndView("/common/success" , map);
    }

}
