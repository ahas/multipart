import FormData from "form-data";
export interface MultipartOptions {
    plain?: boolean;
    indices?: boolean;
}
export declare function parseValue(value: string): string | number | boolean | RegExp | any[] | Date;
export declare function decode(obj: any): any;
declare const _default: {
    form: (obj: any, options?: MultipartOptions) => FormData;
    encode: (obj: any, options?: MultipartOptions, formData?: FormData, lastKey?: string) => FormData;
    decode: typeof decode;
};
export default _default;
