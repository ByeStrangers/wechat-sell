<!DOCTYPE html>
<html lang="zh_CN" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="utf-8"/>
    <title>渲染流程图</title>
    <link href="css/flow.css" rel="stylesheet"  type="text/css"/>
    <script type="text/javascript" src="js/jquery.min.js"></script>
    <script type="text/javascript" src="js/flow.js"></script>
</head>
<body>
    <div class="contentWrap">
        <div class="titleWrap">${title}</div>

        <div class="flowWrap">
            <!--添加节点属性-->
            <div id="nodeWrap" style="border: 1px solid red;width: 300px;height:492px;display: flex;flex-direction: column;">
                <!--标题-->
                <div style="border: 1px solid red;width: 100%;height: 30px;display: flex;justify-content: center;align-items: center;">
                    流程节点配置
                </div>
                <!--配置信息-->
                <div style="border: 1px solid red;width: 100%;flex: 1;">
                    <div style="border: 1px solid red;width:100%;height: 30px;display: flex;align-items: center;">
                        <span>节点类型：</span>
                        <select id="nodeType">
                            <option value="audit">审核节点</option>
                            <option value="gateway">网关节点</option>
                        </select>
                    </div>
                    <div style="border: 1px solid red;width:100%;height: 30px;display: flex;align-items: center;">
                        <span>节点名称：</span>
                        <input id="nodeName" placeholder="请输入节点名称"/>
                    </div>
                    <div style="border: 1px solid red;width:100%;height: 30px;display: flex;align-items: center;">
                        <span>网关节点是：</span>
                        <input id="nodeName1" value="XX审核" placeholder="请输入节点名称"/>
                    </div>
                    <div style="border: 1px solid red;width:100%;height: 30px;display: flex;align-items: center;">
                        <span>网关节点否：</span>
                        <input id="nodeName2" value="XXX审核" placeholder="请输入节点名称"/>
                    </div>
                </div>
                <!--按钮-->
                <div style="border: 1px solid red;height: 30px;display: flex;align-items: center;justify-content: flex-end;padding: 0 15px;">
                    <button onclick="canvasFlowObj.renderFlowForJson();canvasFlowObj.renderFlowEnd();">流程渲染</button>&nbsp;
                    <button onclick="canvasFlowObj.addNode();">添加节点</button>
                </div>
            </div>
            <!--流程图-->
            <div style="border: 1px solid red;width:966px;height: 492px;overflow: auto;">
                <canvas id="flow" height="484" width="962"></canvas>
            </div>
        </div>
    </div>
</body>
</html>