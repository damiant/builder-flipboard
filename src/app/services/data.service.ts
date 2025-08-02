import { Injectable } from '@angular/core';
import { Arts, Camps, Events } from './data.model';
import { BoardEvent } from '../line/line';
import { set, get, clear } from 'idb-keyval';

interface BoardLocation {
    name: string;
    street: string;
}

@Injectable({
    providedIn: 'root'
})
export class DataService {
    data: BoardEvent[] = [];
    constructor() { }

    async load() {
        const json = await get('boardEvents');
        if (json) {
            this.data = JSON.parse(json);
        } else {
            await this.downloadData();
        }
    }

    async downloadData() {
        try {
            const events: Events = await this.get('https://api.dust.events/static/ttitd-2025/events.json');
            const camps: Camps = await this.get('https://api.dust.events/static/ttitd-2025/camps.json');
            const arts: Arts = await this.get('https://api.dust.events/static/ttitd-2025/art.json');
            const result: BoardEvent[] = [];
            for (const event of events) {
                const location = this.getLocation(event.located_at_art, event.hosted_by_camp, event.other_location, camps, arts);

                for (const occurrence of event.occurrence_set) {
                    const boardEvent: BoardEvent = {
                        time: occurrence.start_time,
                        title: event.title,
                        location: location.name,
                        directions: location.street,
                        start: new Date(occurrence.start_time),
                        end: new Date(occurrence.end_time)
                    };
                    result.push(boardEvent);
                }

            }
            await set('boardEvents', JSON.stringify(result));

        } catch (error) {
            console.error('Error downloading data:', error);
        }
    }

    private getLocation(artUid: string | undefined, campUid: string | undefined, otherLocation: string | undefined, camps: Camps, arts: Arts): BoardLocation {
        if (artUid) {
            const art = arts.find(a => a.uid === artUid);
            return { name: art?.name || 'Unknown', street: art?.location_string || 'Unknown' };
        } else if (campUid) {
            const camp = camps.find(c => c.uid === campUid);
            return { name: camp?.name || 'Unknown', street: camp?.location_string || 'Unknown' };
        } else if (otherLocation) {
            return { name: otherLocation, street: '' };
        }
        return { name: 'Unknown', street: 'Unknown' };
    }

    async get(url: string): Promise<any> {
        const response = await fetch(url);
        return await response.json();
    }
}