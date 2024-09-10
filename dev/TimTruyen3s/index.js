(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
// import {
//     MangaUpdates,
//     TagSection,
//     SourceManga,
//     Chapter,
//     ChapterDetails,
//     HomeSection,
//     HomeSectionType,
//     SearchRequest,
//     PagedResults,
//     Request,
//     Response,
//     ChapterProviding,
//     MangaProviding,
//     SearchResultsProviding,
//     HomePageSectionsProviding,
//     SourceInfo,
//     ContentRating,
//     SourceIntents,
// } from '@paperback/types';
// import { Parser } from './TimTruyen3sParser';
// const DOMAIN = 'https://timtruyen3ss.com/';
// export const isLastPage = ($: CheerioStatic): boolean => {
//     const current = $('ul > .page-item.active > a').attr('data-page') ?? '';
//     const last = $('ul > .page-item > a').last().attr('data-page');
//     if (last) {
//         return (+last) === (+current);
//     }
//     return true;
// }
// export const TimTruyen3sInfo: SourceInfo = {
//     version: '1.0.0',
//     name: 'TimTruyen3s',
//     icon: 'icon.png',
//     author: 'AlanNois',
//     authorWebsite: 'https://github.com/AlanNois/',
//     description: 'Extension that pulls manga from TimTruyen3s',
//     contentRating: ContentRating.EVERYONE,
//     websiteBaseURL: DOMAIN,
//     intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
// }
// export class TimTruyen3s implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {
//     constructor(private cheerio: CheerioAPI) { }
//     readonly requestManager = App.createRequestManager({
//         requestsPerSecond: 5,
//         requestTimeout: 15000,
//         interceptor: {
//             interceptRequest: async (request: Request): Promise<Request> => {
//                 request.headers = {
//                     ...(request.headers ?? {}),
//                     ...{
//                         'referer': DOMAIN,
//                         'user-agent': await this.requestManager.getDefaultUserAgent(),
//                     }
//                 };
//                 return request;
//             },
//             interceptResponse: async (response: Response): Promise<Response> => {
//                 return response;
//             }
//         }
//     });
//     getMangaShareUrl(mangaId: string): string {
//         return `${DOMAIN}${mangaId}`;
//     }
//     parser = new Parser()
//     private async DOMHTML(url: string): Promise<CheerioStatic> {
//         const request = App.createRequest({
//             url: url,
//             method: 'GET',
//         });
//         const response = await this.requestManager.schedule(request, 2);
//         return this.cheerio.load(response.data as string)
//     }
//     async getMangaDetails(mangaId: string): Promise<SourceManga> {
//         const $ = await this.DOMHTML(`${DOMAIN}${mangaId}`);
//         return this.parser.parseMangaDetails($, mangaId, DOMAIN);
//     }
//     async async getChapters(mangaId: string): Promise<Chapter[]> {
//         const $= await this.DOMHTML(`${DOMAIN}${mangaId}`);
//         return this.parser.parseChapterList($);
//     }
// }

},{}]},{},[1])(1)
});
