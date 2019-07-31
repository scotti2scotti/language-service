/// <reference types="node" />
import { Stream } from 'stream';
export interface LanguageInfo {
    text: string;
    language: {
        language: number;
        languages: string[];
        languageName: string;
        languageCode: string;
        reliable: boolean;
        languageCodeISO639_3: string;
        languageCodes: string[];
    };
    meta: {
        [key: string]: string;
    };
}
export interface ClientOptions {
    protocol: 'http' | 'https';
    host: string;
    port: number;
}
export declare const DefautlOptions: ClientOptions;
export declare class Client {
    private readonly service;
    constructor(options?: ClientOptions);
    readonly url: (url: string) => Promise<LanguageInfo>;
    readonly stream: (stream: Stream) => Promise<LanguageInfo>;
    private callback;
    private readonly path;
}
