import {
    DUIButton,
    DUINavigationButton,
    SourceStateManager,
} from '@paperback/types';

const DEFAULT_BASE_URL = 'https://luottruyen8.com';

export const getDomain = async (stateManager: SourceStateManager): Promise<string> => {
    return (await stateManager.retrieve('baseUrl') as string) ?? DEFAULT_BASE_URL;
};

export const domainSettings = (stateManager: SourceStateManager): DUINavigationButton => {
    return App.createDUINavigationButton({
        id: 'domain_settings',
        label: 'Ghi đè URL cơ sở',
        form: App.createDUIForm({
            sections: async () => [
                App.createDUISection({
                    isHidden: false,
                    id: 'content',
                    rows: async () => [
                        App.createDUIInputField({
                            id: 'baseUrl',
                            label: 'URL cơ sở',
                            value: App.createDUIBinding({
                                get: async () => await getDomain(stateManager),
                                set: async (value: string) => {
                                    const trimmed = value.trim().replace(/\/$/, '');
                                    await stateManager.store('baseUrl', trimmed || DEFAULT_BASE_URL);
                                },
                            }),
                        }),
                    ],
                }),
            ],
        }),
    });
};

export function resetSettings(stateManager: SourceStateManager): DUIButton {
    return App.createDUIButton({
        id: 'reset',
        label: 'Đặt lại mặc định',
        onTap: async () => {
            await stateManager.store('baseUrl', DEFAULT_BASE_URL);
        },
    });
}