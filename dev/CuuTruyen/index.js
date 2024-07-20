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
//     BadgeColor
// } from '@paperback/types';
// import { createCanvas, loadImage } from 'canvas';
// import { Parser } from './CuuTruyenParser';
// import { cuudrm } from './CuuDrm';
// const DOMAIN = 'https://nettrom.com/';
// export const isLastPage = ($: any): boolean => {
//     const current = $.current_page;
//     const total = $.total_pages;
//     if (current) {
//         return (+total) === (+current);
//     }
//     return true;
// }
// export const CuuTruyenInfo: SourceInfo = {
//     version: '1.0.0',
//     name: 'CuuTruyen',
//     icon: 'icon.png',
//     author: 'AlanNois',
//     authorWebsite: 'https://github.com/AlanNois/',
//     description: 'Extension that pulls manga from CuuTruyen.',
//     contentRating: ContentRating.EVERYONE,
//     websiteBaseURL: DOMAIN,
//     sourceTags: [
//         {
//             text: 'Recomended',
//             type: BadgeColor.BLUE
//         }
//     ],
//     intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
// }
// export class CuuTruyen implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {
//     constructor(private cheerio: CheerioAPI) { }
//     readonly requestManager = App.createRequestManager({
//         requestsPerSecond: 3,
//         requestTimeout: 15000,
//         interceptor: {
//             interceptRequest: async (request: Request): Promise<Request> => {
//                 const fragmentIndex = request.url.indexOf('#');
//                 if (fragmentIndex !== -1) {
//                     const urlWithoutFragment = request.url.substring(0, fragmentIndex);
//                     const fragment = request.url.substring(fragmentIndex + 1);
//                     if (fragment.startsWith('drm_data=')) {
//                         request.drmData = fragment.split('drm_data=')[1]; // Store DRM data in a custom property
//                     }
//                     request.url = urlWithoutFragment; // Remove fragment from the URL
//                 }
//                 request.headers = {
//                     ...(request.headers ?? {}),
//                     ...{
//                         'referer': DOMAIN,
//                         'user-agent': await this.requestManager.getDefaultUserAgent(),
//                     }
//                 };
//                 return request
//             },
//             interceptResponse: async (response: Response): Promise<Response> => {
//                 const request = response.request
//                 if (request.url.includes('drm_data') !== true) {
//                     return response
//                 }
//                 const drmData = request.url.split('#drm_data').pop()?.replace('\n', '');
//                 response.rawData = this.unscrambleImage(response.rawData, drmData)
//                 return response
//             }
//         }
//     });
//     unscrambleImage(rawData: any, drmData : any) {
//         try {
//             const image = loadImage(rawData);
//             const width = image.width;
//             const height = image.height;
//             const canvas = createCanvas(width, height);
//             const ctx = canvas.getContext("2d");
//             const decryptScript = cuudrm.render_image(null, null, drmData)
//             decryptScript.forEach((coordinates: any) => {
//                 const [sx, sy, , sHeight, dx, dy, , dHeight] = coordinates;
//                 // const srcRect = { x: Number(sx), y: Number(sy), width: Number(image.width), height: Number(sHeight) };
//                 // const dstRect = { x: Number(dx), y: Number(dy), width: Number(image.width), height: Number(dHeight) };
//                 ctx.drawImage(image, sx, sy, image.width, sHeight, dx, dy, image.width, dHeight);
//             });
//             const output = canvas.toBuffer("image/jpeg", {
//                 quality: 100
//             })
//             return output
//         } catch (error) {
//             console.error("Error:", error);
//             // Handle errors appropriately (e.g., throw an exception)
//         }
//     }
//     getMangaShareUrl(mangaId: string): string {
//         return `${DOMAIN}${mangaId}`
//     }
//     parser = new Parser()
//     private async getAPI(url: string): Promise<string> {
//         const request = App.createRequest({
//             url,
//             method: 'GET',
//         })
//         const response = await this.requestManager.schedule(request, 2);
//         return response.data as string
//     }
//     async getMangaDetails(mangaId: string): Promise<SourceManga> {
//         const json = JSON.parse(await this.getAPI(`${DOMAIN}api/v2/${mangaId}`));
//         return this.parser.parseMangaDetails(json, mangaId)
//     }
//     async getChapters(mangaId: string): Promise<Chapter[]> {
//         const json = JSON.parse(await this.getAPI(`${DOMAIN}api/v2/${mangaId}`));
//         return this.parser.parseChapterList(json)
//     }
//     async async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
//         const json = JSON.parse(await this.getAPI(`${DOMAIN}api/v2/${chapterId}`));
//         const pages = this.parser.parseChapterDetails(json);
//         return App.createChapterDetails({
//             id: chapterId,
//             mangaId,
//             pages
//         })
//     }
// }

},{}]},{},[1])(1)
});
