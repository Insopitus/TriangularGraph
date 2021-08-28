export default class Graph {
    #private;
    constructor(query: string, options: GraphOptions);
    private drawTriangle;
    private drawScale;
    private drawTitle;
    private drawPoints;
}
interface GraphOptions {
    width?: number;
    height?: number;
    clockwise?: boolean;
    title?: TitleOptions[];
    scale?: ScaleOptions;
    data: DataOptions[];
}
interface TitleOptions {
    disable?: boolean;
    text?: string;
    fontSize?: number;
}
interface ScaleOptions {
    disable?: boolean;
    innerLine?: boolean;
    innerLineColor?: string;
}
interface DataOptions {
    type?: 'dot' | 'image';
    dotSize?: number;
    dotColor?: string;
    imageURL?: string;
    coordinate: [number, number, number];
}
export declare function getCanvas2DCoord(u: number, v: number, w: number): [number, number];
export {};
