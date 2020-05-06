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
                    <form role="form" action="/sell/seller/category/save" method="POST">
                        <div class="form-group">
                            <label>名称</label><input type="text" class="form-control" name="categoryName" id="productName" value="${(category.categoryName)!''}"/>
                        </div>
                        <div class="form-group">
                            <label>类别</label><input type="text" class="form-control" name="categoryType" id="productPrice" value="${(category.categoryType)!''}"/>
                        </div>
                        <input hidden name="productId" value="${(category.categoryId)!''}">

                        <button type="submit" class="btn btn-default">Submit</button>
                    </form>
                </div>

            </div>
        </div>
    </div>

</div>

</body>

</html>