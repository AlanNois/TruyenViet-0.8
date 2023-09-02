import {
    Chapter,
    SourceManga,
    Tag,
    MangaUpdates,
    PartialSourceManga
} from '@paperback/types'

const entities = require("entities");

export class Parser {

    parseMangaDetails($: CheerioStatic, mangaId: string): SourceManga {
        const tags: Tag[] = [];

        $('.kind a').each((_: any, obj: any) => {
            const label = $(obj).text().trim();
            const id = $(obj).attr('href')?.split('/').pop() ?? label;
            tags.push(App.createTag({ label, id }));
        });

        const titles = [this.decodeHTMLEntity($('.title-detail').text().trim())];
        const author = this.decodeHTMLEntity($('.author p').last().text().trim());
        const artist = this.decodeHTMLEntity($('.author p').last().text().trim());
        const desc = $('#summary').text();
        const image = encodeURI($('.col-image img').attr('data-src')?.replace('http://', 'https://') ?? "");
        const status = $('.status p').last().text().trim();

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
        })
    };

    parseChapterList($: CheerioStatic, mangaId: string): Chapter[] {
        const chapters: Chapter[] = [];

        $('ul .row:not(.heading)').each((_, obj) => {
            const ids = String($('a', obj).first().attr('href'));
            const id = ids.replace(String(ids.match(/chapter-\d+/)), String(mangaId.split('/')[mangaId.split('/').length - 1]).split('-').slice(0, -1).join('-'));
            const chapNum = parseFloat(String($('a', obj).first().text()?.split(' ')[1]));
            let name = $('a', obj).first().text().trim();
            if ($('.coin-unlock', obj).attr('title')) {
                name = 'LOCKED (' + $('.coin-unlock', obj).attr('title') + ')';
            }
            const time = $('.col-xs-4', obj).text().trim();
            const timeFinal = this.convertTime(this.decodeHTMLEntity(time))
            chapters.push(App.createChapter({
                id: id.split('/').slice(-4).join('/'),
                chapNum: chapNum,
                name,
                langCode: '🇻🇳',
                time: timeFinal,
            }));
        });
        return chapters;
    }

    parseChapterDetails($: CheerioStatic): string[] {
        const pages: string[] = $('.reading-detail img').map((_, element) => {
            const image = $(element).attr('src');
            return encodeURI(String(image?.replace('http://', 'https://')));
        }).get();

        return pages
    }

    parseSearchResults($: CheerioStatic): PartialSourceManga[] {
        const manga: PartialSourceManga[] = [];
        $('.row .item').each((_, element) => {
            const title = $('h3 > a', element).text().trim();
            const image = $('.image img', element).attr("src") ?? "";
            const id = $('h3 > a', element).attr('href')?.split('/').slice(-2).join('/');
            const chapter = $("ul .chapter > a", element).first().text().trim().replace('Chapter ', 'Ch.') + ' | ' + $("ul .chapter > i", element).first().text().trim();
            manga.push(App.createPartialSourceManga({
                mangaId: String(id),
                image: encodeURI(this.decodeHTMLEntity(image?.replace('http://', 'https://'))),
                title: this.decodeHTMLEntity(title),
                subtitle: chapter,
            }));
        });
        return manga;
    }

    parseFeaturedSection($: CheerioStatic): PartialSourceManga[] {
        let featuredItems: PartialSourceManga[] = [];
        featuredItems = $('.items-slide .item').map((_, element) => {
            const title = $('.slide-caption h3', element).text().trim();
            const image = $('a img', element).attr("src");
            const id = $('a', element).attr('href')?.split('/').slice(-2).join('/');
            const subtitle = $(".slide-caption > a", element).first().text().trim() + ' | ' + $(".time", element).first().text().trim();
            return App.createPartialSourceManga({
                mangaId: String(id),
                image: encodeURI(this.decodeHTMLEntity(String(image?.replace('http://', 'https://')))),
                title: this.decodeHTMLEntity(title),
                subtitle: this.decodeHTMLEntity(subtitle),
            });
        }).get();
        return featuredItems;
    }

    parseNewUpdatedSection($: CheerioStatic): PartialSourceManga[] {
        const newUpdatedItems: PartialSourceManga[] = $('.row .item').map((_, element) => {
            const title = $('h3 > a', element).text().trim();
            const image = $('.image img', element).attr("src");
            const id = $('h3 > a', element).attr('href')?.split('/').slice(-2).join('/');
            const subtitle = $("ul .chapter > a", element).first().text().trim().replace('Chapter ', 'Ch.') + ' | ' + $("ul .chapter > i", element).first().text().trim();
            return App.createPartialSourceManga({
                mangaId: String(id),
                image: encodeURI(this.decodeHTMLEntity(String(image?.replace('http://', 'https://')))),
                title: this.decodeHTMLEntity(title),
                subtitle: this.decodeHTMLEntity(subtitle),
            });
        }).get();
        return newUpdatedItems;
    }

    parseTransSection($: CheerioStatic): PartialSourceManga[] {
        const transItems: PartialSourceManga[] = $('.row .item').map((_, element) => {
            const title = $('h3 > a', element).text().trim();
            const image = $('.image img', element).attr("src");
            const id = $('h3 > a', element).attr('href')?.split('/').slice(-2).join('/');
            const subtitle = $("ul .chapter > a", element).first().text().trim().replace('Chapter ', 'Ch.') + ' | ' + $("ul .chapter > i", element).first().text().trim();
            return App.createPartialSourceManga({
                mangaId: String(id),
                image: encodeURI(this.decodeHTMLEntity(String(image?.replace('http://', 'https://')))),
                title: this.decodeHTMLEntity(title),
                subtitle: this.decodeHTMLEntity(subtitle),
            });
        }).get();
        return transItems;
    }

    parseViewMore($: CheerioStatic): PartialSourceManga[] {
        const manga: PartialSourceManga[] = [];
        $('.row .item').each((_, element) => {
            const title = $('h3 > a', element).text().trim();
            const image = $('.image img', element).attr("src") ?? "";
            const id = $('h3 > a', element).attr('href')?.split('/').slice(-2).join('/');
            const chapter = $("ul .chapter > a", element).first().text().trim().replace('Chapter ', 'Ch.') + ' | ' + $("ul .chapter > i", element).first().text().trim();
            manga.push(App.createPartialSourceManga({
                mangaId: String(id),
                image: encodeURI(this.decodeHTMLEntity(image?.replace('http://', 'https://'))),
                title: title,
                subtitle: chapter,
            }));
        });
        return manga;
    }

    parseUpdatedManga(updateManga: any, time: Date, ids: string[]): MangaUpdates {
        const returnObject: MangaUpdates = {
            ids: []
        };

        for (const elem of updateManga) {
            if (ids.includes(elem.id) && time < this.convertTime(elem.time)) {
                returnObject.ids.push(elem.id);
            }
        }

        return returnObject;
    }

    decodeHTMLEntity = (str: string): string => {
        return entities.decodeHTML(str);
    };

    private convertTime(timeAgo: string): Date {
        let time: Date;
        let trimmed: number = Number((/\d*/.exec(timeAgo) ?? [])[0]);
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
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
            if (timeAgo.includes(":")) {
                const split = timeAgo.split(' ');
                const H = split[0];
                const D = split[1];
                const fixD = String(D).split('/');
                const finalD = fixD[1] + '/' + fixD[0] + '/' + new Date().getFullYear();
                time = new Date(finalD + ' ' + H);
            } else {
                const split = timeAgo.split('/');
                time = new Date(split[1] + '/' + split[0] + '/' + '20' + split[2]);
            }
        }
        return time;
    }
}