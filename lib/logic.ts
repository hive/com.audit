import  { HomeyAPIV3Local as HomeyAPI } from 'homey-api'

import type {
    Flows,
    Variable,
    Item,
    Watcher
} from '../types'

export default class Logic implements Watcher {

    api: HomeyAPI
    flows: Flows
    store!: Item[]

    constructor(api: HomeyAPI, flows: Flows) {
        this.api = api; 
        this.flows = flows;
        this.store = []; 
    }

    /**
     * Initialize the store and listeners
     */
    initialize = async () => {
        // @ts-expect-error athom definition issue
        await this.api.logic.connect();

        this.initStore();
        this.initListeners(); 
    }
    
    /**
     * Initialise all values and create a store of values locally
     * 
     * Used to compare new/old updates and have info on deleted items.
     * @returns void
     * 
     */
    initStore = async () => {
        // @ts-expect-error athom definition issue
        const vars = await this.api.logic.getVariables();
        let values:Item[] = Object.values(vars)
        for (const value of values) {
            this.store.push(this.parse(this.transform(value), 'initialise'))
        }
    }

    /**
     * Adds listeners on homey updates, which trigger flows
     */
    initListeners () {

        // @ts-expect-error athom definition issue
        (this.api.logic as any).on('variable.create', (variable: Variable) =>
            this.flows.triggers.variable.trigger(this.parse(this.transform(variable), 'create'))
        );

        // @ts-expect-error athom definition issue
        (this.api.logic as any).on('variable.update', (variable: Variable) =>
            this.flows.triggers.variable.trigger(this.parse(this.transform(variable), 'update'))
        );

        // @ts-expect-error athom definition issue
        (this.api.logic as any).on('variable.delete', (variable: Variable) =>
            this.flows.triggers.variable.trigger(this.parse(this.transform(variable), 'delete'))
        );
    }

    /**
     * Transforms homey object into generic app object.
     */
    transform(input: any) : Item {
       
        const info:Item =  {
            id: input.id,
            name: input.name,
            type: input.type,
            value: input.value ? input.value.toString() : undefined,
            action: '',
            description: undefined
        };
        return info; 
    }

    /**
     * Parses the value, and prepares deleted items as well as the description. 
     * @param input Item
     * @param action String
     * @returns Item
     */
    parse(input: Item, action: string) : Item {
        
        // Sanity check grab stored data - useful when deleting. 
        const existing = this.store.find(existing => existing.id === input.id);
        if (existing) { 
            input.id = input.id ?? existing.id
            input.name = input.name ?? existing.name
            input.type = input.type ?? existing.type
            input.value = input.value ?? existing.value
        }
        
        // needs to be outside existing as it might be new
        input.action = action; 
        input.description = input.name + ': ' + action + 'd (' + input.value + ')';

        // Update our local store of the variable. 
        this.store = [input, ...this.store.filter(i => i.id !== input.id)]
        return input; 
    }
}