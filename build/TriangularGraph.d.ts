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
    /**width of the graph. if not given, the graph will use the width of the container div. */
    width?: number;
    /**height of the graph. uses container height by default */
    height?: number;
    title?: TextOptions;
    subtitle?: TextOptions;
    axis?: AxisOptions;
    data: DataOptions[];
    /**cursor hover tooltip */
    tooltip?: {
        disable?: boolean;
    };
}
/**all types of text */
interface TextOptions {
    disable?: boolean;
    text?: string;
    font?: string;
    fontSize?: number;
    /**font color, use CSS color string here*/
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
export {};
