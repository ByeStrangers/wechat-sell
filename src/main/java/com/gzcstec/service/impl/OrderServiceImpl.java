package com.gzcstec.service.impl;

import com.gzcstec.convert.ConvertOrderMaster2OrderDTO;
import com.gzcstec.dataobject.OrderDetail;
import com.gzcstec.dataobject.OrderMaster;
import com.gzcstec.dataobject.ProductInfo;
import com.gzcstec.dto.CartDTO;
import com.gzcstec.dto.OrderDTO;
import com.gzcstec.enums.ExceptionCodeEnums;
import com.gzcstec.enums.OrderStatusEnums;
import com.gzcstec.enums.PayStatusEnums;
import com.gzcstec.enums.ResultCodeEnums;
import com.gzcstec.exception.SellException;
import com.gzcstec.repository.OrderDetailRepository;
import com.gzcstec.repository.OrderMasterRepository;
import com.gzcstec.service.*;
import com.gzcstec.utils.KeyUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by Administrator on 2017/10/15 0015.
 */
@Service
@Slf4j
public class OrderServiceImpl implements OrderService {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private OrderMasterRepository orderMasterRepository;

    @Autowired
    private PayService payService;

    @Autowired
    private PushMessageService pushMessageService;

    @Autowired
    private WebSocketService webSocketService;

    @Override
    @Transactional
    public OrderDTO create(OrderDTO orderDTO) {

        BigDecimal orderAmount = new BigDecimal(0);
        String orderId = KeyUtils.gen();

        //1.查找商品列表
        for(OrderDetail orderDetail : orderDTO.getOrderDetailList()) {
            ProductInfo productInfo = productService.findOne(orderDetail.getProductId());
            if( null == productInfo) {
                //没有该商品，抛出异常
                throw new SellException(ExceptionCodeEnums.PRODUCT_NOT_FOUND);
            }

            //2.计算订单总额
            orderAmount = productInfo.getProductPrice()
                    .multiply(new BigDecimal(orderDetail.getProductQuantity()))
                    .add(orderAmount);
            //3.订单详情入库
            BeanUtils.copyProperties(productInfo , orderDetail);
            orderDetail.setDetailId(KeyUtils.gen());
            orderDetail.setOrderId(orderId);
            orderDetailRepository.save(orderDetail);
        }

        //3.写入订单(orderMaster和orderDetail)
        OrderMaster orderMaster = new OrderMaster();
        orderDTO.setOrderId(orderId);
        BeanUtils.copyProperties(orderDTO , orderMaster);
        orderMaster.setOrderAmount(orderAmount);
        orderMaster.setOrderStatus(OrderStatusEnums.NEW.getCode());
        orderMaster.setPayStatus(PayStatusEnums.NEW.getCode());
        orderMasterRepository.save(orderMaster);
        //4.出库
        List<CartDTO> cartDTOList = orderDTO.getOrderDetailList().stream()
                .map(e -> new CartDTO(e.getProductId() , e.getProductQuantity()))
                .collect(Collectors.toList());
        productService.decreaseStock(cartDTOList);

        //websock消息通知
        webSocketService.sendMessage(orderDTO.getOrderId());

        return orderDTO;
    }

    @Override
    public OrderDTO findOne(String orderId) {
        //1.查看主订单
       OrderMaster orderMaster = orderMasterRepository.findOne(orderId);
       if( null == orderMaster ) {
           throw new SellException(ExceptionCodeEnums.ORDER_NOT_FOUND);
       }

        //2.查看订单详情
        List<OrderDetail> orderDetailList = orderDetailRepository.findByOrderId(orderId);
       if(CollectionUtils.isEmpty(orderDetailList)) {
           throw new SellException(ExceptionCodeEnums.ORDER_DETAIL_NOT_FOUND);
       }

       OrderDTO orderDTO = new OrderDTO();
       BeanUtils.copyProperties(orderMaster , orderDTO);
       orderDTO.setOrderDetailList(orderDetailList);

        return orderDTO;
    }

    @Override
    public Page<OrderDTO> findList(String buyerOpenid, Pageable pageable) {
        //1.查找用户订单
        Page<OrderMaster> orderMasterList = orderMasterRepository.findByBuyerOpenid(buyerOpenid , pageable);

        List<OrderDTO> orderDTOList = ConvertOrderMaster2OrderDTO.convert(orderMasterList.getContent());

        return new PageImpl<OrderDTO>(orderDTOList , pageable , orderMasterList.getTotalElements());
    }

