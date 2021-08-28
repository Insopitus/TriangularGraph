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
var _Graph_context;
const SIN60 = Math.sin(Math.PI / 3);
const COS60 = Math.cos(Math.PI / 3);
let x = 0, y = 0; //reduce gc
export default class Graph {
    constructor(query, options) {
        var _a, _b;
        _Graph_context.set(this, void 0);
        const width = (_a = options.width) !== null && _a !== void 0 ? _a : 600;
        const height = (_b = options.height) !== null && _b !== void 0 ? _b : 400;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        document.querySelector(query).appendChild(canvas);
        __classPrivateFieldSet(this, _Graph_context, canvas.getContext('2d'), "f");
        const offsetX = 100;
        const offsetY = 0;
        const edgeLength = 600;
        console.time('render');
        this.drawTriangle(edgeLength, offsetX, offsetY);
        this.drawScale(options.scale, edgeLength, offsetX, offsetY);
        this.drawPoints(options.data, edgeLength, offsetX, offsetY);
        console.timeEnd('render');
    }
    drawTriangle(edgeLength, offsetX, offsetY) {
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        ctx.fillStyle = 'white';
        const triangleHeight = edgeLength * SIN60;
        ctx.moveTo(0 + offsetX, triangleHeight + offsetY);
        ctx.lineTo(.5 * edgeLength + offsetX, 0 + offsetY);
        ctx.lineTo(edgeLength + offsetX, triangleHeight + offsetY);
        ctx.lineTo(0 + offsetX, triangleHeight + offsetY);
        ctx.stroke();
        ctx.fill();
    }
    drawScale(option, triangleEdgeLength, offsetX, offsetY) {
        option || (option = {});
        const scaleSize = 10; // 
        if (option.disable)
            return;
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        ctx.strokeStyle = 'black';
        // u axis
        for (let i = 1; i <= 5; i++) {
            const pos = getCanvas2DCoord(.2 * i, 0, 1 - .2 * 1);
            applyTranformation(pos, triangleEdgeLength, [offsetX, offsetY]);
            ctx.moveTo(pos[0], pos[1]);
            ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] + scaleSize * SIN60);
            ctx.stroke();
        }
        // v axis
        for (let i = 1; i <= 5; i++) {
            const pos = getCanvas2DCoord(1 - .2 * i, 0.2 * i, 0);
            applyTranformation(pos, triangleEdgeLength, [offsetX, offsetY]);
            ctx.moveTo(pos[0], pos[1]);
            ctx.lineTo(pos[0] + scaleSize, pos[1]);
            ctx.stroke();
        }
        // w axis
        for (let i = 1; i <= 5; i++) {
            const pos = getCanvas2DCoord(0, 1 - .2 * i, .2 * i);
            applyTranformation(pos, triangleEdgeLength, [offsetX, offsetY]);
            ctx.moveTo(pos[0], pos[1]);
            ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] - scaleSize * SIN60);
            ctx.stroke();
        }
    }
    drawTitle(option, offsetX, offsetY) {
    }
    drawPoints(content, triangleEdgeLength, offsetX, offsetY) {
        if (!content || content.length === 0)
            return;
        let x = 0; //reduce gc
        let y = 0;
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        ctx.strokeStyle = 'dodgerblue';
        for (let point of content) {
            [x, y] = getCanvas2DCoord(...point.coordinate);
            // avoiding using `applyTransformation` to reduce gc
            x *= triangleEdgeLength;
            x += offsetX;
            y *= triangleEdgeLength;
            y += offsetY;
            if (point.type === 'dot') {
                if (point.dotColor)
                    ctx.fillStyle = point.dotColor;
                const dotSize = point.dotSize || 5;
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}
_Graph_context = new WeakMap();
// actually, w is ignored. u + v + w should always equal 1
export function getCanvas2DCoord(u, v, w) {
    const x = v * COS60 + u;
    const y = (1 - v) * SIN60; //canvas2d coordinate
    return [x, y];
}
function applyTranformation(position, scale, translate) {
    position[0] *= scale;
    position[1] *= scale;
    position[0] += translate[0];
    position[1] += translate[1];
    return position;
}
