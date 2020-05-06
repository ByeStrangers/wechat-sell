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
                            <form role="form" action="/sell/seller/product/save" method="POST">
                                <div class="form-group">
                                    <label>名称</label><input type="text" class="form-control" name="productName" id="productName" value="${(productInfo.productName)!''}"/>
                                </div>
                                <div class="form-group">
                                    <label>价格</label><input type="text" class="form-control" name="productPrice" id="productPrice" value="${(productInfo.productPrice)!''}"/>
                                </div>
                                <div class="form-group">
                                    <label>库存</label><input  type="text" class="form-control" name="productStock" id="productStock" value="${(productInfo.productStock)!''}"/>
                                </div>
                                <div class="form-group">
                                    <label>描述</label><input type="text" class="form-control" name="productDescription" id="productDescription" value="${(productInfo.productDescription)!''}"/>
                                </div>
                                <div class="form-group">
                                    <img width="100" height="100" src="${(productInfo.productIcon)!''}" alt="">
                                    <label>图片</label><input type="text" class="form-control" name="productIcon" id="productIcon" value="${(productInfo.productIcon)!''}"/>
                                </div>
                                <div class="form-group">
                                    <label>类目</label>
                                    <select class="form-control" name="categoryType">
                                        <#list categories as category>
                                            <option value="${category.categoryType}"
                                                    <#if (productInfo.categoryType)?? && productInfo.categoryType==category.categoryType>selected</#if>
                                            >${category.categoryName}</option>
                                        </#list>
                                    </select>
                                </div>

                                <input hidden name="productId" value="${(productInfo.productId)!''}">

                                <button type="submit" class="btn btn-default">Submit</button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>

        </div>

    </body>
<script>
    console.info('${productInfo.productStock}')
</script>
</html>