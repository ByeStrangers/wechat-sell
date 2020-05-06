package com.gzcstec.controller;

import com.gzcstec.convert.ConvertOrderForm2OrderDTO;
import com.gzcstec.dto.OrderDTO;
import com.gzcstec.enums.ExceptionCodeEnums;
import com.gzcstec.exception.SellException;
import com.gzcstec.form.OrderForm;
import com.gzcstec.service.BuyerOrderService;
import com.gzcstec.service.OrderService;
import com.gzcstec.utils.ResultUtils;
import com.gzcstec.vo.ResultVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.util.CollectionUtils;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 买家订单
 * Created by Administrator on 2017/10/18 0018.
 */
@RestController
@RequestMapping("/buyer/order")
@Slf4j
public class BuyerOrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private BuyerOrderService buyerOrderService;

    //创建订单
    @PostMapping("/create")
    public ResultVO<Map<String,String>> create(@Valid OrderForm orderForm
            , BindingResult bindingResult) {

        if(bindingResult.hasErrors()) {
            //表单验证不通过
            log.error("【创建订单】订单数据不正确，orderForm={}" , orderForm);
            throw new SellException(ExceptionCodeEnums.PARAM_ERROR ,
                    bindingResult.getFieldError().getDefaultMessage());
        }

        OrderDTO orderDTO = ConvertOrderForm2OrderDTO.convert(orderForm);

        if(CollectionUtils.isEmpty(orderDTO.getOrderDetailList())) {
            log.error("【创建订单】购物车不能为空，orderDTO={}" , orderDTO);
            throw new SellException(ExceptionCodeEnums.Order_CART_EMPTY);
        }

        OrderDTO result = orderService.create(orderDTO);

        Map<String,String> map = new HashMap<>();
        map.put("orderId" , result.getOrderId());

        return ResultUtils.success(map);
    }

    //订单列表
    @GetMapping("/list")
    public ResultVO<List<OrderDTO>> list(@RequestParam("openid") String openid,
                                         @RequestParam(value = "page" , defaultValue = "0") Integer page,
                                         @RequestParam(value = "size" , defaultValue = "10") Integer size) {

        return ResultUtils.success(orderService.findList(openid , new PageRequest(page , size)).getContent());
    }

    //订单详情
    @GetMapping("/detail")
    public ResultVO<OrderDTO> detail(@RequestParam("openid") String openid , @RequestParam("orderId") String orderId) {
        return ResultUtils.success(buyerOrderService.findOne(openid , orderId));
    }

    //取消订单
    @PostMapping("/cancel")
    public ResultVO<OrderDTO> cancel(@RequestParam("openid") String openid , @RequestParam("orderId") String orderId) {
        return ResultUtils.success(buyerOrderService.cancel(openid , orderId));
    }


}
