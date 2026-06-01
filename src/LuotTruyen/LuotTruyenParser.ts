import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    PartialSourceManga,
} from '@paperback/types';

import type { CheerioAPI } from 'cheerio';
import * as entities from 'entities';

export class Parser {

    protected convertTime(timeAgo: string): Date {
        let time: Date;
        let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;

        if (timeAgo.includes('giây') || timeAgo.includes('secs')) {
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
            time = new Date(Date.now() - trimmed * 31556952000);
        } else {
            if (timeAgo.includes(':')) {
                const split = timeAgo.split(' ');
                const H = split[0];
                const D = split[1];
                const fixD = D?.split('/');
                const finalD = fixD?.[1] + '/' + fixD?.[0] + '/' + new Date().getFullYear();
                time = new Date(finalD + ' ' + H);
            } else {
                const split = timeAgo.split('-');
                time = new Date(split[1] + '/' + split[0] + '/' + split[2]);
            }
        }
        return time;
    }

    parseMangaDetails($: CheerioAPI, mangaId: string): SourceManga {
        const tags: Tag[] = [];

        $('article#item-detail li.kind p.col-xs-8 a').each((_: any, obj: any) => {
            const label = $(obj).text().trim();
            const href = $(obj).attr('href') ?? '';
            const slug = href.split('/').filter(Boolean).pop() ?? label.toLowerCase();
            const id = `cate.${slug}`;
            tags.push(App.createTag({ label, id }));
        });

        const title = $('article#item-detail h1.title-detail, article#item-detail h1, h1.title-detail').first().text().trim();
        const image = $('article#item-detail div.col-image img').attr('src') ?? '';
        const desc = $('article#item-detail div.detail-content p').map((_: any, el: any) => $(el).text().trim()).get().join('\n');
        const status = $('article#item-detail li.status p.col-xs-8').text().trim();
        const author = $('article#item-detail li.author p.col-xs-8').text().trim();

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [entities.decodeHTML(title)],
                author: entities.decodeHTML(author),
                image: image.startsWith('//') ? `https:${image}` : image,
                desc: entities.decodeHTML(desc),
                status,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags })],
            }),
        });
    }

    parseChapterList($: CheerioAPI): Chapter[] {
        const chapters: Chapter[] = [];

        $('li.row:not(.heading)').each((_: any, obj: any) => {
            const chapterLink = $('div.chapter a, a', obj).first();
            const href = chapterLink.attr('href') ?? '';
            const name = chapterLink.text().trim();
            if (!href || !name) return;

            // Store path after domain as chapterId, strip leading slash
            const chapterId = href.replace(/^https?:\/\/[^/]+\/truyen-tranh\//, '');

            const chapNum = parseFloat(name.replace(/[^0-9.]/g, '') || '0') || 0;
            const dateText = $('div.col-xs-4', obj).text().trim();
            const time = this.convertTime(entities.decodeHTML(dateText));
            const views = $('div.col-xs-3', obj).text().trim();

            chapters.push(App.createChapter({
                id: chapterId,
                chapNum,
                name: entities.decodeHTML(name),
                langCode: '🇻🇳',
                time: new Date(time),
                group: `${views} lượt xem`,
            }));
        });

        if (chapters.length == 0) {
            throw new Error('No chapters found');
        }

        return chapters;
    }

    parseChapterDetails($: CheerioAPI): string[] {
        const pages: string[] = [];

        $('#view-chapter img, .chapter-content img, .reading-content img, .content-chapter img').each((_: any, obj: any) => {
            const attributes = ['src', 'data-src', 'data-cfsrc', 'data-original'];
            let link = '';

            for (const attr of attributes) {
                const url = $(obj).attr(attr);
                if (url && !url.includes('chapter_default')) {
                    link = url;
                    break;
                }
            }
            if (!link) {
                for (const attr of attributes) {
                    const url = $(obj).attr(attr);
                    if (url) { link = url; break; }
                }
            }

            if (link) {
                const fullUrl = link.startsWith('//') ? `https:${link}`
                    : link.startsWith('http') ? link
                        : `https://${link}`;
                pages.push(fullUrl);
            }
        });

        if (!pages.length) {
            const hasLoginHint =
                $('a[href*="/Account/Login"], a[href*="/dang-nhap"], a[href*="returnUrl="], .login-page-wrapper').length > 0 ||
                $('title').text().toLowerCase().includes('đăng nhập') ||
                $('title').text().toLowerCase().includes('login');
            if (hasLoginHint) {
                throw new Error('Vui lòng đăng nhập bằng Webview để xem chương này');
            }
            throw new Error('Không tìm thấy hình ảnh');
        }

        return pages;
    }

    // Popular / search pages: div.item cards
    parseSearchResults($: CheerioAPI): PartialSourceManga[] {
        const tiles: PartialSourceManga[] = [];

        $('div.item').each((_: any, obj: any) => {
            const titleEl = $('figcaption h3 a, a.jtip', obj).first();
            const title = titleEl.text().trim();
            const href = titleEl.attr('href') ?? '';
            if (!href || !title) return;
            const mangaId = href.replace(/^https?:\/\/[^/]+\/truyen-tranh\//, '');
            const image = $('div.image a img', obj).attr('src') ?? '';
            const subtitle = $('figcaption ul li:first-child a', obj).text().trim();

            tiles.push(App.createPartialSourceManga({
                mangaId,
                image: image.startsWith('//') ? `https:${image}` : image,
                title: entities.decodeHTML(title),
                subtitle: entities.decodeHTML(subtitle),
            }));
        });

        return tiles;
    }

    // Latest page: #ctl00_divCenter .row > .item cards
    parseLatestItems($: CheerioAPI): PartialSourceManga[] {
        const tiles: PartialSourceManga[] = [];

        $('#ctl00_divCenter .row > .item').each((_: any, obj: any) => {
            const titleEl = $('figcaption h3 a, a.jtip', obj).first();
            const title = titleEl.text().trim();
            const href = titleEl.attr('href') ?? '';
            if (!href || !title) return;
            const mangaId = href.replace(/^https?:\/\/[^/]+\/truyen-tranh\//, '');
            const image = $('div.image a img', obj).attr('src') ?? '';

            tiles.push(App.createPartialSourceManga({
                mangaId,
                image: image.startsWith('//') ? `https:${image}` : image,
                title: entities.decodeHTML(title),
            }));
        });

        return tiles;
    }

    parseViewMoreItems($: CheerioAPI, homepageSectionId: string): PartialSourceManga[] {
        switch (homepageSectionId) {
            case 'popular':
            case 'full':
                return this.parseSearchResults($);
            case 'latest':
                return this.parseLatestItems($);
            default:
                throw new Error(`Invalid homepageSectionId: ${homepageSectionId}`);
        }
    }

    parseTags($: CheerioAPI): TagSection[] {
        const genres: Tag[] = [];
        const statuses: Tag[] = [];
        const sorts: Tag[] = [];

        // Genre links: /tim-truyen/<slug>
        $('ul.categories-detail li:not(.active) > a, .categories-detail li:not(.active) > a').each((_: any, obj: any) => {
            const label = $(obj).text().trim();
            const href = $(obj).attr('href') ?? '';
            const slug = href.split('/').filter(Boolean).pop() ?? '';
            const id = `cate.${slug}`;
            if (slug && label) genres.push(App.createTag({ id, label }));
        });

        // Status: ?status=<val>
        $('#status-comic a').each((_: any, obj: any) => {
            const label = $(obj).text().trim();
            const href = $(obj).attr('href') ?? '';
            const val = href.split('=').pop() ?? '';
            const id = `status.${val}`;
            if (val && label) statuses.push(App.createTag({ id, label }));
        });

        // Sort: ?sort=<val>
        $('.list-select > a').each((_: any, obj: any) => {
            const label = $(obj).text().trim();
            const href = $(obj).attr('href') ?? '';
            const val = href.split('=').pop() ?? '';
            const id = `sort.${val}`;
            if (val && label) sorts.push(App.createTag({ id, label }));
        });

        // Static fallback for sorts/statuses in case selectors don't match
        if (!sorts.length) {
            [
                { label: 'Top all', id: 'sort.10' },
                { label: 'Top tháng', id: 'sort.11' },
                { label: 'Top tuần', id: 'sort.12' },
                { label: 'Top ngày', id: 'sort.13' },
                { label: 'Truyện mới', id: 'sort.15' },
                { label: 'Số chương', id: 'sort.30' },
            ].forEach(t => sorts.push(App.createTag(t)));
        }
        if (!statuses.length) {
            [
                { label: 'Tất cả', id: 'status.-1' },
                { label: 'Đang tiến hành', id: 'status.1' },
                { label: 'Đã hoàn thành', id: 'status.2' },
            ].forEach(t => statuses.push(App.createTag(t)));
        }

        return [
            App.createTagSection({ id: '1', label: 'Thể Loại (Chỉ chọn 1)', tags: genres }),
            App.createTagSection({ id: '2', label: 'Trạng Thái (Chỉ chọn 1)', tags: statuses }),
            App.createTagSection({ id: '3', label: 'Sắp Xếp (Chỉ chọn 1)', tags: sorts }),
        ];
    }
}