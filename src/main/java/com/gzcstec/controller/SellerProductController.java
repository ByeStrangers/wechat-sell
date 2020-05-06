package com.gzcstec.controller;

import com.gzcstec.dataobject.ProductCategory;
import com.gzcstec.dataobject.ProductInfo;
import com.gzcstec.dataobject.mapper.SellerProductMapper;
import com.gzcstec.enums.ExceptionCodeEnums;
import com.gzcstec.exception.SellException;
import com.gzcstec.form.ProductForm;
import com.gzcstec.service.CategoryService;
import com.gzcstec.service.ProductService;
import com.gzcstec.utils.KeyUtils;
import com.sun.javafx.sg.prism.NGShape;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * Created by Administrator on 2017/11/1 0001.
 */
@Controller
@Slf4j
@RequestMapping("/seller/product")
public class SellerProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/list")
    public ModelAndView list(@RequestParam(value = "page" , required = false , defaultValue = "1") Integer page,
                             @RequestParam(value = "size" , required = false , defaultValue = "10") Integer size,
                             Map<String,Object> map) {
        PageRequest pageRequest = new PageRequest(page - 1, size);
        Page<ProductInfo> productInfos = productService.findByPage(pageRequest);
        map.put("productInfos" , productInfos);
        map.put("currentPage" , page);

        return new ModelAndView("product/list" , map);
    }

    @GetMapping("off_sale")
    public ModelAndView offSale(@RequestParam("productId") String productId,
                                Map<String,Object> map) {
        try {
            ProductInfo productInfo = productService.findOne(productId);
            productService.offSafe(productInfo);
        }catch (Exception e) {
            log.error("【卖家商品下架】发生错误，e={}" , e);
            map.put("msg" , e.getMessage());
            map.put("url" , "/sell/seller/product/list");
            return new ModelAndView("/common/error" , map);
        }


        map.put("msg" , ExceptionCodeEnums.PRODUCT_OFF_SALE_SUCCESS.getMsg());
        map.put("url" , "/sell/seller/product/list");
        return new ModelAndView("/common/success" , map);
    }

    @GetMapping("on_sale")
    public ModelAndView onSale(@RequestParam("productId") String productId,
                                Map<String,Object> map) {
        try {
            ProductInfo productInfo = productService.findOne(productId);
            productService.onSafe(productInfo);
        }catch (Exception e) {
            log.error("【卖家商品上架】发生错误，e={}" , e);
            map.put("msg" , e.getMessage());
            map.put("url" , "/sell/seller/product/list");
            return new ModelAndView("/common/error" , map);
        }


        map.put("msg" , ExceptionCodeEnums.PRODUCT_ON_SALE_SUCCESS.getMsg());
        map.put("url" , "/sell/seller/product/list");
        return new ModelAndView("/common/success" , map);
    }

    @GetMapping("/index")
    public ModelAndView index(@RequestParam(value = "productId" , required = false ) String productId ,
                              Map<String,Object> map) {
        if(!StringUtils.isEmpty(productId)) {
            //1.查找商品
            ProductInfo productInfo = productService.findOne(productId);
            map.put("productInfo" , productInfo);
        }

        //2.查找类目
        List<ProductCategory> categories = categoryService.findAll();
        map.put("categories" , categories);

        return new ModelAndView("/product/index" , map);
    }

    @PostMapping("/save")
    public ModelAndView save(@Valid ProductForm productForm,
                            BindingResult bindingResult,
                            Map<String,Object> map) {

        if(bindingResult.hasErrors()) {
            //1.前台数据验证不通过
            map.put("msg" , bindingResult.getFieldError().getDefaultMessage());
            map.put("url" , "/sell/seller/product/index");
            return new ModelAndView("/common/error" , map);
        }

        ProductInfo productInfo = new ProductInfo();
        //2.判断是否为更新商品
        if(!StringUtils.isEmpty(productForm.getProductId())) {
            productInfo = productService.findOne(productForm.getProductId());
            if(null == productInfo) {
                log.error("【卖家新增商品】商品不存在，productId={}" , productForm.getProductId());
                map.put("msg" , ExceptionCodeEnums.PRODUCT_NOT_FOUND.getMsg());
                map.put("url" , "/sell/seller/product/index");
                return new ModelAndView("/common/error" , map);
            }
        }else {
            //2.进行赋值
            productForm.setProductId(KeyUtils.gen());
        }

        BeanUtils.copyProperties(productForm , productInfo);

        //3.保存商品
        try {
            productService.save(productInfo);
        }catch (SellException e) {
            log.error("【卖家新增商品】添加商品出错，e={}" , e);
            map.put("msg" , e.getMessage());
            map.put("url" , "/sell/seller/product/index");
            return new ModelAndView("/common/error" , map);
        }

        map.put("msg" , ExceptionCodeEnums.PRODUCT_UPDATE_SUCCESS.getMsg());
        map.put("url" , "/sell/seller/product/list");

        return new ModelAndView("common/success" , map);
    }

}
