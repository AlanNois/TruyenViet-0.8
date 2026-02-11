import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    PartialSourceManga
} from '@paperback/types';

import * as entities from 'entities'; //Import package for decoding HTML entities

export class Parser {
    protected convertTime(timeAgo: string): Date {
        let time: Date;
        let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
        if (timeAgo.includes('giây') || timeAgo.includes('secs')) {
            time = new Date(Date.now() - trimmed * 1000); // => mili giây (1000 ms = 1s)
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
            time = new Date(Date.now() - trimmed * 31556952000);
        } else {
            if (timeAgo.includes(':')) {
                const split = timeAgo.split(' ');
                const H = split[0]; //vd => 21:08
                const D = split[1]; //vd => 25/08 
                const fixD = String(D).split('/');
                const finalD = fixD[1] + '/' + fixD[0] + '/' + new Date().getFullYear();
                time = new Date(finalD + ' ' + H);
            } else {
                const split = timeAgo.split('-'); //vd => 05/12/18
                time = new Date(split[1] + '/' + split[0] + '/' + split[2]);
            }
        }
        return time;
    }

    parseMangaDetails($: CheerioStatic, mangaId: string, DOMAIN: any): SourceManga {
        const tags: Tag[] = [];

        $('.group-content a').each((_: any, obj: any) => {
            const label = $('span:nth-child(2)', obj).text().trim();
            const id = $(obj).attr('href')?.trim().split('=')[1] ?? label;
            tags.push(App.createTag({ label, id }));
        });

        const titles = [this.decodeHTMLEntity($('.v-card-title').text().trim())];
        let author, artist;
        let status = '';
        $('.information-section > div').each((_: any, obj: any) => {
            switch ($(obj).text().trim().split('\n')[0]) {
                case 'Tác giả:':
                    author = String($(obj).text().split('\n')[1]).trim();
                    artist = String($(obj).text().split('\n')[1]).trim();
                    break;
                case 'Trạng thái:':
                    status = String($(obj).text().split('\n')[1]).trim();
                    break;
            }
        });
        const imageRaw = String(
            $('.v-image > img').attr('src')?.indexOf('https') === -1 ? 
                DOMAIN + $('.v-image > img').attr('src') : $('.v-image > img').attr('src')
        );
        const image = encodeURI(imageRaw).replace(/([^:]\/)\/+/g, '$1');
        const desc = this.decodeHTMLEntity($('.v-card-text.pt-1.px-4.pb-4.text-secondary.font-weight-medium').text());
        const rating = parseFloat($('.pr-3 > b').text().trim());

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles,
                image,
                desc,
                author,
                artist,
                status,
                rating,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags })]
            })
        });
    }

    parseChapterList(json: any): Chapter[] {
        const chapters: Chapter[] = [];

        for (const obj of json.result.chapters) {
            const chapNum = parseFloat(obj.numberChapter);
            const id = `chuong-${chapNum}`;
            const timeStr = obj.stringUpdateTime;
            const time = this.convertTime(timeStr);
            const name = (obj.name != 'N/A') ? obj.name : '';
            const group = `${obj.viewCount} lượt xem`;
            chapters.push(App.createChapter({
                id,
                chapNum,
                name,
                langCode: '🇻🇳',
                time,
                group
            }));
        }

        return chapters;
    }

    parseChapterDetails(json: any, $: any, DOMAIN: any): string[] {
        const pages: string[] = [];

        if (json == null) {
            $('.image-section > .img-block > img').each((_: any, obj: any) => {
                if (!obj.attribs['src']) return;
                const link = obj.attribs['src'];
                pages.push(String(link));
            });
        } else {
            try {
                for (const img of json.result.data) {
                    const imgStr = img.indexOf('https') === -1 ? DOMAIN + img : img;
                    const encodedImg = String(imgStr ?? '').replace(/([^:]\/)\/+/g, '$1');
                    pages.push(encodedImg);
                }
            } catch {
                throw new Error(json);
            }
        }

        return pages;
    }

    parseSearchResults(json: any, DOMAIN: any): PartialSourceManga[] {
        const tiles: PartialSourceManga[] = [];
        const array = json.result.data ?? json.result;
        for (const obj of array) {
            const title = obj.name;
            const subtitle = `Chương ${obj.chapterLatest[0]}`;
            const image = obj.photo;
            const mangaId = `${obj.nameEn}::${obj.id}`;
            tiles.push(App.createPartialSourceManga({
                mangaId,
                image: encodeURI(image.indexOf('https') === -1 ? DOMAIN + image : image).replace(/([^:]\/)\/+/g, '$1') ?? '',
                title,
                subtitle
            }));
        }

        return tiles;
    }

    parseViewMoreItems(json: any, DOMAIN: any): PartialSourceManga[] {
        const manga: PartialSourceManga[] = [];
        const collectedIds: string[] = [];
        for (const obj of json.result.data) {
            const title = obj.name;
            const subtitle = 'Chương ' + obj.chapterLatest[0];
            const image = obj.photo;
            const mangaId = `${obj.nameEn}::${obj.id}`;
            if (!collectedIds.includes(mangaId)) {
                manga.push(App.createPartialSourceManga({
                    mangaId,
                    image: encodeURI(image.indexOf('https') === -1 ? DOMAIN + image : image).replace(/([^:]\/)\/+/g, '$1') ?? '',
                    title,
                    subtitle,
                }));
                collectedIds.push(mangaId);
            }
        }

        return manga;
    }

    parseTags(json: any): TagSection[] {
        const tags: Tag[] = [];

        for (const obj of json.result) {
            const label = obj.name;
            const id = obj.id;
            tags.push(App.createTag({ label, id }));
        }

        const tagSections: TagSection[] = [
            App.createTagSection({ id: '0', label: 'Thể loại', tags: tags.map(x => App.createTag(x)) }),
        ];
        return tagSections;
    }

    decodeHTMLEntity(str: string): string {
        return entities.decodeHTML(str);
    }
}