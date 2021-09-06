var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Graph_domElement, _Graph_context, _Graph_options, _Graph_offset, _Graph_data, _Graph_enableTooltip, _Graph_imageCache, _Graph_edgeLength;
const SIN60 = Math.sin(Math.PI / 3);
const COS60 = Math.cos(Math.PI / 3);
const TAN60 = SIN60 / COS60;
export default class Graph {
    constructor(query, options) {
        var _a;
        _Graph_domElement.set(this, void 0);
        _Graph_context.set(this, void 0);
        _Graph_options.set(this, void 0);
        _Graph_offset.set(this, void 0);
        _Graph_data.set(this, void 0);
        _Graph_enableTooltip.set(this, false);
        _Graph_imageCache.set(this, void 0); // if the data uses image instead of dots
        _Graph_edgeLength.set(this, void 0);
        if (!options)
            throw 'options are needed.';
        __classPrivateFieldSet(this, _Graph_options, options, "f");
        const width = options.width || 600;
        const height = options.height || 400;
        const container = document.querySelector(query);
        if (!container)
            throw `The elment ${query} cannot be found.`;
        __classPrivateFieldSet(this, _Graph_domElement, document.createElement('div'), "f");
        __classPrivateFieldGet(this, _Graph_domElement, "f").className = 'graph-container';
        Object.assign(__classPrivateFieldGet(this, _Graph_domElement, "f").style, {
            height: height + 'px',
            width: width + 'px',
            position: 'relative'
        });
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.position = 'absolute';
        container.appendChild(__classPrivateFieldGet(this, _Graph_domElement, "f"));
        __classPrivateFieldGet(this, _Graph_domElement, "f").appendChild(canvas);
        const context = canvas.getContext('2d', { alpha: false });
        // background color
        context.fillStyle = 'gray';
        context.fillRect(0, 0, width, height);
        const offsetX = 200;
        const offsetY = 100;
        __classPrivateFieldSet(this, _Graph_offset, [offsetX, offsetY], "f");
        __classPrivateFieldSet(this, _Graph_edgeLength, 600, "f");
        context.translate(offsetX, offsetY); // use global tranlate instead of offset in every single path
        __classPrivateFieldSet(this, _Graph_context, context, "f");
        __classPrivateFieldSet(this, _Graph_enableTooltip, !((_a = options.tooltip) === null || _a === void 0 ? void 0 : _a.disable), "f");
        this.render(options.data);
    }
    render(data) {
        data || (data = __classPrivateFieldGet(this, _Graph_options, "f").data);
        const t1 = performance.now();
        this.drawTriangleBody();
        this.drawAxes(__classPrivateFieldGet(this, _Graph_options, "f").axis);
        this.drawPoints(data);
        this.drawTooltipLayer(__classPrivateFieldGet(this, _Graph_options, "f").tooltip);
        console.debug(`Rendering ${data.length} points took ${performance.now() - t1} ms.`);
    }
    drawTriangleBody() {
        const edgeLength = __classPrivateFieldGet(this, _Graph_edgeLength, "f");
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        ctx.fillStyle = 'white';
        const triangleHeight = edgeLength * SIN60;
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.moveTo(0, triangleHeight);
        ctx.lineTo(.5 * edgeLength, 0);
        ctx.lineTo(edgeLength, triangleHeight);
        ctx.lineTo(0, triangleHeight);
        ctx.stroke();
        ctx.fill();
    }
    drawAxes(options) {
        options || (options = {});
        this.drawTicks(options.ticks);
        this.drawAxisTitle(options.titles);
    }
    drawTicks(option) {
        option || (option = {});
        const scaleSize = 10; // length of scale line
        const textMargin = 24; // distance between triangle edge and scale text
        if (option.disable)
            return;
        const triangleEdgeLength = __classPrivateFieldGet(this, _Graph_edgeLength, "f");
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        // u axis
        for (let i = 1; i <= 5; i++) {
            ctx.strokeStyle = 'black';
            const pos = getCanvas2DCoord(.2 * i, 0, 1 - .2 * 1);
            applyTranformation(pos, triangleEdgeLength);
            ctx.beginPath();
            ctx.moveTo(pos[0], pos[1]);
            ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] + scaleSize * SIN60);
            ctx.stroke();
            ctx.fillText(`${.2 * 100 * i}%`, pos[0] - textMargin * COS60, pos[1] + textMargin * SIN60);
            if (option.innerLine) {
                ctx.beginPath();
                ctx.moveTo(...pos);
                const pos2 = getCanvas2DCoord(.2 * i, 1 - .2 * i, 0);
                applyTranformation(pos2, triangleEdgeLength);
                ctx.strokeStyle = option.innerLineColor || '#ffffff0f';
                ctx.lineTo(...pos2);
                ctx.stroke();
            }
        }
        // v axis
        for (let i = 1; i <= 5; i++) {
            ctx.strokeStyle = 'black';
            const pos = getCanvas2DCoord(1 - .2 * i, 0.2 * i, 0);
            applyTranformation(pos, triangleEdgeLength);
            ctx.beginPath();
            ctx.moveTo(pos[0], pos[1]);
            ctx.lineTo(pos[0] + scaleSize, pos[1]);
            ctx.stroke();
            ctx.fillText(`${.2 * 100 * i}%`, pos[0] + textMargin, pos[1]);
            if (option.innerLine) {
                ctx.beginPath();
                ctx.moveTo(...pos);
                const pos2 = getCanvas2DCoord(0, 0.2 * i, 1 - .2 * i);
                applyTranformation(pos2, triangleEdgeLength);
                ctx.strokeStyle = option.innerLineColor || '#ffffff0f';
                ctx.lineTo(...pos2);
                ctx.stroke();
            }
        }
        // w axis
        for (let i = 1; i <= 5; i++) {
            ctx.strokeStyle = 'black';
            const pos = getCanvas2DCoord(0, 1 - .2 * i, .2 * i);
            applyTranformation(pos, triangleEdgeLength);
            ctx.beginPath();
            ctx.moveTo(pos[0], pos[1]);
            ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] - scaleSize * SIN60);
            ctx.stroke();
            ctx.fillText(`${.2 * 100 * i}%`, pos[0] - textMargin * COS60, pos[1] - textMargin * SIN60);
            if (option.innerLine) {
                ctx.beginPath();
                ctx.moveTo(...pos);
                const pos2 = getCanvas2DCoord(1 - 0.2 * i, 0, .2 * i);
                applyTranformation(pos2, triangleEdgeLength);
                ctx.strokeStyle = option.innerLineColor || '#ffffff0f';
                ctx.lineTo(...pos2);
                ctx.stroke();
            }
        }
    }
    drawAxisTitle(data) {
        if (!data)
            return;
        const edgeLength = __classPrivateFieldGet(this, _Graph_edgeLength, "f");
        const margin = 60;
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // u axis
        if (!data[0].disable) {
            const pos1 = getCanvas2DCoord(.5, 0, .5);
            applyTranformation(pos1, edgeLength, [0, margin]);
            ctx.beginPath();
            ctx.fillText(data[0].text, ...pos1);
        }
        // v axis
        if (!data[1].disable) {
            const pos2 = getCanvas2DCoord(.5, .5, 0);
            applyTranformation(pos2, edgeLength, [margin, 0]);
            ctx.save();
            ctx.translate(...pos2);
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.fillText(data[1].text, 0, 0);
            ctx.restore();
        }
        // w axis
        if (!data[2].disable) {
            const pos3 = getCanvas2DCoord(0, .5, 0.5);
            applyTranformation(pos3, edgeLength, [-margin, 0]);
            ctx.save();
            ctx.translate(...pos3);
            ctx.beginPath();
            ctx.rotate(-Math.PI / 3);
            ctx.textBaseline = 'middle';
            ctx.fillText(data[2].text, 0, 0);
            ctx.restore();
        }
    }
    drawPoints(content) {
        if (!content || content.length === 0)
            return;
        __classPrivateFieldSet(this, _Graph_data, content, "f");
        const triangleEdgeLength = __classPrivateFieldGet(this, _Graph_edgeLength, "f");
        let point; //reduce gc
        let data;
        // let dotSize = 5
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        const PIx2 = Math.PI * 2;
        ctx.strokeStyle = 'dodgerblue';
        const enableTooltip = __classPrivateFieldGet(this, _Graph_enableTooltip, "f");
        for (var i = 0, l = content.length; i < l; i++) {
            point = content[i];
            data = __classPrivateFieldGet(this, _Graph_data, "f")[i];
            let dotSize = point.dotSize || 5;
            // [x, y] = getCanvas2DCoord(...point.coordinate)
            // boost performance
            let u = point.coordinate[0];
            let v = point.coordinate[1];
            let w = point.coordinate[2];
            let x = v * COS60 + u;
            let y = (1 - v) * SIN60;
            x = Math.trunc(triangleEdgeLength * x);
            y = Math.trunc(triangleEdgeLength * y);
            if (point.type === 'dot') {
                if (point.dotColor)
                    ctx.fillStyle = point.dotColor; // this one takes really long
                if (point.dotSize)
                    dotSize = point.dotSize;
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, PIx2);
                ctx.fill();
            }
            // tooltip
            if (enableTooltip) {
                data.xyCoord = [x, y];
                data.squareRadius = Math.pow(dotSize, 2);
                data.uAxisCoord = [Math.trunc(u * triangleEdgeLength), Math.trunc(SIN60 * triangleEdgeLength)];
                data.vAxisCoord = [Math.trunc((v * COS60 + 1 - v) * triangleEdgeLength), Math.trunc((1 - v) * SIN60 * triangleEdgeLength)];
                data.wAxisCoord = [Math.trunc((1 - w) * COS60 * triangleEdgeLength), Math.trunc(w * SIN60 * triangleEdgeLength)];
            }
        }
    }
    drawTooltipLayer(option) {
        if (!__classPrivateFieldGet(this, _Graph_data, "f"))
            return;
        const edgeLength = __classPrivateFieldGet(this, _Graph_edgeLength, "f");
        const canvas = document.createElement('canvas');
        __classPrivateFieldGet(this, _Graph_domElement, "f").appendChild(canvas);
        Object.assign(canvas.style, {
            position: 'absolute',
            top: '0',
            left: '0'
        });
        canvas.height = __classPrivateFieldGet(this, _Graph_domElement, "f").clientHeight;
        canvas.width = __classPrivateFieldGet(this, _Graph_domElement, "f").clientWidth;
        canvas.addEventListener('mousemove', renderHoverEffect);
        const ctx = canvas.getContext('2d');
        ctx.translate(...__classPrivateFieldGet(this, _Graph_offset, "f"));
        // ctx.fillStyle = '#f00f'
        const mainColor = '#000e';
        ctx.strokeStyle = mainColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const tooltipLineSize = 20;
        let nameFontSize = 13;
        let detailFontSize = 11;
        let gap = 4;
        let verticalPadding = 8; //padding top and bottom of the rectangle
        let horizontalPadding = 12; //padding left and right of the rectangle
        let rectHeight = verticalPadding * 2 + nameFontSize + detailFontSize * 3 + gap * 3; // 
        let rectWidth = 100; // will recalculated later
        const that = this;
        let picked = null;
        function renderHoverEffect(e) {
            requestAnimationFrame(() => {
                var _a, _b, _c, _d, _e;
                const x = e.offsetX - __classPrivateFieldGet(that, _Graph_offset, "f")[0];
                const y = e.offsetY - __classPrivateFieldGet(that, _Graph_offset, "f")[1];
                const item = pick(x, y, __classPrivateFieldGet(that, _Graph_data, "f"));
                //TODO no repainting if cursor is still inside the same dot 
                // if (item === picked) return  //(looks like its bugged)
                ctx.clearRect(-__classPrivateFieldGet(that, _Graph_offset, "f")[0], -__classPrivateFieldGet(that, _Graph_offset, "f")[1], canvas.height + __classPrivateFieldGet(that, _Graph_offset, "f")[0], canvas.width + __classPrivateFieldGet(that, _Graph_offset, "f")[0]);
                if (!item)
                    return;
                picked = item;
                // draw dash lines to axes        
                ctx.setLineDash([8, 4]);
                ctx.beginPath();
                ctx.moveTo(...item.xyCoord);
                ctx.lineTo(...item.uAxisCoord);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(...item.xyCoord);
                ctx.lineTo(...item.vAxisCoord);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(...item.xyCoord);
                ctx.lineTo(...item.wAxisCoord);
                ctx.stroke();
                // a bubble to show the picked item's infomation
                let rectStartX = item.xyCoord[0] + tooltipLineSize * 2;
                let rectStartY = item.xyCoord[1] - tooltipLineSize * TAN60 - rectHeight / 2;
                ctx.beginPath();
                ctx.setLineDash([]);
                ctx.moveTo(...item.xyCoord);
                ctx.lineTo(item.xyCoord[0] + tooltipLineSize, item.xyCoord[1] - tooltipLineSize * TAN60);
                ctx.lineTo(item.xyCoord[0] + tooltipLineSize * 2, item.xyCoord[1] - tooltipLineSize * TAN60);
                ctx.fillStyle = '#fff';
                ctx.fillRect(rectStartX, rectStartY, rectWidth, rectHeight);
                ctx.rect(rectStartX, rectStartY, rectWidth, rectHeight);
                ctx.stroke();
                ctx.fillStyle = '#000';
                ctx.font = `${nameFontSize}px Arial`;
                ctx.fillText(item.title || '', rectStartX + horizontalPadding, rectStartY + verticalPadding);
                const width0 = ctx.measureText(item.title || '').width;
                const axisTitles = (_b = (_a = __classPrivateFieldGet(that, _Graph_options, "f")) === null || _a === void 0 ? void 0 : _a.axis) === null || _b === void 0 ? void 0 : _b.titles;
                ctx.font = `${detailFontSize}px Arial`;
                const text1 = `${((_c = axisTitles === null || axisTitles === void 0 ? void 0 : axisTitles[0]) === null || _c === void 0 ? void 0 : _c.text) || 'U'}: ${(item.coordinate[0] * 100).toFixed(2)}%`;
                ctx.fillText(text1, rectStartX + horizontalPadding, rectStartY + verticalPadding + nameFontSize + gap);
                const width1 = ctx.measureText(text1).width;
                const text2 = `${((_d = axisTitles === null || axisTitles === void 0 ? void 0 : axisTitles[1]) === null || _d === void 0 ? void 0 : _d.text) || 'V'}: ${(item.coordinate[1] * 100).toFixed(2)}%`;
                ctx.fillText(text2, rectStartX + horizontalPadding, rectStartY + verticalPadding + nameFontSize + gap * 2 + detailFontSize);
                const width2 = ctx.measureText(text2).width;
                const text3 = `${((_e = axisTitles === null || axisTitles === void 0 ? void 0 : axisTitles[2]) === null || _e === void 0 ? void 0 : _e.text) || 'W'}: ${(item.coordinate[2] * 100).toFixed(2)}%`;
                ctx.fillText(text3, rectStartX + horizontalPadding, rectStartY + verticalPadding + nameFontSize + gap * 3 + detailFontSize * 2);
                const width3 = ctx.measureText(text3).width;
                // TODO add user defined text rows
                rectWidth = Math.max(width0, width1, width2, width3) + horizontalPadding * 2;
                // repaint the dot to cover the dashed lines
                ctx.beginPath();
                ctx.fillStyle = item.dotColor || mainColor;
                ctx.arc(...item.xyCoord, item.dotSize, 0, Math.PI * 2);
                ctx.fill();
                // a cicle to highlight the dot
                ctx.beginPath();
                ctx.arc(...item.xyCoord, item.dotSize, 0, Math.PI * 2);
                ctx.stroke();
            });
        }
    }
}
_Graph_domElement = new WeakMap(), _Graph_context = new WeakMap(), _Graph_options = new WeakMap(), _Graph_offset = new WeakMap(), _Graph_data = new WeakMap(), _Graph_enableTooltip = new WeakMap(), _Graph_imageCache = new WeakMap(), _Graph_edgeLength = new WeakMap();
function pick(x, y, data) {
    // maybe add a spatial search tree for better performance --- unnessassary, it's much much faster than drawing those amount of points
    // TODO: no early returns, since there would be mutlple points picked at the same place
    // maybe find a list and return the closest
    let point;
    for (let i = 0, l = data.length; i < l; i++) {
        point = data[i];
        const squareDistance = Math.pow((x - point.xyCoord[0]), 2) + Math.pow((y - point.xyCoord[1]), 2);
        if (squareDistance < point.squareRadius) {
            return point;
        }
    }
}
// actually, w is ignored. u + v + w should always equal 1
export function getCanvas2DCoord(u, v, w) {
    const x = v * COS60 + u;
    const y = (1 - v) * SIN60; //canvas2d coordinate
    return [x, y];
}
function applyTranformation(position, scale, translate) {
    position[0] *= scale;
    position[1] *= scale;
    if (!translate)
        return position;
    position[0] += translate[0];
    position[1] += translate[1];
    return position;
}
