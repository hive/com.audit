import  { HomeyAPIV3Local as HomeyAPI } from 'homey-api'


/**
 * Internal reference for managing our apps flows.
 */
export type Flows = {
    triggers: {
        variable: any
    },
};

export type Variable = HomeyAPI.ManagerLogic.Variable
export type Item = {
    id: string,
    name: string,
    type: string,
    action: string, 
    value: string,
    description?: string;
}

export type ZoneItem = Item & {
    active: number
}

export interface Watcher {
    api: HomeyAPI
    flows: Flows
    store?: Item[]
    initialize(): void
    parse(item: Item, action: String): Item;
}