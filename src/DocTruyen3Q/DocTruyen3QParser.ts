import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    // MangaUpdates,
    PartialSourceManga
} from '@paperback/types'

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
                let fixD = D?.split('/');
                let finalD = fixD?.[1] + '/' + fixD?.[0] + '/' + new Date().getFullYear();
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

        $('.info-detail-comic > .category > .detail-info > a').each((_: any, obj: any) => {
            const label = $(obj).text().trim();
            const id = $(obj).attr('href')?.split('/').pop() ?? label;
            tags.push(App.createTag({ label, id }));
        })

        const titles =[$('.title-manga').text().trim()];
        const image = $('.image-info img').attr('src') ?? '';
        const desc = $('.summary-content > p').text();
        const status = $('.status > .detail-info > span').text();
        const rating = parseFloat(String($('.star').attr('data-rating')))

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles,
                image,
                desc,
                status,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags: tags })],
                rating
            })
        })
    }

    parseChapterList($: CheerioStatic): Chapter[] {
        const chapters: Chapter[] = [];

        $('#list-chapter-dt > nav > ul > .row:not([style])').each((_: any, obj: any) => {
            const id = String($('.chapters > a', obj).attr('href')).split('/').slice(4).join('/');
            const chapNum = parseFloat(String($('.chapters a', obj).text().trim().split(' ')[1]));
            const name = $('.chapters a', obj).text().trim();
            const time = this.convertTime($('div:nth-child(2)', obj).text().trim());
            const group = $('div:nth-child(3)', obj).text().trim();

            chapters.push(App.createChapter({
                id,
                chapNum,
                name,
                langCode: '🇻🇳',
                time,
                group: `${group} lượt xem`
            }));
        });

        if (chapters.length == 0) {
            throw new Error('No chapters found')
        }

        return chapters
    }

    parseChapterDetails($: CheerioStatic): string[] {
        const pages: string[] = [];

        $('.list-image-detail img').each((_: any, obj: any) => {
            const link = $(obj).attr('src') ?? $(obj).attr('data-src');
            pages.push(String(link));
        });

        return pages
    }

    parseSearchResults($: CheerioStatic): PartialSourceManga[] {
        const tiles: PartialSourceManga[] = [];

        $('.content-search-left > .main-left .item-manga > .item').each((_: any, obj: any) => {
            const title = $('.caption > h3 > a', obj).text().trim();
            let image = $('.image-item > a > img', obj).attr('data-original') ?? $('.image-item > a > img', obj).attr('src');
            image = !image ? "https://i.imgur.com/GYUxEX8.png" : image;
            const mangaId = String($('.caption > h3 > a', obj).attr('href')?.split('/').slice(4).join('/'));
            const subtitle = $('ul > li:first-child > a', obj).text().trim();
            if (!mangaId || !title) return;

            tiles.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }));
        });

        return tiles
    }

    parseFeaturedSection($: CheerioStatic): PartialSourceManga[] {
        const featuredItems: PartialSourceManga[] = [];

        $('.owl-carousel .slide-item').each((_: any, obj: any) => {
            const title = $('.slide-info > h3 > a', obj).text().trim();
            let image = $('a > img', obj).attr('src') ?? $('a > img', obj).attr('data-src');
            image = !image ? "https://i.imgur.com/GYUxEX8.png" : image;
            const mangaId = String($('.slide-info > h3 > a', obj).attr('href')?.split('/').slice(4).join('/'));
            const subtitle = $('.detail-slide > a', obj).text().trim();
            if (!mangaId || !title) return;
            featuredItems.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }));
        });

        return featuredItems;
    }

    parseHomeTemplate($: CheerioStatic, id: string): PartialSourceManga[] {
        const homeItems: PartialSourceManga[] = [];

        $(`${id} > .body > .main-left .item-manga > .item`).each((_: any, obj: any) => {
            const title = $('.caption > h3 > a', obj).text().trim();
            let image = $('.image-item > a > img', obj).attr('data-original') ?? $('.image-item > a > img', obj).attr('src');
            image = !image ? "https://i.imgur.com/GYUxEX8.png" : image;
            const mangaId = String($('.caption > h3 > a', obj).attr('href')?.split('/').slice(4).join('/'));
            const subtitle = $('ul > li:first-child > a', obj).text().trim();
            if (!mangaId || !title) return;

            homeItems.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }));
        });

        return homeItems;
    }

    parseViewMoreItems($: CheerioStatic, homepageSectionId: string): PartialSourceManga[] {
        switch (homepageSectionId) {
            case 'featured':
                return this.parseFeaturedSection($);
            case 'viewest':
                return this.parseSearchResults($);
            case 'hot':
                return this.parseHomeTemplate($, '#hot');
            case 'new_updated':
                return this.parseHomeTemplate($, '#home');
            case 'full':
                return this.parseSearchResults($);
            default:
                throw new Error(`Invalid homepageSectionId: ${homepageSectionId}`)
        }
    }

    parseTags($: CheerioStatic): TagSection[] {
        const tags: Tag[] = [];
        const tags1: Tag[] = [];
        const tags2: Tag[] = [];

        $('.categories-detail li:not(.active) > a').each((_: any, obj: any) => {
            const label = $(obj).text().trim();
            const id = 'cate.' + $(obj).attr('href')?.split('/').pop();
            if (!id || !label) return;
            tags.push({ id: id, label: label });
        })

        $('#status-comic a').each((_: any, obj: any) => {
            const label = $(obj).text().trim();
            const id = 'status.' + $(obj).attr('href')?.split('=')[1];
            if (!id || !label) return;
            tags1.push({ id: id, label: label });
        })

        $('.list-select > a').each((_: any, obj: any) => {
            const label = $(obj).text().trim();
            const id = 'sort.' + $(tags2).attr('href')?.split('=')[1];
            if (!id || !label) return;
            tags2.push({ id: id, label: label });
        })

        const tagSections: TagSection[] = [
            App.createTagSection({ id: '1', label: 'Thể Loại (Chỉ chọn 1)', tags: tags.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '2', label: 'Trạng Thái(Chỉ chọn 1)', tags: tags1.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '3', label: 'Sắp Xếp(Chỉ chọn 1)', tags: tags2.map(x => App.createTag(x)) })
        ]

        return tagSections
    }
}