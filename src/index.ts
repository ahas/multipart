const isUndefined = (value: any) => value === undefined;
const isNull = (value: any) => value === null;
const isBoolean = (value: any) => typeof value === "boolean";
const isNumber = (value: any) => typeof value === "number";
const isString = (value: any) => typeof value === "string";
const isObject = (value: any) => value === Object(value) && !Array.isArray(value);
const isArray = (value: any) => Array.isArray(value);
const isDate = (value: any) => value instanceof Date;
const isBlob = (value: any) =>
  value && typeof value.size === "number" && typeof value.type === "string" && typeof value.slice === "function";
const isFile = (value: any) =>
  isBlob(value) &&
  typeof value.name === "string" &&
  (typeof value.lastModifiedDate === "object" || typeof value.lastModified === "number");
const isFileArray = (value: any) => Array.isArray(value) && value.length && !value.find((x) => !isFile(x));
const isRegex = (value: any) => value instanceof RegExp;

export interface MultipartOptions {
  plain?: boolean;
  indices?: boolean;
}

const form = (formData: FormData, obj: any, options?: MultipartOptions) => {
  return encode(formData, obj, {
    ...options,
    plain: true,
  });
};

const encode = (formData: FormData, obj: any, options?: MultipartOptions, lastKey?: string) => {
  const opts = options || ({} as MultipartOptions);
  opts.indices = isUndefined(opts.indices) ? true : opts.indices;
  opts.plain = isUndefined(opts.plain) ? false : opts.plain;

  if (obj && isObject(obj) && !isFile(obj) && !isBlob(obj)) {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (isArray(value)) {
        while (key.length > 2 && key.lastIndexOf("[]") === key.length - 2) {
          key = key.substring(0, key.length - 2);
        }
      }

      key = lastKey ? lastKey + "[" + key + "]" : key;
      encode(formData, value, options, key);
    });
  } else if (isUndefined(obj)) {
    return formData;
  } else if (lastKey) {
    if (isNull(obj)) {
      if (!opts.plain) {
        formData.append(lastKey, "null;");
      }
    } else if (isBoolean(obj)) {
      formData.append(lastKey, opts.plain ? (!!obj ? "true" : "false") : obj ? "boolean;true" : "boolean;false");
    } else if (isNumber(obj)) {
      formData.append(lastKey, opts.plain ? obj : "number;" + obj);
    } else if (isString(obj)) {
      if (opts.plain) {
        if (!(obj === undefined || obj === null)) {
          formData.append(lastKey, obj);
        }
      } else {
        formData.append(lastKey, "string;" + obj);
      }
    } else if (isFileArray(obj)) {
      for (const file of obj) {
        formData.append(lastKey, file);
      }
    } else if (isArray(obj)) {
      if (obj.length) {
        (obj as any[]).forEach((value, index) => {
          const key = lastKey + "[" + (opts.indices ? index : "") + "]";
          encode(formData, value, options, key);
        });
      } else if (opts.plain) {
        formData.append(lastKey, "[]");
      } else {
        formData.append(lastKey, "array;empty");
      }
    } else if (isDate(obj)) {
      formData.append(lastKey, opts.plain ? obj : "date;" + obj.toString());
    } else if (isRegex(obj)) {
      formData.append(lastKey, opts.plain ? obj.toString() : "regex;" + obj.toString());
    } else {
      formData.append(lastKey, obj);
    }
  }

  return formData;
};

const nullType = "null;";
const trueValue = "boolean;true";
const falseValue = "boolean;false";
const numberType = "number;";
const stringType = "string;";
const dateType = "date;";
const emptyArrayType = "array;empty";
const regexType = "regex;";

export function parseValue(value: string) {
  if (value === nullType) {
    return null;
  } else if (value === trueValue) {
    return true;
  } else if (value === falseValue) {
    return false;
  } else if (value === emptyArrayType) {
    return [] as any[];
  } else if (value.startsWith(numberType)) {
    return Number(value.substring(numberType.length));
  } else if (value.startsWith(stringType)) {
    return String(value.substring(stringType.length));
  } else if (value.startsWith(dateType)) {
    return new Date(value.substring(dateType.length));
  } else if (value.startsWith(regexType)) {
    const str = value.toString();
    const lastSlash = str.lastIndexOf("/");
    if (lastSlash >= 0) {
      const exp = str.substring(1, lastSlash);
      const flags = str.substring(lastSlash + 1);
      return new RegExp(exp, flags);
    }

    return new RegExp("");
  }

  return value;
}

export function decode(obj: any) {
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      decode(obj[key]);
    } else {
      obj[key] = parseValue(obj[key]);
    }
  }
  return obj;
}

export default {
  form,
  encode,
  decode,
};
