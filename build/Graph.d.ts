export default class Graph {
    #private;
    constructor(query: string, options: GraphOptions);
    render(data?: GraphOptions['data']): void;
    private drawTriangleBody;
    private drawAxes;
    private drawTicks;
    private drawAxisTitle;
    private drawPoints;
    private drawTooltipLayer;
}
interface GraphOptions {
    width?: number;
    height?: number;
    axis?: AxisOptions;
    data: DataOptions[];
    tooltip?: {
        disable?: boolean;
    };
}
interface AxisOptions {
    titles?: AxisTitleOptions[];
    ticks?: TickOptions;
}
interface AxisTitleOptions {
    disable?: boolean;
    text?: string;
    fontSize?: number;
}
interface TickOptions {
    disable?: boolean;
    innerLine?: boolean;
    innerLineColor?: string;
}
interface DataOptions {
    type?: 'dot' | 'image';
    title?: string;
    dotSize?: number;
    dotColor?: string;
    imageURL?: string;
    coordinate?: [number, number, number];
}
export declare function getCanvas2DCoord(u: number, v: number, w: number): [number, number];
export {};
