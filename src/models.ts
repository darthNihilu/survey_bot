import {DataTypes, Sequelize} from 'sequelize';
import {completeSurveyFunction, enterAgeFunction, enterUserNameFunction} from "./bot";

const sequelize = new Sequelize('sqlite::memory:');


// Описание модели команд
export const Commands = {
    createUser: 'createUser'
}


// Описание моделей этапов
export const Stages = {
    enterUserName: 'enterUserName',
    enterAge: 'enterAge',
    completeSurvey: 'completeSurvey'
}


// Описание функций, которые будут выполняться на каждом этапе
export const StagesDescription = {
    [Commands.createUser]: {
        [Stages.enterUserName]: enterUserNameFunction as any,
        [Stages.enterAge]: enterAgeFunction as any,
        [Stages.completeSurvey]: completeSurveyFunction as any
    }
}

// Функция, которая возвращает ключ для этапа, чтобы записывать его в базу
export const getUserStageKeyName = (command: any, stage: any) => {
    // @ts-ignore
    return `${Commands[command]}-${Stages[stage]}`
}


// Объект пользовательских этапов
export const TelegramUserSessions = sequelize.define('UserStages', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stage: {
        type: DataTypes.STRING,
    },
    answer: {
        type: DataTypes.STRING,
    },
});


// Объект пользователей
export const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.STRING,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    age: {
        type: DataTypes.NUMBER,
        allowNull: true
    },
});

export const initialize_models = async () => {
    await TelegramUserSessions.sync();
    await User.sync();
}

