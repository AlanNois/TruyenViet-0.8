import {
    DUIButton,
    DUINavigationButton,
    SourceStateManager
} from '@paperback/types'

enum Domains {
    CUUTRUYEN = 'cuutruyen.net',
    NETTROM = 'nettrom.com',
    HETCUUTRUYEN = 'hetcuutruyen.net',
    CUUTRUYENT9SV7 = 'cuutruyent9sv7.xyz',
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
                                        Domains.CUUTRUYENT9SV7
                                    ],
                                    labelResolver: async (option: string) => {
                                        switch (option) {
                                            case Domains.CUUTRUYEN:
                                                return 'Cuu Truyen (.net)'
                                            case Domains.NETTROM:
                                                return 'Net Trom (.com)'
                                            case Domains.HETCUUTRUYEN:
                                                return 'Het Cuu Truyen (.net)'
                                            case Domains.CUUTRUYENT9SV7:
                                                return 'Cuu Truyen T9SV7 (.xyz)'
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