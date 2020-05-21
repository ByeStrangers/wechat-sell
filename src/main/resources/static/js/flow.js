$(function () {
    canvasFlowObj.init();
    canvasFlowObj.renderFlow();
});

var canvasFlowObj = {
    height: 0,
    width: 0,
    ctx: null,
    init: function () {
        var canvas = $("#flow");
        canvasFlowObj.height = canvas[0].offsetHeight;
        canvasFlowObj.width = canvas[0].offsetWidth;
        canvas.attr("width", canvasFlowObj.width + "px"); //设置画布的宽度，不能通过样式指定，不然实际宽度和绘制操作里面的坐标点不匹配
        canvas.attr("height", canvasFlowObj.height + "px"); //设置画布的高度，不能通过样式指定，不然实际宽度和绘制操作里面的坐标点不匹配
        canvasFlowObj.ctx = canvas[0].getContext("2d");
    },
    drawFont:function (fontFamily, text, textX, textY, color) {
        fontFamily = fontFamily || "9pt Arial";
        canvasFlowObj.ctx.beginPath();
        canvasFlowObj.ctx.font = fontFamily;
        canvasFlowObj.ctx.fillStyle = color;
        canvasFlowObj.ctx.fillText(text, textX, textY);
        canvasFlowObj.ctx.stroke();
        canvasFlowObj.ctx.closePath();
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
        headlen = headlen || 10;
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
    drawNode:function (x, y, width, height, lineWidth, borderColor, backColor) {
        lineWidth = lineWidth || "1";
        borderColor = borderColor || "#000";
        backColor = backColor || "#fff";
        canvasFlowObj.ctx.beginPath();
        canvasFlowObj.ctx.fillStyle = backColor;//背景颜色
        canvasFlowObj.ctx.lineWidth = lineWidth;
        canvasFlowObj.ctx.strokeStyle = borderColor;//边框颜色
        canvasFlowObj.ctx.rect(x, y, width, height);
        canvasFlowObj.ctx.stroke();//实际画线条
        canvasFlowObj.ctx.fill();//绘制填充
        canvasFlowObj.ctx.closePath();
    },
    renderFlow:function () {
        canvasFlowObj.drawNode(200, 200, 120, 60, "1", "red");
        canvasFlowObj.drawFont(null, "部长审核", 205, 215, 'red');
        canvasFlowObj.drawFont(null, "审核人：XX", 205, 230, 'red');
        canvasFlowObj.drawArrow('red',320,230, 390, 230);//线条长度70
        canvasFlowObj.drawFont(null, "通过", 330, 225, 'red');
    }
}