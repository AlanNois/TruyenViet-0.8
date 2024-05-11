import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    PartialSourceManga
} from '@paperback/types'

const entities = require("entities"); //Import package for decoding HTML entities

export class Parser {
    protected convertTime(timeAgo: string): Date {
        let time: Date
        let trimmed: number = Number((/\d*/.exec(timeAgo) ?? [])[0])
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed
        if (timeAgo.includes('giây') || timeAgo.includes('secs')) {
            time = new Date(Date.now() - trimmed * 1000) // => mili giây (1000 ms = 1s)
        } else if (timeAgo.includes('phút')) {
            time = new Date(Date.now() - trimmed * 60000)
        } else if (timeAgo.includes('giờ')) {
            time = new Date(Date.now() - trimmed * 3600000)
        } else if (timeAgo.includes('ngày')) {
            time = new Date(Date.now() - trimmed * 86400000)
        } else if (timeAgo.includes('tuần')) {
            time = new Date(Date.now() - trimmed * 86400000 * 7)
        } else if (timeAgo.includes('tháng')) {
            time = new Date(Date.now() - trimmed * 86400000 * 7 * 4)
        } else if (timeAgo.includes('năm')) {
            time = new Date(Date.now() - trimmed * 31556952000)
        } else {
            if (timeAgo.includes(":")) {
                let split = timeAgo.split(' ');
                let H = split[0]; //vd => 21:08
                let D = split[1]; //vd => 25/08 
                let fixD = String(D).split('/');
                let finalD = fixD[1] + '/' + fixD[0] + '/' + new Date().getFullYear();
                time = new Date(finalD + ' ' + H);
            } else {
                let split = timeAgo.split('-'); //vd => 05/12/18
                time = new Date(split[1] + '/' + split[0] + '/' + split[2]);
            }
        }
        return time
    }

    parseMangaDetails($: CheerioStatic, mangaId: string): SourceManga {
        const tags: Tag[] = [];

        $('.group-content a').each((_: any, obj: any) => {
            const label = $('span:nth-child(2)', obj).text().trim();
            const id = $(obj).attr('href')?.trim().split('=')[1] ?? label;
            tags.push(App.createTag({ label, id }));
        })

        const titles = [this.decodeHTMLEntity($('.v-card-title').text().trim())];
        let author, artist;
        let status = '';
        $('.information-section > div').each((_: any, obj: any) => {
            switch ($(obj).text().trim().split('\n')[0]) {
                case "Tác giả:":
                    author = String($(obj).text().split('\n')[1]).trim();
                    artist = String($(obj).text().split('\n')[1]).trim();
                    break;
                case "Trạng thái:":
                    status = String($(obj).text().split('\n')[1]).trim();
                    break
            }
        })
        const image = String($('.v-image > img').attr('src'));
        const desc = $('.v-card-text.pt-1.px-4.pb-4.text-secondary.font-weight-medium').text();
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
        })
    }

    parseChapterList(json: any): Chapter[] {
        const chapters: Chapter[] = [];

        for (let obj of json.result.chapters) {
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
            }))
        }

        return chapters;
    }

    parseChapterDetails(json: any, $: any): string[] {
        const pages: string[] = [];

        if (json == null) {
            $('.image-section > .img-block > img').each((_: any, obj: any) => {
                if (!obj.attribs['src']) return;
                let link = obj.attribs['src'];
                pages.push(encodeURI(link));
            });
        } else {
            for (const img of json.result.data) {
                pages.push(img);
            }
        }

        return pages;
    }

    parseSearchResults(json: any): PartialSourceManga[] {
        const tiles: PartialSourceManga[] = [];
        const array = json.result.data ?? json.result;
        for (let obj of array) {
            let title = obj.name;
            let subtitle = `Chương ${obj.chapterLatest[0]}`;
            const image = obj.photo;
            let mangaId = `${obj.nameEn}::${obj.id}`;
            tiles.push(App.createPartialSourceManga({
                mangaId,
                image: encodeURI(image) ?? "",
                title,
                subtitle
            }))
        }

        return tiles;
    }

    parseViewMoreItems(json: any): PartialSourceManga[] {
        const manga: PartialSourceManga[] = [];
        const collectedIds: string[] = [];
        for (let obj of json.result.data) {
            let title = obj.name;
            let subtitle = 'Chương ' + obj.chapterLatest[0];
            const image = obj.photo;
            let mangaId = `${obj.nameEn}::${obj.id}`;
            if (!collectedIds.includes(mangaId)) {
                manga.push(App.createPartialSourceManga({
                    mangaId,
                    image: encodeURI(image) ?? "",
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

        for (let obj of json.result) {
            const label = obj.name;
            const id = obj.id;
            tags.push(App.createTag({ label, id }));
        }

        const tagSections: TagSection[] = [
            App.createTagSection({ id: '0', label: 'Thể loại', tags: tags.map(x => App.createTag(x)) }),
        ]
        return tagSections;
    }

    decodeHTMLEntity(str: string): string {
        return entities.decodeHTML(str);
    }
}