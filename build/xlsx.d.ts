declare interface Utils {
	sheet_to_json: (input: any) => any
}
//declare class ReactPivot extends React.Component<any, any> {}
declare module 'xlsx' {
	export function read(data: string, read_opts?: any): any;
	export function readFile(filename: string, read_opts?: any): any;
	export const utils: Utils;
	//export = any;
	//export default ReactPivot;
}
