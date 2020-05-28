$(function () {
    var canvas = document.getElementById("grid");
    var context = canvas.getContext("2d");
    drawGrid(context,"#88ccc8",0,0);
    canvasFlowObj.ctx = context;
    canvasFlowObj.canvas = canvas;
 /*   var drag = new Drag(oldPosition,area,'steelblue',canvas);
    drag.init();*/
   /* var x,y;
    canvas.addEventListener("mousemove", function(e){
        var sw = canvas.offsetWidth | 0, sh = canvas.offsetHeight | 0;

        if(e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        }else{
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        if(sw) x *= canvas.width / sw;
        if(sh) y *= canvas.height / sh;
        x |= 0;
        y |= 0;

        console.log("Mouse: X-"+x+",Y-"+y);
    },false);*/
});

function drawGrid(context,color,stepx,stepy){
    context.strokeStyle = color;
    context.lineWidth = 0.5;
    for(var i = stepx + 10;i< context.canvas.width; i += 10){
        context.beginPath();
        context.moveTo(i,0);
        context.lineTo(i,context.canvas.height);
        context.stroke();
    }
    for(var i = stepy + 10;i<context.canvas.height;i += 10){
        context.beginPath();
        context.moveTo(0,i);
        context.lineTo(context.canvas.width,i);
        context.stroke();
    }
}


var oldPosition = {'x':100,'y':100};//图形的起始点
var area = {'w' : 50 , 'h' : 50};//绘制图形的宽高

var Drag = function(oldPosition,area,color,canvas){
    this.oldPosition = oldPosition;
    this.area = area;
    this.color = color;
    this.canvas = canvas;
}
Drag.prototype = {
    init : function(){
        this.drawing();
        this.initEvent();
    },
    drawing : function(){
        var ctx = this.canvas.getContext('2d');//得到画笔
        ctx.clearRect(0,0,this.canvas.width,this.canvas.height);//每次绘制前先清除之前绘制的图形
        drawGrid(ctx,"#88ccc8",0,0);
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.oldPosition.x,this.oldPosition.y,this.area.w,this.area.h);
        ctx.closePath();
    },
    window2Canvas : function(x,y){
        var bbox = this.canvas.getBoundingClientRect();
        return {x : x-bbox.left ,y : y-bbox.top}
    },
    isInRect : function(e){
        var position = this.window2Canvas(e.clientX,e.clientY);
        if(position.x < this.oldPosition.x || position.x > this.oldPosition.x+this.area.w){
            return false;
        }
        if(position.y < this.oldPosition.y || position.y > this.oldPosition.y+this.area.h){
            return false;
        }
        return true;
    },
    initEvent : function(){
        var _this = this;
        this.canvas.onmousemove = function(e){_this.cursorMouseMove(e);};
        this.canvas.onmousedown = function(e){_this.mouseDown(e);}
        this.canvas.onmouseup = function(e){_this.mouseUp(e);}
    },
    cursorMouseMove : function(e){//当鼠标移到绘制图形上的时候改变鼠标的状态
        if(this.isInRect(e)){
            this.canvas.style.cursor = 'move';
        }else{
            this.canvas.style.cursor = 'default';
        }
    },
    mouseDown : function(e){//当鼠标按下时调用
        if(this.isInRect(e)){
            var startPosition = this.window2Canvas(e.clientX,e.clientY);

            var startPositionX = startPosition.x - this.oldPosition.x;
            var startPositionY = startPosition.y - this.oldPosition.y;

            var _this = this;
            this.canvas.onmousemove = function(e){//鼠标移动的时候
                var newPosition = _this.window2Canvas(e.clientX,e.clientY);
                _this.oldPosition.x = newPosition.x - startPositionX;
                _this.oldPosition.y = newPosition.y - startPositionY;
                //判断绘制的图形是否超出canvas的边界
                if(_this.oldPosition.x < 0) _this.oldPosition.x = 0;

                if(_this.oldPosition.x + _this.area.w > _this.canvas.width)
                    _this.oldPosition.x = _this.canvas.width - _this.area.w;

                if(_this.oldPosition.y < 0 ) _this.oldPosition.y = 0;

                if(_this.oldPosition.y + _this.area.h > _this.canvas.height)
                    _this.oldPosition.y = _this.canvas.height - _this.area.h;
                //边移动边在新的位置绘制图形
                _this.drawing();
            }
        }
    },
    mouseUp : function(e){//鼠标抬起的时候调用
        var _this = this;
        this.canvas.onmousemove = null;
        this.canvas.onmousemove = function(e){
            _this.cursorMouseMove(e);
        }
    }
}

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
    canvas:null,
    row: 1,//流程图行数
    currentRow: 1, //当前行数
    verticalFlag: false, //当前线条为垂直线条
    x:10, //当前x坐标点
    y:0, //当前Y坐标点
    currentWidth:10,//当前宽度
    drawFont:function (fontFamily, text, textX, textY, color) {
        fontFamily = fontFamily || "8pt Arial";
        var textWidth = canvasFlowObj.ctx.measureText(text).width;
        canvasFlowObj.ctx.beginPath();
        canvasFlowObj.ctx.font = fontFamily;
        canvasFlowObj.ctx.fillStyle = color;
        canvasFlowObj.ctx.fillText(text, textX, textY);
        canvasFlowObj.ctx.stroke();
        canvasFlowObj.ctx.closePath();
        canvasFlowObj.ctx.save();
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
        $.each(textRowList, function (kk, val) {
            canvasFlowObj.drawFont(null, val, textX, textY + kk * 15, 'block');//矩形中字体行高15
        });
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
            canvasFlowObj.ctx.lineTo(fromX, toY);
            newFromX = fromX;
            newFromY = toY;
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
        new Drag({'x':100,'y':100},{'w' : 50 , 'h' : 50},'steelblue',canvasFlowObj.canvas).init();
    },

}