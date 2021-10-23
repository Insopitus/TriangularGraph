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
var _Graph_domElement, _Graph_context, _Graph_options, _Graph_enableTooltip, _Graph_imageCache, _Graph_layout;
const SIN60 = Math.sin(Math.PI / 3);
const COS60 = Math.cos(Math.PI / 3);
const TAN60 = SIN60 / COS60;
export default class Graph {
    // #container:Element
    constructor(query, options) {
        var _a;
        _Graph_domElement.set(this, void 0);
        _Graph_context.set(this, void 0);
        _Graph_options.set(this, void 0);
        _Graph_enableTooltip.set(this, false);
        _Graph_imageCache.set(this, void 0); // if the data uses image instead of dots // TODO use cache instead
        // define the default/calculated sizes and positions of all the entities
        _Graph_layout.set(this, {
            width: 600,
            height: 400,
            offsets: {
                title: [300, 0],
                subtitle: [300, 0],
                triangle: [150, 100],
                axisTitle: 80, // how far the axis titles are away from axes
            },
            fontSizes: {
                title: 24,
                subtitle: 20,
                axisTitle: 24,
                tickText: 12,
                tooltipTitle: 13,
                tooltipDetail: 11,
            },
            sizes: {
                triangle: 300,
                dotSize: 28,
                tickLength: 10,
            }
        });
        if (!options)
            throw 'options are needed.';
        __classPrivateFieldSet(this, _Graph_options, options, "f"); // don't modify the options object, and don't stringify+parse to deep clone it (performance and callback funtion options)
        const layout = __classPrivateFieldGet(this, _Graph_layout, "f");
        const opt = __classPrivateFieldGet(this, _Graph_options, "f");
        layout.width = opt.width || layout.width; // TODO maybe move this to calcLayout method
        layout.height = opt.height || layout.height;
        const container = document.querySelector(query);
        if (!container)
            throw `The elment ${query} cannot be found.`;
        // this.#container = container
        __classPrivateFieldSet(this, _Graph_domElement, document.createElement('div'), "f");
        __classPrivateFieldGet(this, _Graph_domElement, "f").className = 'graph-container';
        Object.assign(__classPrivateFieldGet(this, _Graph_domElement, "f").style, {
            height: layout.height + 'px',
            width: layout.width + 'px',
            position: 'relative'
        });
        const canvas = document.createElement('canvas');
        canvas.width = layout.width;
        canvas.height = layout.height;
        canvas.style.position = 'absolute';
        container.appendChild(__classPrivateFieldGet(this, _Graph_domElement, "f"));
        __classPrivateFieldGet(this, _Graph_domElement, "f").appendChild(canvas);
        const context = canvas.getContext('2d', { alpha: false });
        // background color
        context.fillStyle = 'white';
        context.fillRect(0, 0, layout.width, layout.height);
        __classPrivateFieldSet(this, _Graph_context, context, "f");
        __classPrivateFieldSet(this, _Graph_enableTooltip, !((_a = opt.tooltip) === null || _a === void 0 ? void 0 : _a.disable), "f");
        this.render(opt.data);
    }
    get domElement() {
        return __classPrivateFieldGet(this, _Graph_domElement, "f");
    }
    render(data) {
        data || (data = __classPrivateFieldGet(this, _Graph_options, "f").data);
        // const ctx = this.#context
        // const offsets = this.#layout.offsets
        const t1 = performance.now();
        this.calcLayout();
        this.drawTitles(__classPrivateFieldGet(this, _Graph_options, "f").title, __classPrivateFieldGet(this, _Graph_options, "f").subtitle);
        this.drawTriangleBody();
        this.drawAxes(__classPrivateFieldGet(this, _Graph_options, "f").axis);
        this.drawDataSet(data);
        this.drawTooltipLayer(__classPrivateFieldGet(this, _Graph_options, "f").tooltip);
        console.debug(`Rendering ${data.length} points took ${performance.now() - t1} ms.`);
    }
    // TODO all the default values should be given here to calculate the layout
    calcLayout() {
        var _a, _b;
        const { title, subtitle, axis } = __classPrivateFieldGet(this, _Graph_options, "f");
        const layout = __classPrivateFieldGet(this, _Graph_layout, "f");
        const width = layout.width;
        const height = layout.height;
        const fullSize = Math.min(width, height);
        const titleSize = Math.round(fullSize * .04);
        const subtitleSize = Math.round(titleSize * .75);
        layout.fontSizes.title = (title === null || title === void 0 ? void 0 : title.fontSize) || titleSize;
        layout.fontSizes.subtitle = (subtitle === null || subtitle === void 0 ? void 0 : subtitle.fontSize) || subtitleSize;
        layout.fontSizes.axisTitle = ((_b = (_a = axis === null || axis === void 0 ? void 0 : axis.titles) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.fontSize) || titleSize;
        layout.fontSizes.tickText = Math.round(titleSize / 2);
        const offsets = layout.offsets;
        const margin = Math.round(height / 50);
        let verticalOffset = margin * 4; // extra margin on top
        if (title && !title.disable) {
            offsets.title[0] = Math.round(width / 2);
            offsets.title[1] = verticalOffset;
            verticalOffset += layout.fontSizes.title;
            verticalOffset += margin;
        }
        if (subtitle && !subtitle.disable) {
            offsets.subtitle[0] = Math.round(width / 2);
            offsets.subtitle[1] = verticalOffset;
            verticalOffset += layout.fontSizes.subtitle;
        }
        verticalOffset += margin * 3; // extra margin between title and graph
        const axisTitleSize = layout.fontSizes.axisTitle;
        layout.offsets.axisTitle = 2.8 * axisTitleSize;
        const triangleSideLength = Math.min(height - verticalOffset - 2 * margin - axisTitleSize, width - 2 * axisTitleSize - 4 * margin);
        layout.sizes.triangle = triangleSideLength;
        layout.sizes.tickLength = .02 * triangleSideLength;
        offsets.triangle[0] = Math.round(width / 2 - triangleSideLength / 2);
        offsets.triangle[1] = verticalOffset;
        console.log(__classPrivateFieldGet(this, _Graph_layout, "f"));
    }
    drawTitles(titleOptions, subtitleOptions) {
        if (!titleOptions || titleOptions.disable)
            return;
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        const { offsets, fontSizes } = __classPrivateFieldGet(this, _Graph_layout, "f");
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        // ctx.save()
        if (titleOptions && !titleOptions.disable) {
            ctx.translate(offsets.title[0], offsets.title[1]);
            ctx.fillStyle = titleOptions.color || '#000000';
            const fontSize = fontSizes.title;
            const fontName = titleOptions.font || 'Arial';
            ctx.font = `bold ${fontSize}px ${fontName}`;
            ctx.fillText(titleOptions.text, 0, 0);
            ctx.resetTransform();
        }
        if (subtitleOptions && !subtitleOptions.disable) {
            ctx.translate(offsets.subtitle[0], offsets.subtitle[1]);
            ctx.fillStyle = subtitleOptions.color || '#000';
            const fontSize2 = fontSizes.subtitle;
            const fontName2 = subtitleOptions.font || 'Times New Roman';
            ctx.font = `${fontSize2}px ${fontName2}`;
            ctx.fillText(subtitleOptions.text, 0, 0);
        }
        ctx.resetTransform();
    }
    drawTriangleBody() {
        const sideLength = __classPrivateFieldGet(this, _Graph_layout, "f").sizes.triangle;
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        ctx.fillStyle = '#fdfdfdff';
        const triangleHeight = sideLength * SIN60;
        ctx.translate(__classPrivateFieldGet(this, _Graph_layout, "f").offsets.triangle[0], __classPrivateFieldGet(this, _Graph_layout, "f").offsets.triangle[1]);
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.moveTo(0, triangleHeight);
        ctx.lineTo(Math.round(.5 * sideLength), 0);
        ctx.lineTo(sideLength, triangleHeight);
        ctx.lineTo(0, triangleHeight);
        ctx.stroke();
        ctx.fill();
        ctx.resetTransform();
    }
    drawAxes(options) {
        options || (options = {});
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        ctx.translate(__classPrivateFieldGet(this, _Graph_layout, "f").offsets.triangle[0], __classPrivateFieldGet(this, _Graph_layout, "f").offsets.triangle[1]);
        this.drawTicks(options.ticks);
        this.drawAxisTitle(options.titles);
        ctx.resetTransform();
    }
    drawTicks(option) {
        option || (option = {});
        const layout = __classPrivateFieldGet(this, _Graph_layout, "f");
        const scaleSize = layout.sizes.tickLength; // length of scale line
        const textMargin = 3 * scaleSize; // distance between triangle edge and scale text
        if (option.disable)
            return;
        const triangleSideLength = __classPrivateFieldGet(this, _Graph_layout, "f").sizes.triangle;
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.font = `${layout.fontSizes.tickText}px Arial`;
        const defaultInnerLineColor = '#0f0f0f1f';
        // u axis
        for (let i = 1; i <= 5; i++) {
            ctx.strokeStyle = 'black';
            const pos = getCanvas2DCoord(.2 * i, 0, 1 - .2 * 1);
            applyTranformation(pos, triangleSideLength);
            ctx.beginPath();
            ctx.moveTo(pos[0], pos[1]);
            ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] + scaleSize * SIN60);
            ctx.stroke();
            ctx.fillText(`${.2 * 100 * i}%`, pos[0] - textMargin * COS60, pos[1] + textMargin * SIN60);
            if (!option.disableInnerLine) {
                ctx.beginPath();
                ctx.moveTo(...pos);
                const pos2 = getCanvas2DCoord(.2 * i, 1 - .2 * i, 0);
                applyTranformation(pos2, triangleSideLength);
                ctx.strokeStyle = option.innerLineColor || defaultInnerLineColor;
                ctx.lineTo(...pos2);
                ctx.stroke();
            }
        }
        // v axis
        for (let i = 1; i <= 5; i++) {
            ctx.strokeStyle = 'black';
            const pos = getCanvas2DCoord(1 - .2 * i, 0.2 * i, 0);
            applyTranformation(pos, triangleSideLength);
            ctx.beginPath();
            ctx.moveTo(pos[0], pos[1]);
            ctx.lineTo(pos[0] + scaleSize, pos[1]);
            ctx.stroke();
            ctx.fillText(`${.2 * 100 * i}%`, pos[0] + textMargin, pos[1]);
            if (!option.disableInnerLine) {
                ctx.beginPath();
                ctx.moveTo(...pos);
                const pos2 = getCanvas2DCoord(0, 0.2 * i, 1 - .2 * i);
                applyTranformation(pos2, triangleSideLength);
                ctx.strokeStyle = option.innerLineColor || defaultInnerLineColor;
                ctx.lineTo(...pos2);
                ctx.stroke();
            }
        }
        // w axis
        for (let i = 1; i <= 5; i++) {
            ctx.strokeStyle = 'black';
            const pos = getCanvas2DCoord(0, 1 - .2 * i, .2 * i);
            applyTranformation(pos, triangleSideLength);
            ctx.beginPath();
            ctx.moveTo(pos[0], pos[1]);
            ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] - scaleSize * SIN60);
            ctx.stroke();
            ctx.fillText(`${.2 * 100 * i}%`, pos[0] - textMargin * COS60, pos[1] - textMargin * SIN60);
            if (!option.disableInnerLine) {
                ctx.beginPath();
                ctx.moveTo(...pos);
                const pos2 = getCanvas2DCoord(1 - 0.2 * i, 0, .2 * i);
                applyTranformation(pos2, triangleSideLength);
                ctx.strokeStyle = option.innerLineColor || defaultInnerLineColor;
                ctx.lineTo(...pos2);
                ctx.stroke();
            }
        }
    }
    drawAxisTitle(data) {
        if (!data)
            return;
        const sideLength = __classPrivateFieldGet(this, _Graph_layout, "f").sizes.triangle;
        const margin = __classPrivateFieldGet(this, _Graph_layout, "f").offsets.axisTitle;
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        const layout = __classPrivateFieldGet(this, _Graph_layout, "f");
        const defaultFontSize = layout.fontSizes.axisTitle;
        ctx.font = `${defaultFontSize}px Arial`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // u axis
        if (!data[0].disable) {
            if (data[0].fontSize || data[0].font) {
                ctx.font = `${data[0].fontSize || defaultFontSize}px ${data[0].font || 'Arial'}`;
            }
            const pos1 = getCanvas2DCoord(.5, 0, .5);
            applyTranformation(pos1, sideLength, [0, margin]);
            ctx.beginPath();
            ctx.fillText(data[0].text, ...pos1);
        }
        // v axis
        if (!data[1].disable) {
            if (data[1].fontSize || data[1].font) {
                ctx.font = `${data[1].fontSize || defaultFontSize}px ${data[1].font || 'Arial'}`;
            }
            const pos2 = getCanvas2DCoord(.5, .5, 0);
            applyTranformation(pos2, sideLength, [margin, 0]);
            ctx.save();
            ctx.translate(...pos2);
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.fillText(data[1].text, 0, 0);
            ctx.restore();
        }
        // w axis
        if (!data[2].disable) {
            if (data[2].fontSize || data[2].font) {
                ctx.font = `${data[2].fontSize || defaultFontSize}px ${data[2].font || 'Arial'}`;
            }
            const pos3 = getCanvas2DCoord(0, .5, 0.5);
            applyTranformation(pos3, sideLength, [-margin, 0]);
            ctx.save();
            ctx.translate(...pos3);
            ctx.beginPath();
            ctx.rotate(-Math.PI / 3);
            ctx.textBaseline = 'middle';
            ctx.fillText(data[2].text, 0, 0);
            ctx.restore();
        }
    }
    drawDataSet(content) {
        if (!content || content.length === 0)
            return;
        this.data = content;
        const layout = __classPrivateFieldGet(this, _Graph_layout, "f");
        const triangleSideLength = __classPrivateFieldGet(this, _Graph_layout, "f").sizes.triangle;
        let point; //reduce gc
        let data;
        // let dotSize = 5
        const ctx = __classPrivateFieldGet(this, _Graph_context, "f");
        ctx.translate(__classPrivateFieldGet(this, _Graph_layout, "f").offsets.triangle[0], __classPrivateFieldGet(this, _Graph_layout, "f").offsets.triangle[1]);
        const PIx2 = Math.PI * 2;
        ctx.strokeStyle = 'dodgerblue';
        const enableTooltip = __classPrivateFieldGet(this, _Graph_enableTooltip, "f");
        for (let i = 0, l = content.length; i < l; i++) {
            point = content[i];
            data = this.data[i];
            let dotSize = point.dotSize || 5;
            // [x, y] = getCanvas2DCoord(...point.coordinate)
            // boost performance
            let u = point.coordinate[0];
            let v = point.coordinate[1];
            let w = point.coordinate[2];
            let x = v * COS60 + u;
            let y = (1 - v) * SIN60;
            x = Math.round(triangleSideLength * x);
            y = Math.round(triangleSideLength * y);
            const imageSize = point.imageSize || layout.sizes.dotSize;
            if (point.type === 'image' && point.imageURL) {
                const image = new Image();
                image.src = point.imageURL;
                image.onload = () => {
                    createImageBitmap(image, 0, 0, image.width, image.height).then(img => {
                        this.data[i].image = img;
                        ctx.drawImage(img, x - imageSize / 2, y - imageSize / 2, imageSize, imageSize);
                    });
                };
            }
            else {
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
                data.uAxisCoord = [Math.round(u * triangleSideLength), Math.round(SIN60 * triangleSideLength)];
                data.vAxisCoord = [Math.round((v * COS60 + 1 - v) * triangleSideLength), Math.round((1 - v) * SIN60 * triangleSideLength)];
                data.wAxisCoord = [Math.round((1 - w) * COS60 * triangleSideLength), Math.round(w * SIN60 * triangleSideLength)];
            }
        }
        // ctx.resetTransform() //TODO: the async draws make resetTransform imposible, i need a better implementation
    }
    drawTooltipLayer(option) {
        if (!this.data)
            return;
        const canvas = document.createElement('canvas');
        // this.#tooltipCanvas = canvas
        __classPrivateFieldGet(this, _Graph_domElement, "f").appendChild(canvas);
        const layout = __classPrivateFieldGet(this, _Graph_layout, "f");
        Object.assign(canvas.style, {
            position: 'absolute',
            top: '0',
            left: '0'
        });
        canvas.height = layout.height;
        canvas.width = layout.width;
        const tooltipLineSize = 20;
        let nameFontSize = layout.fontSizes.tooltipTitle;
        let detailFontSize = layout.fontSizes.tooltipDetail;
        let gap = 4;
        let verticalPadding = 8; //padding top and bottom of the rectangle
        let horizontalPadding = 12; //padding left and right of the rectangle
        let rectHeight = verticalPadding * 2 + nameFontSize + detailFontSize * 3 + gap * 3; // 
        let rectWidth = 100; // will recalculated later
        let picked = null;
        const offset = __classPrivateFieldGet(this, _Graph_layout, "f").offsets.triangle;
        const renderHoverEffect = (e) => {
            requestAnimationFrame(() => {
                var _a, _b, _c, _d, _e;
                const x = e.offsetX - offset[0];
                const y = e.offsetY - offset[1];
                const item = pick(x, y, this.data);
                //TODO no repainting if cursor is still inside the same dot 
                // if (item === picked) return  //(looks like its bugged)
                ctx.clearRect(-offset[0], -offset[1], canvas.width, canvas.height);
                if (!item)
                    return;
                const imageSize = item.imageSize || layout.sizes.dotSize;
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
                const axisTitles = (_b = (_a = __classPrivateFieldGet(this, _Graph_options, "f")) === null || _a === void 0 ? void 0 : _a.axis) === null || _b === void 0 ? void 0 : _b.titles;
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
                if (item.type === 'image' && item.image) {
                    ctx.drawImage(item.image, item.xyCoord[0] - imageSize / 2, item.xyCoord[1] - imageSize / 2, imageSize, imageSize);
                    // a cicle to highlight the dot
                    ctx.beginPath();
                    ctx.arc(...item.xyCoord, imageSize / 2, 0, Math.PI * 2);
                    ctx.stroke();
                }
                else {
                    // repaint the dot to cover the dashed lines
                    ctx.beginPath();
                    ctx.fillStyle = item.dotColor || mainColor;
                    ctx.arc(...item.xyCoord, item.dotSize, 0, Math.PI * 2);
                    ctx.fill();
                    // a cicle to highlight the dot
                    ctx.beginPath();
                    ctx.arc(...item.xyCoord, item.dotSize, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });
        };
        canvas.addEventListener('mousemove', renderHoverEffect);
        const ctx = canvas.getContext('2d');
        ctx.translate(offset[0], offset[1]);
        // ctx.fillStyle = '#f00f'
        const mainColor = '#000e';
        ctx.strokeStyle = mainColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
    }
    destroy() {
        __classPrivateFieldGet(this, _Graph_domElement, "f").remove();
        // brower will handle the event listeners itself
    }
}
_Graph_domElement = new WeakMap(), _Graph_context = new WeakMap(), _Graph_options = new WeakMap(), _Graph_enableTooltip = new WeakMap(), _Graph_imageCache = new WeakMap(), _Graph_layout = new WeakMap();
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
    const y = (1 - v) * SIN60; //canvas2d coordinate (before mutiply with triangle side length)
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
