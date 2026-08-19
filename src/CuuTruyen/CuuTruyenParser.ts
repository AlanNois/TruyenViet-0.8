import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    // MangaUpdates,
    PartialSourceManga
} from '@paperback/types';

// Storage host rewrite rules (converted from Aidoku Rust source)
const REPLACEMENTS: [string, string][] = [
    ['storage-ct.lrclib.net', 'storage-bravo.cuutruyen.net'],
    ['storage-ct-riften.site', 'storage-charlie.cuutruyen.net'],
];

/**
 * Rewrites storage image URLs to working hosts.
 * Replaces all occurrences of each old host with its new host.
 */
export function rewriteStorageUrl(url: string): string {
    let result = url;
    for (const [oldHost, newHost] of REPLACEMENTS) {
        result = result.replaceAll(oldHost, newHost);
    }
    return result;
}

// For the "tags" array items
interface ApiTag {
    name: string;
    slug: string;
    tagging_count: number;
}

// For the "author" object
interface ApiAuthor {
    name: string;
}

// For the "titles" array items
interface ApiTitle {
    id: number;
    name: string;
    primary: boolean;
}

// For the main "data" object which contains all manga details
interface MangaData {
    id: number;
    name: string;
    cover_url: string;
    cover_mobile_url: string;
    panorama_url?: string;
    author?: ApiAuthor;
    author_name?: string; // Added based on usage
    description?: string;
    full_description?: string;
    is_nsfw?: boolean;
    tags?: ApiTag[];
    titles?: ApiTitle[];
    views_count: number;
    chapters_count?: number;
    updated_at?: string; // ISO Date String
    team?: { name: string }; // Added based on usage
    newest_chapter_number?: string; // Added based on usage
    newest_chapter_id?: string
    newest_chapter_created_at?: string; // ISO Date String
    // You can add other fields from the JSON here if needed
}

interface ChapterApiData {
    id: number;
    order: number;
    number: string; // The chapter number is a string in the JSON
    name: string;
    views_count: number;
    comments_count: number;
    status: string; // e.g., "processed"
    created_at: Date; // ISO Date String
    updated_at: Date; // ISO Date String
}

/**
 * Describes the structure of a single page within the chapter.
 */
interface ChapterPage {
    id: number;
    order: number;
    width: number;
    height: number;
    status: string; // e.g., "processed"
    image_url: string;
    image_url_size: number;
    drm_data: string;
}

/**
 * Describes the minimal manga info included in the chapter details response.
 */
interface ChapterMangaInfo {
    id: number;
    name: string;
    cover_url: string;
    direction: 'rtl' | 'ltr' | string; // Reading direction
    is_nsfw: boolean;
}

/**
 * Describes the team info included in the chapter details response.
 */
interface ChapterTeamInfo {
    id: number;
    name: string;
    description: string;
}

/**
 * Describes the main data object for the chapter details.
 */
interface ChapterDetailsData {
    id: number;
    number: string;
    name: string;
    status: string;
    // Navigation fields can be null
    previous_chapter_id: number | null;
    next_chapter_id: number | null;
    manga: ChapterMangaInfo;
    team: ChapterTeamInfo;
    pages: ChapterPage[];
}

export class Parser {
    
