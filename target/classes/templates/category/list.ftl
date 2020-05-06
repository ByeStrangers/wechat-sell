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
                            <th>类目id</th>
                            <th>类目名称</th>
                            <th>类目类别</th>
                            <th>创建时间</th>
                            <th>更新时间</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>

                        <#list categories as category>
                        <tr>
                            <td>${category.categoryId}</td>
                            <td>${category.categoryName}</td>
                            <td>${category.categoryType}</td>
                            <td>${category.createTime}</td>
                            <td>${category.updateTime}</td>
                            <td>
                                <a href="/sell/seller/category/index?categoryId=${category.categoryId}">编辑</a>
                            </td>
                        </tr>
                        </#list>

                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

</div>

</body>

</html>