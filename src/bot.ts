import {bot} from "./index";
import {User} from "./models";

const createUserIfNotExists = async (chatId: number) => {
    const user = await User.findOne({
            where: {
                user_id: chatId
            }
        }) as any;

        if(!user) {
            await User.create({
                user_id: chatId
            })
        }
}

export const enterUserNameFunction = async (chatId: number) => {
    await bot.sendMessage(chatId, `Введите имя:`);
}

export const enterAgeFunction = async (chatId: number, response: string) => {
    await createUserIfNotExists(chatId);
    await User.update({ name: response }, {
        where: {
            user_id: chatId
        }
    })
    await bot.sendMessage(chatId, `Введите возраст:`);
}

export const completeSurveyFunction = async (chatId: number, response: string) => {
    if(response) {
        await User.update({age: response}, {
            where: {
                user_id: chatId
            }
        })
        const user = await User.findOne({
            where: {
                user_id: chatId
            }
        }) as any
        if (user)
            await bot.sendMessage(chatId, `Спасибо за участие в опросе! Вас зовут: ${user.name}, Вам ${user.age} лет.`);
        else
            await bot.sendMessage(chatId, `АШИБКА!!!!`);
    }
    else {
        const user = await User.findOne({
            where: {
                user_id: chatId
            }
        }) as any
        if (user)
            await bot.sendMessage(chatId, `Вы уже прошли опрос! Вас зовут: ${user.name}, Вам ${user.age} лет.`);
        else
            await bot.sendMessage(chatId, `АШИБКА!!!!`);
    }
}
