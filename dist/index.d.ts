export interface MultipartOptions {
    plain?: boolean;
    indices?: boolean;
}
export declare function parseValue(value: string): string | number | boolean | RegExp | any[] | Date;
export declare function decode(obj: any): any;
declare const _default: {
    form: (formData: Partial<FormData>, obj: any, options?: MultipartOptions) => Partial<FormData>;
    encode: (formData: Partial<FormData>, obj: any, options?: MultipartOptions, lastKey?: string) => Partial<FormData>;
    decode: typeof decode;
};
export default _default;
