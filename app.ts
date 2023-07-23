import Homey, { ApiApp } from 'homey';
import { HomeyAPIV3Local as HomeyAPI } from 'homey-api'
import Logic from './lib/logic';

import type {
  Flows
} from './types'

class App extends Homey.App {

  api!: HomeyAPI
  logic!: Logic
  flows!: Flows

  async onInit() {
    await this.initApi(); 
    await this.initFlows(); 

    try {
      this.logic = new Logic(this.api, this.flows); 
      this.logic.initialize();
    } catch (e) {
      this.error(e); 
    }
  }

  /**
   * Create on first call
   */
  async initApi(): Promise<HomeyAPI> {
    if (!this.api) {
      this.api = await HomeyAPI.createAppAPI({
        homey: this.homey,
      });
    }
    return this.api;
  }

  /**
   * Initialise the apps flows. 
   */
  async initFlows() {
    this.flows = {
      triggers: {
        variable: this.homey.flow.getTriggerCard('variable'),
      }
    }
  }
}

module.exports = App;