    parseMangaDetails(data: MangaData, mangaId: string): SourceManga {
        const tags: Tag[] = [];

        if (data.tags) {
            for (const tag of data.tags) {
                tags.push(App.createTag({
                    label: tag.name ?? '',
                    id: tag.slug ?? ''
                }));
            }
        }

        const titles = [data.name ?? ''];
        const author = data.author?.name ?? data.author_name ?? '';
        const image = rewriteStorageUrl(data.cover_url ?? data.cover_mobile_url ?? '');
        const banner = rewriteStorageUrl(data.panorama_url ?? '');

        let desc = data.description ?? '';
        if (data.team?.name) {
            desc = `Nhóm dịch: ${data.team.name}\n\n${desc}`;
        }

        // Determine status from tags
        let status = 'Không rõ'; // Unknown
        if (data.tags) {
            const tagNames = data.tags.map((t: ApiTag) => t.name.toLowerCase());
            if (tagNames.includes('đang tiến hành')) {
                status = 'Đang tiến hành'; // Ongoing
            } else if (tagNames.includes('đã hoàn thành')) {
                status = 'Đã hoàn thành'; // Completed
            } else if (tagNames.includes('tạm ngưng')) {
                status = 'Tạm ngưng'; // On Hiatus
            }
        }

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles,
                author,
                image,
                banner: banner,
                desc: desc,
                status: status,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags })],
                additionalInfo: {
                    'Updated': data.updated_at ?? 'Không rõ',
                }
            }),
        });
    }

    parseChaptersList(data: ChapterApiData[]): Chapter[] {
        const chapters: Chapter[] = [];

        for (const obj of data) {
            const chapNum = parseFloat(obj.number);
            const name = obj.name ?? '';
            const time = obj.updated_at ?? '';
            chapters.push(App.createChapter({
                id: obj.id.toString(),
                chapNum: isNaN(chapNum) ? 0 : chapNum,
                name,
                langCode: '🇻🇳',
                time,
                group: `${obj.views_count ?? 0} lượt xem`,
                sortingIndex: obj.order,
            }));
        }
        return chapters;
    }

    parseChapterDetails(data: ChapterDetailsData): string[] {
        const pages: string[] = [];
        if (data.pages) {
            for (const page of data.pages) {
                const drmData = page.drm_data.replace(/\n/g, '');
                const imageUrl = `${rewriteStorageUrl(page.image_url)}${drmData ? `#drm_data=${drmData}` : ''}`;
                pages.push(imageUrl);
            }
        }

        return pages;
    }

    parseSearchResults(data: MangaData[]): PartialSourceManga[] {
        const results: PartialSourceManga[] = [];

        for (const manga of data) {
            if (!manga.id || !manga.name) continue;

            const title = manga.name.trim();
            const image = rewriteStorageUrl(manga.cover_url ?? manga.cover_mobile_url ?? '');
            const subtitle = `Chương ${manga.newest_chapter_number}`;
            const mangaId = manga.id.toString();
            results.push(App.createPartialSourceManga({
                mangaId,
                image: encodeURI(image),
                title: title,
                subtitle: subtitle,
            }));
        }

        return results;
    }

    parseTags(): TagSection[] {
        // Static tag list based on the Kotlin implementation
        const tags: { label: string; id: string }[] = [
            { label: 'Tất cả', id: '' },
            { label: 'Manga', id: 'manga' },
            { label: 'Đang tiến hành', id: 'dang-tien-hanh' },
            { label: 'Thể thao', id: 'the-thao' },
            { label: 'Hài hước', id: 'hai-huoc' },
            { label: 'Shounen', id: 'shounen' },
            { label: 'Học đường', id: 'hoc-duong' },
            { label: 'Chất lượng cao', id: 'chat-luong-cao' },
            { label: 'Comedy', id: 'comedy' },
            { label: 'Action', id: 'action' },
            { label: 'Horror', id: 'horror' },
            { label: 'Sci-fi', id: 'sci-fi' },
            { label: 'Martial arts', id: 'martial-arts' },
            { label: 'Supernatural', id: 'supernatural' },
            { label: 'Web comic', id: 'web-comic' },
            { label: 'Phiêu lưu', id: 'phieu-luu' },
            { label: 'Hậu tận thế', id: 'hau-tan-the' },
            { label: 'Hành động', id: 'hanh-dong' },
            { label: 'Đã hoàn thành', id: 'da-hoan-thanh' },
            { label: 'Sinh tồn', id: 'sinh-ton' },
            { label: 'Du hành thời gian', id: 'du-hanh-thoi-gian' },
            { label: 'Bí ẩn', id: 'bi-an' },
            { label: 'Trinh thám', id: 'trinh-tham' },
            { label: 'Kinh dị', id: 'kinh-di' },
            { label: 'Manhwa', id: 'manhwa' },
            { label: 'Webtoon', id: 'webtoon' },
            { label: 'Fantasy', id: 'fantasy' },
            { label: 'Võ thuật', id: 'vo-thuat' },
            { label: 'Drama', id: 'drama' },
            { label: 'Hệ thống', id: 'he-thong' },
            { label: 'Lãng mạn', id: 'lang-man' },
            { label: 'Đời thường', id: 'doi-thuong' },
            { label: 'Công sở', id: 'cong-so' },
            { label: 'Sát thủ', id: 'sat-thu' },
            { label: 'Phép thuật', id: 'phep-thuat' },
            { label: 'Tội phạm', id: 'toi-pham' },
            { label: 'Seinen', id: 'seinen' },
            { label: 'Isekai', id: 'isekai' },
            { label: 'Chuyển sinh', id: 'chuyen-sinh' },
            { label: 'Harem', id: 'harem' },
            { label: 'Mecha', id: 'mecha' },
            { label: 'Trung cổ', id: 'trung-co' },
            { label: 'LGBT', id: 'lgbt' },
            { label: 'Yaoi', id: 'yaoi' },
            { label: 'Game', id: 'game' },
            { label: 'Bi kịch', id: 'bi-kich' },
            { label: 'Động vật', id: 'dong-vat' },
            { label: 'Tâm lý', id: 'tam-ly' },
            { label: 'Manhua', id: 'manhua' },
            { label: 'Romance', id: 'romance' },
            { label: 'Shoujo', id: 'shoujo' },
            { label: 'Lịch sử', id: 'lich-su' },
            { label: 'Josei', id: 'josei' },
            { label: 'Yuri', id: 'yuri' },
            { label: 'Ecchi', id: 'ecchi' },
            { label: 'Smut', id: 'smut' },
            { label: 'School life', id: 'school-life' },
            { label: 'Slice of life', id: 'slice-of-life' },
            { label: 'Tragedy', id: 'tragedy' },
            { label: 'Mystery', id: 'mystery' },
            { label: 'Historical', id: 'historical' },
            { label: 'Medical', id: 'medical' },
            { label: 'Thriller', id: 'thriller' },
            { label: 'Survival', id: 'survival' },
            { label: 'Samurai', id: 'samurai' },
            { label: 'Virtual reality', id: 'virtual-reality' },
            { label: 'Video games', id: 'video-games' },
            { label: 'NTR', id: 'ntr' },
            { label: 'NSFW', id: 'nsfw' },
        ];

        return [
            App.createTagSection({
                id: '0',
                label: 'Thể Loại',
                tags: tags.map(x => App.createTag(x))
            })
        ];
    }
}
