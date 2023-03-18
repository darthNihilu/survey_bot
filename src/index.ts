import {Commands, getUserStageKeyName, initialize_models, Stages, TelegramUserSessions, StagesDescription} from "./models";

import TelegramBot, {Message} from "node-telegram-bot-api";
require('dotenv').config();

const token = process.env.BOT_TOKEN as string;

export const bot = new TelegramBot(token, {polling: true});

const checkUserStage = async (chatId: number, stage: any, create_user?: boolean) => {
    const user = await TelegramUserSessions.findOne({
        where: {
            user_id: chatId
        }
    }) as any;

    if(user) {
        return user.stage === stage;

    } else {
        if(create_user)
        {
            await TelegramUserSessions.create({
                user_id: chatId,
                stage: stage
            })
            return true
        }
        return false
    }
}

// НАЧАЛО ЗДЕСЬ!!!!!!!!!
bot.onText(/\/create_user/, async (msg: Message) => {
    // На всякий случай вызываем, чтобы sequelize не ныл, что таблицы не созданы
    await initialize_models();
    const chatId = msg.chat.id;

    const required_stage = getUserStageKeyName(Commands.createUser, Stages.enterUserName)

    const user = await TelegramUserSessions.findOne({
        where: {
            user_id: chatId
        }
    }) as any;

    // Проверяем существует ли пользователь в базе, если нет, то создаем и задаем вопрос
    if(!user)
    {
        await TelegramUserSessions.create({
            user_id: chatId,
            stage: required_stage
        })

        StagesDescription[Commands.createUser][Stages.enterUserName](chatId);
    }
});


bot.on('message', async (msg: Message) => {
    // На всякий случай вызываем, чтобы sequelize не ныл, что таблицы не созданы
    await initialize_models();
    const chatId = msg.chat.id;

    // Находим сущность пользователя в базе
    const user = await TelegramUserSessions.findOne({
        where: {
            user_id: chatId
        }
    }) as any;

    if(!user) return;

    // Проверяем на каком этапе находится пользователь и выполняем соответствующую функцию, в данном случае стадия ввода имени
    if(user.stage === getUserStageKeyName(Commands.createUser, Stages.enterUserName)) {
        user.stage = getUserStageKeyName(Commands.createUser, Stages.enterAge);
        await user.save();
        StagesDescription[Commands.createUser][Stages.enterAge](chatId, msg.text as string);
        return
    }

    // Проверяем на каком этапе находится пользователь и выполняем соответствующую функцию, в данном случае стадия ввода возраста
    if(user.stage === getUserStageKeyName(Commands.createUser, Stages.enterAge)) {
        user.stage = getUserStageKeyName(Commands.createUser, Stages.completeSurvey);
        await user.save();

        // Пишем, что опрос завершен и показываем данные
        StagesDescription[Commands.createUser][Stages.completeSurvey](chatId, msg.text as string);
        return
    }

    // Если пользователь уже прошел опрос, то показываем ему сообщение, что он уже прошел опрос
    if(user.stage === getUserStageKeyName(Commands.createUser, Stages.completeSurvey)) {
        StagesDescription[Commands.createUser][Stages.completeSurvey](chatId);
        return
    }

});
