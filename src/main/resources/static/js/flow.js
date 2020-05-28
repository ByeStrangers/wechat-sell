$(function () {
    canvasFlowObj.init();
});

var canvasFlowObj = {
    height: 0,
    width: 0,
    rectWidth:120,
    rectHeight:60,
    circleR: 20,
    circleR1: 15,
    gateWrayR: 35,
    lineMinWidth:70,
    nodeList:[],
    ctx: null,
    x:10, //当前x坐标点
    y:0, //当前Y坐标点
    maxY: 0,
    init: function () {
        var canvas = $("#flow");
        canvasFlowObj.height = canvas[0].offsetHeight;
        canvasFlowObj.width = canvas[0].offsetWidth;
        canvasFlowObj.y = canvasFlowObj.height / 2;
        canvas.attr("width", canvasFlowObj.width + "px"); //设置画布的宽度，不能通过样式指定，不然实际宽度和绘制操作里面的坐标点不匹配
        canvas.attr("height", canvasFlowObj.height + "px"); //设置画布的高度，不能通过样式指定，不然实际宽度和绘制操作里面的坐标点不匹配
        canvasFlowObj.ctx = canvas[0].getContext("2d");
    },
    drawFont:function (fontFamily, text, textX, textY, color) {
        fontFamily = fontFamily || "8pt Arial";
        canvasFlowObj.ctx.beginPath();
        canvasFlowObj.ctx.font = fontFamily;
        canvasFlowObj.ctx.fillStyle = color;
        canvasFlowObj.ctx.fillText(text, textX, textY);
        canvasFlowObj.ctx.stroke();
        canvasFlowObj.ctx.closePath();
        canvasFlowObj.ctx.save();
    },
    drawLineFont:function (fontFamily, text, textX, textY, color, gatewayFlag) {
        //如果节点名称大于矩形宽度则换行
        var textWidth = 5;//文字宽度
        var tmpText = "";//文字
        var textRowList = [];//文字分组
        for(var j = 0; j < text.length; j++){
            textWidth += canvasFlowObj.ctx.measureText(text[j]).width;
            if(textWidth > canvasFlowObj.lineMinWidth - 15){
                textRowList.push(tmpText);
                tmpText = text[j];
                textWidth = canvasFlowObj.ctx.measureText(text[j]).width + 5;
            }else {
                tmpText += text[j];
            }
            if(j == text.length - 1){
                textRowList.push(tmpText);
            }
        }
        if(textRowList && textRowList.length > 0){
            //如果是网关的水平线条，由于网关的节点名称可能比较长，所以需要将字体高度调整
            if(gatewayFlag){
                textY -= (textRowList.length - 1) * 2.5;
            }
            $.each(textRowList, function (kk, val) {
                canvasFlowObj.drawFont(null, val, textX, textY + kk * 15, color);//矩形中字体行高15
            });
        }else {
            canvasFlowObj.drawFont(null, text, textX, textY, color);//矩形中字体行高15
        }
    },
    drawRectFont:function (fontFamily, text, textX, textY, color) {
        //如果节点名称大于矩形宽度则换行
        var textWidth = 5;//文字宽度
        var tmpText = "";//文字
        var textRowList = [];//文字分组
        for(var j = 0; j < text.length; j++){
            textWidth += canvasFlowObj.ctx.measureText(text[j]).width;
            if(textWidth > canvasFlowObj.rectWidth){
                textRowList.push(tmpText);
                tmpText = text[j];
                textWidth = canvasFlowObj.ctx.measureText(text[j]).width + 5;
            }else {
                tmpText += text[j];
            }
            if(j == text.length - 1){
                textRowList.push(tmpText);
            }
        }
        if(textRowList && textRowList.length > 0){
            $.each(textRowList, function (kk, val) {
                canvasFlowObj.drawFont(null, val, textX, textY + kk * 15, color);//矩形中字体行高15
            });
        }else {
            canvasFlowObj.drawFont(null, text, textX, textY, color);//矩形中字体行高15
        }
    },
    drawLine:function (color,fromX,fromY,toX,toY,theta,headlen,width) {
        width = width || 1;
        color = color || '#000';
        var newFromX = null;
        var newFromY = null;
        canvasFlowObj.ctx.save();//保存上次绘画记录
        canvasFlowObj.ctx.beginPath();//重新开始绘制
        //如果结束点 在 起始点右下方
        if((fromX < toX && fromY < toY) || (fromX > toX && fromY < toY)){
            canvasFlowObj.ctx.moveTo(fromX, fromY);
            canvasFlowObj.ctx.lineTo(fromX, toY);
            newFromX = fromX;
            newFromY = toY;
        }else if(fromX > toX && fromY > toY){//如果结束点 在 起始点左上方
            canvasFlowObj.ctx.moveTo(fromX, fromY);
            canvasFlowObj.ctx.lineTo(toX, fromY);
            newFromX = toX;
            newFromY = fromY;
        }else if(fromX < toX && fromY > toY){//如果结束点 在 起始点右上方
            canvasFlowObj.ctx.moveTo(fromX, fromY);
            canvasFlowObj.ctx.lineTo(toX, fromY);
            newFromX = toX;
            newFromY = fromY;
        }else {
            newFromX = fromX;
            newFromY = fromY;
        }
        canvasFlowObj.ctx.strokeStyle = color;
        canvasFlowObj.ctx.lineWidth = width;
        canvasFlowObj.ctx.stroke();//实际画线条
        canvasFlowObj.ctx.closePath();
        canvasFlowObj.drawArrow(color,newFromX, newFromY,toX,toY,theta,headlen,width);//取最后一段线条画带箭头的线条
    },
    /**
     * 画箭头线条
     * @param fromX 线条起点X轴
     * @param fromY 线条起点Y轴
     * @param toX 线条终点X轴
     * @param toY 线条终点Y轴
     * @param theta 箭头相当于线条的旋转弧度值，默认30
     * @param headlen 箭头的长度，默认10，相当于三角形斜边，计算点坐标
     * @param width 线条宽度
     * @param color 线条颜色
     */
    drawArrow:function (color,fromX,fromY,toX,toY,theta,headlen,width) {
        theta = theta || 30;
        headlen = headlen || 6;
        width = width || 1;
        color = color || '#000';
        // 计算各角度和对应的P2,P3坐标
        //Math.atan2(y, x) 相当于数学中的tan正切函数，以下为求两点线条角度，此处计算两个点成线的角度负值，这样可以画箭头，因为箭头是form -> to 线条的反方向
        var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI;
        //计算箭头的角度，通过线条正向/逆向旋转theta的角度得出
        var angle1 = (angle + theta) * Math.PI / 180; //再线条角度基础上 + 某个值
        var angle2 = (angle - theta) * Math.PI / 180; //再线条角度基础上 - 某个值, 形成箭头
        var topX = headlen * Math.cos(angle1); //计算上箭头线条的起点x坐标相对于线条终点x坐标的长度，cos = 临边 / 斜边（1）
        var topY = headlen * Math.sin(angle1); //计算上箭头线条的起点y坐标相对于线条终点y坐标的长度，sin = 对边 / 斜边（1）
        var botX = headlen * Math.cos(angle2); //计算下箭头线条的起点x坐标相对于线条终点x坐标的长度，cos = 临边 / 斜边（1）
        var botY = headlen * Math.sin(angle2); //计算下箭头线条的起点y坐标相对于线条终点y坐标的长度，sin = 对边 / 斜边（1）
        canvasFlowObj.ctx.save();//保存上次绘画记录
        canvasFlowObj.ctx.beginPath();//重新开始绘制
        var arrowX = 0;//箭头x,y坐标
        var arrowY = 0;//箭头x,y坐标
        canvasFlowObj.ctx.moveTo(fromX, fromY);
        canvasFlowObj.ctx.lineTo(toX, toY); //画原线条
        arrowX = toX + topX; //计算上箭头的起点x坐标
        arrowY = toY + topY; //计算上箭头的起点y坐标
        canvasFlowObj.ctx.moveTo(arrowX, arrowY);
        canvasFlowObj.ctx.lineTo(toX, toY); //画上箭头
        arrowX = toX + botX; //计算下箭头的起点x坐标
        arrowY = toY + botY; //计算下箭头的起点y坐标
        canvasFlowObj.ctx.lineTo(arrowX, arrowY); //画上箭头
        canvasFlowObj.ctx.strokeStyle = color;
        canvasFlowObj.ctx.lineWidth = width;
        canvasFlowObj.ctx.stroke();//实际画线条
        // canvasFlowObj.ctx.restore();
        canvasFlowObj.ctx.closePath();
    },
    drawCircleNode:function (x, y, r, r1, lineWidth, borderColor) {
        lineWidth = lineWidth || "1";
        borderColor = borderColor || "#000";
        canvasFlowObj.ctx.lineWidth = lineWidth;
        canvasFlowObj.ctx.strokeStyle = borderColor;//边框颜色
        if(r){
            canvasFlowObj.ctx.beginPath();
            canvasFlowObj.ctx.arc(x,y,r,0,2*Math.PI);
            canvasFlowObj.ctx.stroke();//实际画线条
            canvasFlowObj.ctx.closePath();
        }
        if(r1){
            canvasFlowObj.ctx.beginPath();
            canvasFlowObj.ctx.arc(x,y,r1,0,2*Math.PI);
            canvasFlowObj.ctx.stroke();//实际画线条
            canvasFlowObj.ctx.closePath();
        }
    },
    drawRectNode:function (x, y, width, height, lineWidth, borderColor) {
        lineWidth = lineWidth || "1";
        borderColor = borderColor || "#000";
        canvasFlowObj.ctx.beginPath();
        canvasFlowObj.ctx.lineWidth = lineWidth;
        canvasFlowObj.ctx.strokeStyle = borderColor;//边框颜色
        canvasFlowObj.ctx.rect(x, y, width, height);
        canvasFlowObj.ctx.stroke();//实际画线条
        canvasFlowObj.ctx.closePath();
    },
    drawGateWayNode:function (diretionFlag, fromX,fromY, r, width, borderColor) {
        canvasFlowObj.ctx.save();//保存上次绘画记录
        canvasFlowObj.ctx.beginPath();//重新开始绘制
        //此处每个菱形的角度为90度，求出四个点的坐标，按照顺时针
        var arrowX = null;
        var arrowy = null;
        if(diretionFlag == "forward"){
            arrowX = fromX + r / 2;
            arrowy = fromY - r / 2;
            canvasFlowObj.ctx.moveTo(fromX, fromY);
            canvasFlowObj.ctx.lineTo(arrowX, arrowy);
            canvasFlowObj.ctx.moveTo(arrowX, arrowy);
            arrowX = fromX + r;
            arrowy = fromY;
            canvasFlowObj.ctx.lineTo(arrowX, arrowy);
            canvasFlowObj.ctx.moveTo(arrowX, arrowy);
            arrowX = fromX + r / 2;
            arrowy = fromY + r / 2;
            canvasFlowObj.ctx.lineTo(arrowX, arrowy);
            canvasFlowObj.ctx.moveTo(arrowX, arrowy);
            canvasFlowObj.ctx.lineTo(fromX, fromY);
            //画交叉线-开始
            canvasFlowObj.ctx.moveTo(fromX + r / 4, fromY + r / 4);
            canvasFlowObj.ctx.lineTo(fromX + r / 4 * 3, fromY - r / 4);
            canvasFlowObj.ctx.moveTo(fromX + r / 4 * 3, fromY + r / 4);
            canvasFlowObj.ctx.lineTo(fromX + r / 4, fromY - r / 4);
        }else if (diretionFlag == "back") {
            arrowX = fromX - r / 2;
            arrowy = fromY + r / 2;
            canvasFlowObj.ctx.moveTo(fromX, fromY);
            canvasFlowObj.ctx.lineTo(arrowX, arrowy);
            canvasFlowObj.ctx.moveTo(arrowX, arrowy);
            arrowX = fromX - r;
            arrowy = fromY;
            canvasFlowObj.ctx.lineTo(arrowX, arrowy);
            canvasFlowObj.ctx.moveTo(arrowX, arrowy);
            arrowX = fromX - r / 2;
            arrowy = fromY - r / 2;
            canvasFlowObj.ctx.lineTo(arrowX, arrowy);
            canvasFlowObj.ctx.moveTo(arrowX, arrowy);
            canvasFlowObj.ctx.lineTo(fromX, fromY);
            //画交叉线-开始
            canvasFlowObj.ctx.moveTo(fromX - r / 4, fromY - r / 4);
            canvasFlowObj.ctx.lineTo(fromX - r / 4 * 3, fromY + r / 4);
            canvasFlowObj.ctx.moveTo(fromX - r / 4 * 3, fromY - r / 4);
            canvasFlowObj.ctx.lineTo(fromX - r / 4, fromY + r / 4);
        }else if(diretionFlag == "bottom"){
            arrowX = fromX + r / 2;
            arrowy = fromY + r / 2;
            canvasFlowObj.ctx.moveTo(fromX, fromY);
            canvasFlowObj.ctx.lineTo(arrowX, arrowy);
            canvasFlowObj.ctx.moveTo(arrowX, arrowy);
            arrowX = fromX;
            arrowy = fromY + r;
            canvasFlowObj.ctx.lineTo(arrowX, arrowy);
            canvasFlowObj.ctx.moveTo(arrowX, arrowy);
            arrowX = fromX - r / 2;
            arrowy = fromY + r / 2;
            canvasFlowObj.ctx.lineTo(arrowX, arrowy);
            canvasFlowObj.ctx.moveTo(arrowX, arrowy);
            canvasFlowObj.ctx.lineTo(fromX, fromY);
            //画交叉线-开始
            canvasFlowObj.ctx.moveTo(fromX + r / 4, fromY + r / 4);
            canvasFlowObj.ctx.lineTo(fromX - r / 4, fromY + r / 4 * 3);
            canvasFlowObj.ctx.moveTo(fromX - r / 4, fromY + r / 4);
            canvasFlowObj.ctx.lineTo(fromX + r / 4, fromY + r / 4 * 3);
        }
        //画交叉线-结束
        canvasFlowObj.ctx.strokeStyle = borderColor;
        canvasFlowObj.ctx.lineWidth = width;
        canvasFlowObj.ctx.stroke();//实际画线条
        canvasFlowObj.ctx.closePath();
    },
    renderFlow:function () {
        canvasFlowObj.drawFont(null, "开始", 90, 235, 'red');//圆中字符，坐标x = x - 字体宽度/2, 坐标y = y +  5
        canvasFlowObj.drawCircleNode(100, 230, 20, null, 1, "red");
        canvasFlowObj.drawLine('red',120,230, 200, 230);//线条长度70
        canvasFlowObj.drawRectNode(200, 200, 120, 60, "1", "red");//最小宽120 高 60
        canvasFlowObj.drawFont(null, "部长审核", 205, 215, 'red');//矩形中字体行高15
        canvasFlowObj.drawFont(null, "审核人：XX", 205, 230, 'red');
        canvasFlowObj.drawLine('red',320,230, 450, 230);//线条长度 = 字体长度 + 10， 最小70px
        canvasFlowObj.drawFont(null, "通过通过通过通过通过", 330, 225, 'red');
        canvasFlowObj.drawGateWayNode(null,450, 230, 35, 1, "red");
        canvasFlowObj.drawLine('red',485,230, 555, 280);//线条长度 = 字体长度 + 10， 最小70px
        canvasFlowObj.drawLine('red',450 + 35 / 2,230 + 35 / 2, 400, 290);//线条长度 = 字体长度 + 10， 最小70px
        canvasFlowObj.drawLine('red',450 + 35 / 2,230 - 35 / 2, 555, 180);//线条长度 = 字体长度 + 10， 最小70px
    },
    addNode:function () {
        var nodeType = $("#nodeType").val();
        var nodeName = $("#nodeName").val();
        var nodeName1 = $("#nodeName1").val();
        var nodeName2 = $("#nodeName2").val();
        var currentNode = {nodeType: nodeType, nodeName: nodeName};
        if("gateway" == nodeType){
            currentNode.childNodes = [];
            if(nodeName1){
                currentNode.childNodes.push({nodeType: "audit", nodeName: nodeName1, gateFlag: true});
            }
            if(nodeName2){
                currentNode.childNodes.push({nodeType: "audit", nodeName: nodeName2, gateFlag: false});
            }
        }
        canvasFlowObj.nodeList.push(currentNode);

        $("#nodeName").val("");
        // $("#nodeName1").val("");
        // $("#nodeName2").val("");
    },
    renderGateWay:function (flowNode) {
        canvasFlowObj.drawGateWayNode("forward", canvasFlowObj.x, canvasFlowObj.y, canvasFlowObj.gateWrayR, 1, 'block');
        var hLineWidth = canvasFlowObj.lineMinWidth;//水平线条宽度
        var firstNodeLinFont = "(通过)";
        var secondNodeLinFont = "(通过)";
        //如果有子节点，则画垂直线条
        if(flowNode.childNodes && flowNode.childNodes.length > 0){
            //画第一个子节点，放在分支线上
            var firstNode = flowNode.childNodes[0];
            if(firstNode.gateFlag){
                firstNodeLinFont = "(是)";
                secondNodeLinFont = "(否)";
            }else {
                firstNodeLinFont = "(否)";
                secondNodeLinFont = "(是)";
            }

            //画垂直线条
            canvasFlowObj.x += canvasFlowObj.gateWrayR / 2; //默认线条起点X轴为矩形右边中点
            canvasFlowObj.maxY = canvasFlowObj.y + canvasFlowObj.gateWrayR / 2 +  + canvasFlowObj.lineMinWidth;
            canvasFlowObj.drawLine('block',canvasFlowObj.x,canvasFlowObj.y + canvasFlowObj.gateWrayR / 2, canvasFlowObj.x, canvasFlowObj.maxY);//线条长度70
            canvasFlowObj.drawLineFont(null, flowNode.nodeName + firstNodeLinFont, canvasFlowObj.x - 20, canvasFlowObj.y + canvasFlowObj.gateWrayR / 2 + 25, 'block');//线条上的字体：x = 线条x + 10, y = 线条y - 5;

            if(flowNode.childNodes.length > 1){ //如果有两个节点
                canvasFlowObj.renderRect(firstNode, true, canvasFlowObj.x - canvasFlowObj.rectWidth / 2, canvasFlowObj.maxY, true);
            }else {
                canvasFlowObj.renderRect(firstNode, true, canvasFlowObj.x - canvasFlowObj.rectWidth / 2, canvasFlowObj.maxY, false);
                hLineWidth = canvasFlowObj.lineMinWidth * 2;
            }

            //画水平线条
            canvasFlowObj.x += canvasFlowObj.gateWrayR / 2; //默认线条起点X轴为矩形右边中点
        }else {
            //画水平线条
            canvasFlowObj.x += canvasFlowObj.gateWrayR; //默认线条起点X轴为矩形右边中点
        }

        //画第二个分支节点，放在主干线上
        canvasFlowObj.drawLine('block',canvasFlowObj.x,canvasFlowObj.y, canvasFlowObj.x + hLineWidth, canvasFlowObj.y);//线条长度70
        canvasFlowObj.drawLineFont(null, flowNode.nodeName + secondNodeLinFont, canvasFlowObj.x + 10, canvasFlowObj.y - 5, 'block', true);//线条上的字体：x = 线条x + 10, y = 线条y - 5;
        canvasFlowObj.x += hLineWidth;

        if(flowNode.childNodes && flowNode.childNodes.length > 1){
            var secondNode = flowNode.childNodes[1];
            canvasFlowObj.renderRect(secondNode);
        }
    },
    renderRect:function (flowNode, verticalFlag, x, y, twoChildNodeFlag) {
        var width = canvasFlowObj.rectWidth;
        if(!verticalFlag){//画网关垂直线条矩形
            canvasFlowObj.drawRectNode(canvasFlowObj.x, canvasFlowObj.y - canvasFlowObj.rectHeight / 2, width, canvasFlowObj.rectHeight, "1", "block");//最小宽120 高 60
            canvasFlowObj.drawRectFont(null, flowNode.nodeName, canvasFlowObj.x+5, canvasFlowObj.y - canvasFlowObj.rectHeight / 2 + 15, 'block');
            canvasFlowObj.x += width; //默认线条起点X轴为矩形右边中点

            //画线条
            canvasFlowObj.drawLine('block',canvasFlowObj.x,canvasFlowObj.y, canvasFlowObj.x + canvasFlowObj.lineMinWidth, canvasFlowObj.y);//线条长度70
            canvasFlowObj.drawLineFont(null, "(通过)", canvasFlowObj.x + 10, canvasFlowObj.y - 5, 'block');//线条上的字体：x = 线条x + 10, y = 线条y - 5;
            canvasFlowObj.x += canvasFlowObj.lineMinWidth;
        }else {
            canvasFlowObj.drawRectNode(x, y, width, canvasFlowObj.rectHeight, "1", "block");//最小宽120 高 60
            canvasFlowObj.drawRectFont(null, flowNode.nodeName, x+5, y + 15, 'block');
            canvasFlowObj.maxY += canvasFlowObj.rectHeight;

            //画线条，如果有两个子节点，则线条长度更长
            if(twoChildNodeFlag){
                canvasFlowObj.drawLine('block',x + width,canvasFlowObj.maxY - canvasFlowObj.rectHeight / 2, x + width / 2 * 3 + canvasFlowObj.gateWrayR + canvasFlowObj.lineMinWidth, canvasFlowObj.y);//线条长度70
                canvasFlowObj.drawLineFont(null, "(通过)", x + width + 10, canvasFlowObj.maxY - canvasFlowObj.rectHeight / 2 - 5, 'block');//线条上的字体：x = 线条x + 10, y = 线条y - 5;
            }else {
                canvasFlowObj.drawLine('block',x + width,canvasFlowObj.maxY - canvasFlowObj.rectHeight / 2, x + width + canvasFlowObj.lineMinWidth / 2, canvasFlowObj.y);//线条长度70
                canvasFlowObj.drawLineFont(null, "(通过)", x + width + 10, canvasFlowObj.maxY - canvasFlowObj.rectHeight / 2 - 5, 'block');//线条上的字体：x = 线条x + 10, y = 线条y - 5;
            }
        }
    },
    renderFlowForJson:function () {
        //清空画布
        canvasFlowObj.ctx.clearRect(0,0,canvasFlowObj.width,canvasFlowObj.height);
        if(canvasFlowObj.nodeList && canvasFlowObj.nodeList.length > 0){
            //计算开始节点的坐标
            canvasFlowObj.x = 10 + canvasFlowObj.circleR;
            canvasFlowObj.maxY = canvasFlowObj.y;
            //绘制开始节点
            canvasFlowObj.drawCircleNode(canvasFlowObj.x, canvasFlowObj.y, canvasFlowObj.circleR, null, 1, "block");
            canvasFlowObj.drawFont(null, "开始", canvasFlowObj.x - 10, canvasFlowObj.y + 5, 'block');//圆中字符，坐标x = x - 字体宽度/2, 坐标y = y +  5
            canvasFlowObj.drawLine('block',canvasFlowObj.x + canvasFlowObj.circleR ,canvasFlowObj.y, canvasFlowObj.x + canvasFlowObj.circleR + canvasFlowObj.lineMinWidth, canvasFlowObj.y);//线条长度70
            canvasFlowObj.drawFont(null, "开始", canvasFlowObj.x + canvasFlowObj.circleR + 10, canvasFlowObj.y - 5, 'block');//线条上的字体：x = 线条x + 10, y = 线条y - 5;
            canvasFlowObj.x = canvasFlowObj.x + canvasFlowObj.circleR + canvasFlowObj.lineMinWidth;

            //绘制自定义节点
            $.each(canvasFlowObj.nodeList, function (k, flowNode) {
                //当遇到网关时，分支绘制在下方
                if("gateway" == flowNode.nodeType){
                    canvasFlowObj.renderGateWay(flowNode);
                }else {
                    canvasFlowObj.renderRect(flowNode);
                }
            });

            //绘制结束节点
            canvasFlowObj.drawCircleNode(canvasFlowObj.x + canvasFlowObj.circleR , canvasFlowObj.y, canvasFlowObj.circleR, canvasFlowObj.circleR1, 1, "block");
            canvasFlowObj.drawFont(null, "结束", canvasFlowObj.x + canvasFlowObj.circleR - 10, canvasFlowObj.y + 5, 'block');//圆中字符，坐标x = x - 字体宽度/2, 坐标y = y +  5

        }
    },
    renderFlowEnd:function () {
        if((canvasFlowObj.y + canvasFlowObj.rectHeight) > canvasFlowObj.height || (canvasFlowObj.x + canvasFlowObj.circleR) > canvasFlowObj.width || canvasFlowObj.maxY > canvasFlowObj.y){
            if((canvasFlowObj.y + canvasFlowObj.rectHeight) > canvasFlowObj.height){
                canvasFlowObj.height = canvasFlowObj.y + canvasFlowObj.rectHeight;
                $("#flow").attr("height", canvasFlowObj.height + "px"); //设置画布的高度，不能通过样式指定，不然实际宽度和绘制操作里面的坐标点不匹配
            }
            if((canvasFlowObj.x + canvasFlowObj.circleR) > canvasFlowObj.width){
                canvasFlowObj.width = canvasFlowObj.x + canvasFlowObj.circleR * 3;
                $("#flow").attr("width", canvasFlowObj.width + "px"); //设置画布的高度，不能通过样式指定，不然实际宽度和绘制操作里面的坐标点不匹配
            }
            if(canvasFlowObj.maxY > canvasFlowObj.y){
                canvasFlowObj.y = (canvasFlowObj.height - (canvasFlowObj.maxY - canvasFlowObj.y)) / 2 + canvasFlowObj.circleR;
            }
            canvasFlowObj.renderFlowForJson();
        }
    }
}