    @Override
    @Transactional
    public OrderDTO cancel(OrderDTO orderDTO) {
        //判断订单状态
        if(!OrderStatusEnums.NEW.getCode().equals(orderDTO.getOrderStatus())) {
            log.error("【取消订单】 订单状态不正确：orderId={},orderStatus={}" , orderDTO.getOrderId() , orderDTO.getOrderStatus());
            throw new SellException(ExceptionCodeEnums.ORDER_STATUS_ERROR);
        }

        //更新订单状态
        OrderMaster orderMaster = new OrderMaster();
        orderDTO.setOrderStatus(OrderStatusEnums.CANCEL.getCode());
        BeanUtils.copyProperties(orderDTO , orderMaster);
        OrderMaster updateResult = orderMasterRepository.save(orderMaster);
        if( null == updateResult) {
            log.error("【取消订单】更新订单状态失败：orderMaster={}" , orderMaster);
            throw new SellException(ExceptionCodeEnums.ORDER_STATUS_UPDATE_FAIL);
        }

        //增加库存
        if(CollectionUtils.isEmpty(orderDTO.getOrderDetailList())) {
            log.error("【取消订单】订单中无商品详情：orderDTO={}" , orderDTO);
            throw new SellException(ExceptionCodeEnums.ORDER_DETAIL_NOT_FOUND);
        }

        List<CartDTO> cartDTOList = orderDTO.getOrderDetailList().stream()
                .map(e -> new CartDTO(e.getProductId() , e.getProductQuantity()))
                .collect(Collectors.toList());

        productService.increaseStock(cartDTOList);
        //判断支付状态，如果是已支付，则退款
        if(PayStatusEnums.FINISH.getCode().equals(orderDTO.getPayStatus())) {
            payService.refund(orderDTO);
        }

        return orderDTO;
    }

    @Override
    public OrderDTO finish(OrderDTO orderDTO) {
        //判断订单状态
        if(!OrderStatusEnums.NEW.getCode().equals(orderDTO.getOrderStatus())) {
            log.error("【完结订单】 订单状态不正确：orderId={},orderStatus={}" , orderDTO.getOrderId() , orderDTO.getOrderStatus());
            throw new SellException(ExceptionCodeEnums.ORDER_STATUS_ERROR);
        }


        //更新订单
        OrderMaster orderMaster = new OrderMaster();
        orderDTO.setOrderStatus(OrderStatusEnums.FINISH.getCode());
        BeanUtils.copyProperties(orderDTO , orderMaster);
        OrderMaster updateResult = orderMasterRepository.save(orderMaster);
        if( null == updateResult) {
            log.error("【取消订单】更新订单状态失败：orderMaster={}" , orderMaster);
            throw new SellException(ExceptionCodeEnums.ORDER_STATUS_UPDATE_FAIL);
        }

        //推送消息
        pushMessageService.orderStatus(orderDTO);

        return orderDTO;
    }

    @Override
    public OrderDTO pay(OrderDTO orderDTO) {
        //检查订单支付状态
        if(!PayStatusEnums.NEW.getCode().equals(orderDTO.getPayStatus())) {
            log.error("【支付订单】 订单支付状态不正确：orderId={},orderStatus={}" , orderDTO.getOrderId() , orderDTO.getPayStatus());
            throw new SellException(ExceptionCodeEnums.ORDER_PAY_STATUS_ERROR);
        }

        //更新订单
        OrderMaster orderMaster = new OrderMaster();
        orderDTO.setPayStatus(PayStatusEnums.FINISH.getCode());
        BeanUtils.copyProperties(orderDTO , orderMaster);
        OrderMaster updateResult = orderMasterRepository.save(orderMaster);
        if( null == updateResult) {
            log.error("【支付订单】更新订单支付状态失败：orderMaster={}" , orderMaster);
            throw new SellException(ExceptionCodeEnums.ORDER_STATUS_UPDATE_FAIL);
        }

        return orderDTO;
    }

    @Override
    public Page<OrderDTO> findList(Pageable pageable) {
        Page<OrderMaster> orderMasters = orderMasterRepository.findAll(pageable);

        List<OrderDTO> orderDTOList = ConvertOrderMaster2OrderDTO.convert(orderMasters.getContent());

        return new PageImpl<>(orderDTOList , pageable , orderMasters.getTotalElements());

    }
}
