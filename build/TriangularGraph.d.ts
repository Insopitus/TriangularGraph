export default class Graph {
    #private;
    data: Partial<DataForSearch>[];
    get domElement(): HTMLDivElement;
    constructor(query: string, options: GraphOptions);
    render(data?: GraphOptions['data']): void;
    private calcLayout;
    private drawTitles;
    private drawTriangleBody;
    private drawAxes;
    private drawTicks;
    private drawAxisTitle;
    private drawDataSet;
    private drawTooltipLayer;
    destroy(): void;
}
interface GraphOptions {
    width?: number;
    height?: number;
    title?: TextOptions;
    subtitle?: TextOptions;
    axis?: AxisOptions;
    data: DataOptions[];
    tooltip?: {
        disable?: boolean;
    };
}
interface TextOptions {
    disable?: boolean;
    text?: string;
    font?: string;
    fontSize?: number;
    color?: string;
}
interface AxisOptions {
    titles?: TextOptions[];
    ticks?: TickOptions;
}
interface TickOptions {
    disable?: boolean;
    disableInnerLine?: boolean;
    innerLineColor?: string;
}
interface DataOptions {
    type?: 'dot' | 'image';
    title?: string;
    dotSize?: number;
    dotColor?: string;
    imageURL?: string;
    imageSize?: number;
    coordinate?: [number, number, number];
}
interface DataForSearch extends DataOptions {
    xyCoord: [number, number];
    squareRadius: number;
    uAxisCoord: [number, number];
    vAxisCoord: [number, number];
    wAxisCoord: [number, number];
    image: ImageBitmap;
}
export declare function getCanvas2DCoord(u: number, v: number, w: number): [number, number];
export {};
