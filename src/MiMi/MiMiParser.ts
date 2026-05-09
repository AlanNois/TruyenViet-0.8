import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    PartialSourceManga
} from '@paperback/types';

// ── API shape interfaces ──────────────────────────────────────────────────────

interface ApiGenre {
    id: number;
    name: string;
}

interface ApiAuthor {
    id?: number;
    name: string;
}

interface ApiManga {
    id: number;
    title: string;
    cover_url?: string;
    description?: string;
    alt_names?: string[];
    authors?: ApiAuthor[];
    genres?: ApiGenre[];
    parodies?: ApiAuthor[];
    characters?: ApiAuthor[];
}

interface ApiChapter {
    id: number;
    title?: string;
    order: number;
    created_at?: string;
}

interface ApiPage {
    image_url: string;
}

interface ApiChapterDetails {
    pages?: ApiPage[];
}

// ── Parser ────────────────────────────────────────────────────────────────────

export class Parser {

    parseMangaDetails(data: ApiManga, mangaId: string): SourceManga {
        const tags: Tag[] = (data.genres ?? []).map(g =>
            App.createTag({ label: g.name, id: g.id.toString() })
        );

        // Build title list: primary + alt names
        const titles = [data.title ?? ''];
        if (data.alt_names?.length) {
            titles.push(...data.alt_names);
        }

        const author = (data.authors ?? []).map(a => a.name).join(', ');
        const image = data.cover_url ?? '';

        // Mirror MiMiDto description building
        const descParts: string[] = [];
        if (data.alt_names?.length) {
            descParts.push(`Tên khác: ${data.alt_names.join(', ')}`);
        }
        if (data.parodies?.length) {
            descParts.push(`Parody: ${data.parodies.map(p => p.name.trim()).join(', ')}`);
        }
        if (data.characters?.length) {
            descParts.push(`Nhân vật: ${data.characters.map(c => c.name.trim()).join(', ')}`);
        }
        if (data.authors?.length) {
            descParts.push(`Code author: ${data.authors.map(a => a.id?.toString() ?? '').join(', ')}`);
        }
        descParts.push(`Code manga: ${data.id}`);
        if (data.description) {
            descParts.push('', data.description);
        }
        const desc = descParts.join('\n\n');

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles,
                author,
                image,
                desc,
                status: 'Không rõ',
                tags: [App.createTagSection({ id: '0', label: 'genres', tags })],
            }),
        });
    }

    parseChaptersList(data: ApiChapter[], mangaId: string): Chapter[] {
        return data.map(obj => {
            const chapterId = `${mangaId}/${obj.id}`;
            const name = obj.title?.trim() || `Chapter ${obj.order}`;
            const time = obj.created_at ? new Date(obj.created_at) : undefined;

            return App.createChapter({
                id: chapterId,
                chapNum: obj.order,
                name,
                langCode: '🇻🇳',
                time,
                sortingIndex: obj.order,
            });
        });
    }

    parseChapterDetails(data: ApiChapterDetails): string[] {
        return (data.pages ?? []).map(p => p.image_url);
    }

    parseSearchResults(data: ApiManga[]): PartialSourceManga[] {
        const results: PartialSourceManga[] = [];

        for (const manga of data) {
            if (!manga.id || !manga.title) continue;

            results.push(App.createPartialSourceManga({
                mangaId: manga.id.toString(),
                image: encodeURI(manga.cover_url ?? ''),
                title: manga.title.trim(),
            }));
        }

        return results;
    }

    parseTags(data: ApiGenre[]): TagSection[] {
        const tags = data.map(g =>
            App.createTag({ label: g.name, id: g.id.toString() })
        );

        return [
            App.createTagSection({
                id: '0',
                label: 'Thể Loại',
                tags,
            })
        ];
    }
}