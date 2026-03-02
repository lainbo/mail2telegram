export const tmaModeDescription: { [key: string]: string } = {
    test: '测试邮箱地址',
    white: '白名单设置',
    block: '黑名单设置',
};

export const telegramCommands = [
    {
        command: 'id',
        description: '/id - 获取聊天 ID',
    },
    {
        command: 'test',
        description: `/test - ${tmaModeDescription.test}`,
    },
    {
        command: 'white',
        description: `/white - ${tmaModeDescription.white}`,
    },
    {
        command: 'block',
        description: `/block - ${tmaModeDescription.block}`,
    },
];
