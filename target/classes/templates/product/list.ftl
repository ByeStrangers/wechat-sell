<html>

    <#include "../common/header.ftl">

    <body>

        <div id="wrapper" class="toggled">
            <#--左边栏-->
            <#include "../common/nav.ftl">
            <div id="page-content-wrapper">
            <#--主体内容-->
                <div class="container-fluid">
                    <div class="row clearfix">
                        <div class="col-md-12 column">
                            <table class="table table-bordered">
                                <thead>
                                <tr>
                                    <th>商品id</th>
                                    <th>名称</th>
                                    <th>图片</th>
                                    <th>单价</th>
                                    <th>库存</th>
                                    <th>概述</th>
                                    <th>类目</th>
                                    <th>创建时间</th>
                                    <th>修改时间</th>
                                    <th colspan="2">操作</th>
                                </tr>
                                </thead>
                                <tbody>

                                <#list productInfos.content as product>
                                <tr>
                                    <td>${product.productId}</td>
                                    <td>${product.productName}</td>
                                    <td><img height="100" width="100" src="${(product.productIcon)!''}"></td>
                                    <td>${product.productPrice}</td>
                                    <td>${product.productStock}</td>
                                    <td>${(product.productDescription)!''}</td>
                                    <td>${product.categoryType}</td>
                                    <td>${product.createTime}</td>
                                    <td>${product.updateTime}</td>
                                    <td>
                                        <a href="/sell/seller/product/index?productId=${product.productId}">修改</a>
                                    </td>
                                    <td>
                                        <#if product.productStatus == 1>
                                            <a href="/sell/seller/product/off_sale?productId=${product.productId}">下架</a>
                                        <#else>
                                            <a href="/sell/seller/product/on_sale?productId=${product.productId}">上架</a>
                                        </#if>
                                    </td>
                                </tr>
                                </#list>

                                </tbody>
                            </table>
                        </div>

                        <div class="col-md-12 column">
                            <ul class="pagination pull-right">

                            <#if currentPage lte 1>
                                <li class="disabled"><a href="#">上一页</a></li>
                            <#else>
                                <li><a href="/sell/seller/product/list?page=${currentPage-1}&size=${productInfos.size}">上一页</a></li>
                            </#if>

                            <#list 1..productInfos.totalPages as index>
                                <#if currentPage == index>
                                    <li class="disabled"><a href="#" >${index}</a></li>
                                <#elseif index gte 3 && index lte productInfos.totalPages - 2>
                                    <#if index == 3 || index == productInfos.totalPages - 2>
                                        <li class="disabled"><a href="#" >...</a></li>
                                    </#if>
                                <#else>
                                    <li><a href="/sell/seller/product/list?page=${index}&size=${productInfos.size}" >${index}</a></li>
                                </#if>
                            </#list>

                            <#if currentPage gte productInfos.totalPages>
                                <li class="disabled"><a href="#">下一页</a></li>
                            <#else>
                                <li><a href="/sell/seller/product/list?page=${currentPage+1}&size=${productInfos.size}">下一页</a></li>
                            </#if>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    </body>

</html>