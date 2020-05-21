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
            <canvas id="flow"></canvas>
        </div>
    </div>
</body>
</html>