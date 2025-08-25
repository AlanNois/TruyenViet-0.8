import {
    DUIButton,
    DUINavigationButton,
    SourceStateManager
} from '@paperback/types'

enum Domains {
    CUUTRUYEN = 'cuutruyen.net',
    NETTROM = 'nettrom.com',
    HETCUUTRUYEN = 'hetcuutruyen.net',
    CUUTRUYENPIP7Z = 'cuutruyenpip7z.site',
    CUUTRUYEN5C844 = 'cuutruyen5c844.site',
}

export const getDomain = async (stateManager: SourceStateManager): Promise<string> => {
    return (await stateManager.retrieve('domain') as string) ?? Domains.CUUTRUYEN
}

export const domainSettings = (stateManager: SourceStateManager): DUINavigationButton => {
    return App.createDUINavigationButton({
        id: 'domain_settings',
        label: 'Domain Settings',
        form: App.createDUIForm({
            sections: async () =>
                [
                    App.createDUISection({
                        isHidden: false,
                        id: 'content',
                        rows: async () => {
                            await Promise.all([
                                getDomain(stateManager)
                            ])

                            return await [
                                App.createDUISelect({
                                    id: 'domain',
                                    label: 'Domain',
                                    options: [
                                        Domains.CUUTRUYEN,
                                        Domains.NETTROM,
                                        Domains.HETCUUTRUYEN,
                                        Domains.CUUTRUYENPIP7Z,
                                        Domains.CUUTRUYEN5C844
                                    ],
                                    labelResolver: async (option: string) => {
                                        switch (option) {
                                            case Domains.CUUTRUYEN:
                                                return 'Cuu Truyen (.net)'
                                            case Domains.NETTROM:
                                                return 'Net Trom (.com)'
                                            case Domains.HETCUUTRUYEN:
                                                return 'Het Cuu Truyen (.net)'
                                            case Domains.CUUTRUYENPIP7Z:
                                                return 'Cuu Truyen Pip7z (.site)'
                                            case Domains.CUUTRUYEN5C844:
                                                return 'Cuu Truyen 5c844 (.site)'
                                            default:
                                                return option
                                        }
                                    },
                                    value: App.createDUIBinding({
                                        get: async () => [await getDomain(stateManager)],
                                        set: async (value: string[]) => {
                                            await stateManager.store('domain', value[0])
                                        }
                                    }),
                                    allowsMultiselect: false
                                })
                            ]
                        }
                    })
                ]
        })
    })
}

export function resetSettings(stateManager: SourceStateManager): DUIButton {
    return App.createDUIButton({
        id: 'reset',
        label: 'Reset to Default',
        onTap: async () => {
            await stateManager.store('domain', Domains.CUUTRUYEN)
        }
    })
}