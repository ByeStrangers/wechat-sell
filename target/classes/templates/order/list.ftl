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
                                    <th>订单id</th>
                                    <th>姓名</th>
                                    <th>手机号</th>
                                    <th>地址</th>
                                    <th>金额</th>
                                    <th>订单状态</th>
                                    <th>支付状态</th>
                                    <th>创建时间</th>
                                    <th colspan="2">操作</th>
                                </tr>
                                </thead>
                                <tbody>

                                <#list orderDTOS.content as order>
                                <tr>
                                    <td>${order.orderId}</td>
                                    <td>${order.buyerName}</td>
                                    <td>${order.buyerPhone}</td>
                                    <td>${order.buyerAddress}</td>
                                    <td>${order.orderAmount}</td>
                                    <td>${order.getPayStatusEnum().msg}</td>
                                    <td>${order.getOrderStatusEnum().msg}</td>
                                    <td>${order.createTime}</td>
                                    <td>
                                        <a href="/sell/seller/order/detail?orderId=${order.orderId}">详情</a>
                                    </td>
                                    <td>
                                        <#if order.orderStatus == 0>
                                            <a href="/sell/seller/order/cancel?orderId=${order.orderId}">取消</a>
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
                                <li><a href="/sell/seller/order/list?page=${currentPage-1}&size=${orderDTOS.size}">上一页</a></li>
                            </#if>

                            <#list 1..orderDTOS.totalPages as index>
                                <#if currentPage == index>
                                    <li class="disabled"><a href="#" >${index}</a></li>
                                <#elseif index gte 3 && index lte orderDTOS.totalPages - 2>
                                    <#if index == 3 || index == orderDTOS.totalPages - 2>
                                        <li class="disabled"><a href="#" >...</a></li>
                                    </#if>
                                <#else>
                                    <li><a href="/sell/seller/order/list?page=${index}&size=${orderDTOS.size}" >${index}</a></li>
                                </#if>
                            </#list>

                            <#if currentPage gte orderDTOS.totalPages>
                                <li class="disabled"><a href="#">下一页</a></li>
                            <#else>
                                <li><a href="/sell/seller/order/list?page=${currentPage+1}&size=${orderDTOS.size}">下一页</a></li>
                            </#if>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    </body>

    <#--弹窗-->
    <div class="modal fade" id="myModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                    <h4 class="modal-title" id="myModalLabel">
                        提醒
                    </h4>
                </div>
                <div class="modal-body">
                    你有新的订单,订单id:<span id="msg_orderId"></span>
                </div>
                <div class="modal-footer">
                    <button onclick="javascript:document.getElementById('notice').pause()" type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                    <button onclick="location.reload()" type="button" class="btn btn-primary">查看新的订单</button>
                </div>
            </div>
        </div>
    </div>

    <#--播放音乐-->
    <audio id="notice" loop="loop">
        <source src="/sell/mp3/song.mp3" type="audio/mpeg" />
    </audio>

    <script src="https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js"></script>
    <script src="https://cdn.bootcss.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    <script>
        var websocket = null;
        if('WebSocket' in window) {
            //判断当前浏览器是否支持websocket
            websocket = new WebSocket('ws://fmx.weixin.gzcstec.com/sell/webSocket')
        }else {
            alert('当前浏览器不支持websocket');
        }


        websocket.onopen = function(event) {
            console.log('建立连接');
        }

        websocket.onclose = function(event) {
            console.log('断开连接');
        }

        websocket.onmessage = function(event) {
            console.log("收到消息" + event.data);
            document.getElementById('notice').play();
            $("#myModal").modal('show');
            $("#msg_orderId").html(event.data);
        }

        websocket.onerror = function() {
            alert('websocket打开失败');
        }

        window.onbeforeunload = function() {
            //关闭websocket
            websocket.close();
        }
    </script>

</html>