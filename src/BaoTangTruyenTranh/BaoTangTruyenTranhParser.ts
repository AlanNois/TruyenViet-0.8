import {
    Chapter,
    SourceManga,
    Tag,
    // MangaUpdates,
    PartialSourceManga
} from '@paperback/types';

import * as entities from 'entities';

export class Parser {

    parseMangaDetails($: any, mangaId: string, API: string): SourceManga {
        const tags: Tag[] = [];

        $.genres.map((obj: any) => {
            const label = this.decodeHTMLEntity(obj.trim());
            // const id = $(obj).attr('href')?.split('/').pop() ?? label;
            const id = label;
            tags.push(App.createTag({ label, id }));
        });

        const titles = [this.decodeHTMLEntity($.name.trim())];
        const author = this.decodeHTMLEntity($.author.trim());
        const artist = this.decodeHTMLEntity($.author.trim());
        const desc = this.decodeHTMLEntity($.description.trim());
        const image = encodeURI(`${API}thumbnails/${$.thumbnail}`);
        const status = 'Đang cập nhật';

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles,
                author,
                artist,
                desc,
                image,
                status,
                tags: [App.createTagSection({ id: '0', label: 'tag', tags: tags })]
            })
        });
    }

    parseChapterList($: any): Chapter[] {
        const chapters: Chapter[] = [];

        $.chapters.map((obj: any) => {
            // const ids = String($('a', obj).first().attr('href'));
            // eslint-disable-next-line max-len
            // const id = ids.replace(String(ids.match(/chapter-\d+/)), String(mangaId.split('/')[mangaId.split('/').length - 1]).split('-').slice(0, -1).join('-'));
            const id = obj.slug;
            const chapNum = parseFloat(String(obj.title.split(' ').pop()));
            let name = '';
            if (!obj.is_free) {
                name = 'LOCKED (' + `Only unlock(with ${obj.unlock_cost} point) and read on website` + ')';
            }
            const time = obj.created_at.trim();
            const timeFinal = this.convertTime(this.decodeHTMLEntity(time));
            chapters.push(App.createChapter({
                // id: id.split('/').slice(-4).join('/'),
                id,
                chapNum: chapNum,
                name,
                langCode: '🇻🇳',
                time: timeFinal,
            }));
        });
        console.log(chapters);
        return chapters;
    }

    parseChapterDetails($: any, API: any): string[] {
        const pages: string[] = $.images.map((element: any) => {
            const image = `${API}${element}`;
            return encodeURI(image);
        });

        return pages;
    }

    parseSearchResults($: any, API: string): PartialSourceManga[] {
        const manga: PartialSourceManga[] = [];
        $.data.map((element: any) => {
            const title = element.name.trim();
            const image = `${API}thumbnails/${element.thumbnail}`;
            const id = element.slug;
            const chapter = element.chapters.pop();
            manga.push(App.createPartialSourceManga({
                mangaId: String(id),
                image: encodeURI(this.decodeHTMLEntity(image)),
                title: this.decodeHTMLEntity(title),
                subtitle: chapter,
            }));
        });
        return manga;
    }

    parseFeaturedSection($: any, API: string): PartialSourceManga[] {
        let featuredItems: PartialSourceManga[] = [];
        featuredItems = $.data.map((element: any) => {
            const title = element.comic_name.trim();
            const image = `${API}thumbnails/${element.thumbnail}`;
            const id = element.slug;
            const subtitle = element.latest_chapter ? element.latest_chapter.title.trim() + ' | ' + this.convertTime(element.latest_chapter.created_at) : '';
            return App.createPartialSourceManga({
                mangaId: String(id),
                image: String(image),
                title: this.decodeHTMLEntity(title),
                subtitle: this.decodeHTMLEntity(subtitle),
            });
        });
        return featuredItems;
    }

    parseSection($: any, API: string): PartialSourceManga[] {
        let sectionItems: PartialSourceManga[] = [];
        sectionItems = $.data.map((element: any) => {
            const title = element.name.trim();
            const image = `${API}thumbnails/${element.thumbnail}`;
            const id = element.slug;
            const latest_chapter = element.chapters.pop();
            const subtitle = latest_chapter ? latest_chapter.title.trim() + ' | ' + this.convertTime(latest_chapter.created_at) : '';
            return App.createPartialSourceManga({
                mangaId: String(id),
                image: String(image),
                title: this.decodeHTMLEntity(title),
                subtitle: this.decodeHTMLEntity(subtitle),
            });
        });
        return sectionItems;
    }

    // parseViewMore($: CheerioStatic): PartialSourceManga[] {
    //     const manga: PartialSourceManga[] = [];
    //     $('.row .item').each((_, element) => {
    //         const title = $('h3 > a', element).text().trim();
    //         const image = $('.image img', element).attr("src") ?? "";
    //         const id = $('h3 > a', element).attr('href')?.split('/').slice(-2).join('/');
    // eslint-disable-next-line max-len
    //         const chapter = $("ul .chapter > a", element).first().text().trim().replace('Chapter ', 'Ch.') + ' | ' + $("ul .chapter > i", element).first().text().trim();
    //         manga.push(App.createPartialSourceManga({
    //             mangaId: String(id),
    //             image: encodeURI(this.decodeHTMLEntity(image?.replace('http://', 'https://'))),
    //             title: this.decodeHTMLEntity(title),
    //             subtitle: this.decodeHTMLEntity(chapter),
    //         }));
    //     });
    //     return manga;
    // }

    // parseUpdatedManga(updateManga: any, time: Date, ids: string[]): MangaUpdates {
    //     const returnObject: MangaUpdates = {
    //         ids: []
    //     };

    //     for (const elem of updateManga) {
    //         if (ids.includes(elem.id) && time < this.convertTime(elem.time)) {
    //             returnObject.ids.push(elem.id);
    //         }
    //     }

    //     return returnObject;
    // }

    decodeHTMLEntity = (str: string): string => {
        return entities.decodeHTML(str);
    };

    private convertTime(timeAgo: string): Date {
        // Attempt native parsing first
        const parsed = new Date(timeAgo);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }

        let time: Date;
        let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
        trimmed = (trimmed === 0 && timeAgo.includes('a')) ? 1 : trimmed;

        if (timeAgo.includes('giây')) {
            time = new Date(Date.now() - trimmed * 1000);
        } else if (timeAgo.includes('phút')) {
            time = new Date(Date.now() - trimmed * 60000);
        } else if (timeAgo.includes('giờ')) {
            time = new Date(Date.now() - trimmed * 3600000);
        } else if (timeAgo.includes('ngày')) {
            time = new Date(Date.now() - trimmed * 86400000);
        } else if (timeAgo.includes('tuần')) {
            time = new Date(Date.now() - trimmed * 86400000 * 7);
        } else if (timeAgo.includes('tháng')) {
            time = new Date(Date.now() - trimmed * 86400000 * 7 * 4);
        } else if (timeAgo.includes('năm')) {
            time = new Date(Date.now() - trimmed * 86400000 * 7 * 4 * 12);
        } else {
            // Check if the string is in ISO-like format: "YYYY-MM-DD HH:MM:SS"
            const isoRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
            if (isoRegex.test(timeAgo)) {
                time = new Date(timeAgo);
            } else if (timeAgo.includes(':')) {
                const split = timeAgo.split(' ');
                if (split.length >= 2) {
                    const H = split[0];
                    const D = split[1];
                    const fixD = String(D).split('/');
                    if (fixD.length >= 2) {
                        const finalD = fixD[1] + '/' + fixD[0] + '/' + new Date().getFullYear();
                        time = new Date(finalD + ' ' + H);
                    } else {
                        time = new Date(timeAgo); // fallback attempt
                    }
                } else {
                    time = new Date(timeAgo); // fallback attempt
                }
            } else {
                const split = timeAgo.split('/');
                if (split.length >= 3) {
                    time = new Date(split[1] + '/' + split[0] + '/' + '20' + split[2]);
                } else {
                    time = new Date(timeAgo); // final fallback
                }
            }
        }
        return time;
    }
}