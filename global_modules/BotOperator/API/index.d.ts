import {DateTime} from "../Datetime";

export type Type = 'xml' | 'json';
export type Meals = [
    breakfast: string[] | null,
    lunch: string[] | null,
    dinner: string[] | null,
]
export type Event = {
    name: string,
    datetime: DateTime,
    isTargetGrade: [boolean, boolean, boolean]
}

export class Connection {
    constructor(key: string, orgCode?: string, schoolCode?: number, type?: Type)

    connect(url: string, args: [string, string | number][]): any;
    getMeals(datetime: DateTime): Meals
    getEvents(from: DateTime, to: DateTime): Event[];
}