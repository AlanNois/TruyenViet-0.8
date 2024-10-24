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
//     BadgeColor,
// } from '@paperback/types';
// import { Parser } from './TuTienTruyenParser';
// const DOMAIN = 'https://tutientruyen4.xyz/';
// export const isLastPage = ($: CheerioStatic): boolean => {
//     const current = $('ul.pagination > li.active > a').text();
//     let total = $('ul.pagination > li.PagerSSCCells:last-child').text();
//     if (current) {
//         total = total ?? '';
//         return (+total) === (+current);
//     }
//     return true;
// }
// export const TuTienTruyenInfo: SourceInfo = {
//     version: '1.0.3',
//     name: 'TuTienTruyen',
//     icon: 'icon.png',
//     author: 'AlanNois',
//     authorWebsite: 'https://github.com/AlanNois',
//     description: 'Extension that pulls manga from TuTienTruyen',
//     contentRating: ContentRating.EVERYONE,
//     websiteBaseURL: DOMAIN,
//     sourceTags: [
//         {
//             text: 'Recommended',
//             type: BadgeColor.BLUE
//         },
//         {
//             text: 'Notifications',
//             type: BadgeColor.GREEN
//         }
//     ],
//     intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
// };
// export class TuTienTruyen implements ChapterProviding, MangaProviding, SearchResultsProviding, HomePageSectionsProviding {
//     constructor(private cheerio: CheerioAPI) { }
//     readonly requestManager = App.createRequestManager({
//         requestsPerSecond: 4,
//         requestTimeout: 50000,
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
//     })
//     getMangaShareUrl(mangaId: string): string {
//         return `${DOMAIN}${mangaId}`;
//     }
//     parser = new Parser();
//     private async DOMHTML(url: string): Promise<CheerioStatic> {
//         const request = App.createRequest({
//             url: url,
//             method: 'GET',
//         });
//         const response = await this.requestManager.schedule(request, 1);
//         this.CloudFlareError(response.status);
//         return this.cheerio.load(response.data as string);
//     }
//     async getMangaDetails(mangaId: string): Promise<SourceManga> {
//         const $ = await this.DOMHTML(`${DOMAIN}${mangaId}`);
//         return this.parser.parseMangaDetails($, mangaId, DOMAIN);
//     }
//     async getChapters(mangaId: string): Promise<Chapter[]> {
//         const $ = await this.DOMHTML(`${DOMAIN}${mangaId}`);
//         return this.parser.parseChapterList($);
//     }
//     async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
//         const $ = await this.DOMHTML(`${DOMAIN}${chapterId}`);
//         const pages = this.parser.parseChapterDetails($);
//         return App.createChapterDetails({
//             id: chapterId,
//             mangaId: mangaId,
//             pages: pages,
//         })
//     }
//     async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
//         let page = metadata?.page ?? 1;
//         const search = {
//             genres: '',
//             gender: "",
//             status: "",
//             minchapter: "1",
//             sort: "0"
//         };
//         const tags = query.includedTags?.map(tag => tag.id) ?? [];
//         const genres: string[] = [];
//         for (const value of tags) {
//             if (value.indexOf('.') === -1) {
//                 genres.push(value);
//             } else {
//                 const [key, val] = value.split(".");
//                 switch (key) {
//                     case 'minchapter':
//                         search.minchapter = String(val);
//                         break;
//                     case 'gender':
//                         search.gender = String(val);
//                         break;
//                     case 'sort':
//                         search.sort = String(val);
//                         break;
//                     case 'status':
//                         search.status = String(val);
//                         break;
//                 }
//             }
//         }
//         search.genres = genres.join(",");
//         const url = `${DOMAIN}${query.title ? 'tim-truyen' : 'tim-truyen-nang-cao'}`;
//         const param = encodeURI(`?${query.title ? 'keyword=' + query.title + '&' : ''}genres=${search.genres}&gender=${search.gender}&status=${search.status}&minchapter=${search.minchapter}&sort=${search.sort}&page=${page}`);
//         const $ = await this.DOMHTML(url + param);
//         console.log(url + param)
//         const tiles = this.parser.parseSearchResults($, DOMAIN);
//         metadata = !isLastPage($) ? { page: page + 1 } : undefined;
//         return App.createPagedResults({
//             results: tiles,
//             metadata
//         });
//     }
//     async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
//         const sections: HomeSection[] = [
//             App.createHomeSection({ id: 'featured', title: "Truyện Đề Cử", containsMoreItems: false, type: HomeSectionType.featured }),
//             App.createHomeSection({ id: 'viewest', title: "Truyện Xem Nhiều Nhất", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
//             App.createHomeSection({ id: 'hot', title: "Truyện Hot Nhất", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
//             App.createHomeSection({ id: 'new_updated', title: "Truyện Mới Cập Nhật", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
//             App.createHomeSection({ id: 'new_added', title: "Truyện Mới Thêm Gần Đây", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
//             App.createHomeSection({ id: 'full', title: "Truyện Đã Hoàn Thành", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
//         ];
//         for (const section of sections) {
//             sectionCallback(section);
//             let url: string;
//             switch (section.id) {
//                 case 'featured':
//                     url = `${DOMAIN}`;
//                     break;
//                 case 'viewest':
//                     url = `${DOMAIN}tim-truyen?status=-1&sort=10`;
//                     break;
//                 case 'hot':
//                     url = `${DOMAIN}hot/1`;
//                     break;
//                 case 'new_updated':
//                     url = `${DOMAIN}`;
//                     break;
//                 case 'new_added':
//                     url = `${DOMAIN}tim-truyen?status=-1&sort=15`;
//                     break;
//                 case 'full':
//                     url = `${DOMAIN}tim-truyen/&status=1`;
//                     break;
//                 default:
//                     throw new Error("Invalid homepage section ID");
//             }
//             const $ = await this.DOMHTML(url);
//             switch (section.id) {
//                 case 'featured':
//                     section.items = this.parser.parseFeaturedSection($, DOMAIN);
//                     break;
//                 case 'viewest':
//                     section.items = this.parser.parsePopularSection($, DOMAIN);
//                     break;
//                 case 'hot':
//                     section.items = this.parser.parseHotSection($, DOMAIN);
//                     break;
//                 case 'new_updated':
//                     section.items = this.parser.parseNewUpdatedSection($, DOMAIN);
//                     break;
//                 case 'new_added':
//                     section.items = this.parser.parseNewAddedSection($, DOMAIN);
//                     break;
//                 case 'full':
//                     section.items = this.parser.parseFullSection($, DOMAIN);
//                     break;
//             }
//             sectionCallback(section);
//         }
//     }
//     async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
//         let page: number = metadata?.page ?? 1;
//         let param = "";
//         let url = "";
//         switch (homepageSectionId) {
//             case "viewest":
//                 param = `?status=-1&sort=10&page=${page}`;
//                 url = `${DOMAIN}tim-truyen`;
//                 break;
//             case "hot":
//                 param = `?page=${page}`;
//                 url = `${DOMAIN}hot/hot`;
//                 break;
//             case "new_updated":
//                 param = `?page=${page}`;
//                 url = DOMAIN;
//                 break;
//             case "new_added":
//                 param = `?status=-1&sort=15&page=${page}`;
//                 url = `${DOMAIN}tim-truyen`;
//                 break;
//             case "full":
//                 param = `?page=${page}`;
//                 url = `${DOMAIN}tim-truyen/&status=1`;
//                 break;
//             default:
//                 throw new Error("Requested to getViewMoreItems for a section ID which doesn't exist");
//         }
//         const request = App.createRequest({
//             url,
//             method: 'GET',
//             param,
//         });
//         const response = await this.requestManager.schedule(request, 1);
//         this.CloudFlareError(response.status);
//         const $ = this.cheerio.load(response.data as string);
//         const manga = this.parser.parseViewMoreItems($, DOMAIN);
//         metadata = isLastPage($) ? undefined : { page: page + 1 };
//         return App.createPagedResults({
//             results: manga,
//             metadata
//         });
//     }
//     async getSearchTags(): Promise<TagSection[]> {
//         const url = `${DOMAIN}tim-truyen-nang-cao`;
//         const $ = await this.DOMHTML(url);
//         return this.parser.parseTags($);
//     }
//     async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
//         const updateManga: any = [];
//         const pages = 10;
//         for (let i = 1; i < pages + 1; i++) {
//             let url = `${DOMAIN}?page=${i}`
//             const $ = await this.DOMHTML(url);
//             const updateManga = $('div.item', 'div.row').toArray().map(manga => {
//                 const id = $('figure.clearfix > div.image > a', manga).attr('href')?.split('/').pop();
//                 const time = $("figure.clearfix > figcaption > ul > li.chapter:nth-of-type(1) > i", manga).last().text().trim();
//                 return {
//                     id: id,
//                     time: time
//                 };
//             });
//             updateManga.push(...updateManga);
//         }
//         const returnObject = this.parser.parseUpdatedManga(updateManga, time, ids)
//         mangaUpdatesFoundCallback(App.createMangaUpdates(returnObject))
//     }
//     CloudFlareError(status: number): void {
//         if (status == 503 || status == 403) {
//             throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to home page ${TuTienTruyen.name} source and press the cloud icon.`)
//         }
//     }
//     async getCloudflareBypassRequestAsync() {
//         return App.createRequest({
//             url: DOMAIN,
//             method: 'GET',
//             headers: {
//                 'referer': `${DOMAIN}/`,
//                 'origin': `${DOMAIN}/`,
//                 'user-agent': await this.requestManager.getDefaultUserAgent()
//             }
//         })
//     }
// }

},{}]},{},[1])(1)
});
