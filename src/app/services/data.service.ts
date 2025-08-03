import { Injectable } from '@angular/core';
import { Arts, Camps, Events } from './data.model';
import { BoardEvent } from '../line/line';
import { set, get, clear } from 'idb-keyval';
import { CapacitorHttp } from '@capacitor/core';

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
        const json = await get('boardEvents2');
        if (json) {
            this.data = json;
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
                    const startDate = new Date(occurrence.start_time);
                    const endDate = new Date(occurrence.end_time);
                    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
                    
                    if (durationHours <= 6) {
                        const hours = startDate.getHours();
                        const minutes = startDate.getMinutes();
                        const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
                        
                        const boardEvent: BoardEvent = {
                            time: formattedTime,
                            title: event.title,
                            location: location.name,
                            directions: location.street,
                            start: new Date(occurrence.start_time),
                            end: new Date(occurrence.end_time)
                        };
                        
                        result.push(boardEvent);
                    }
                }

            }
            await set('boardEvents2', result);

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
        const response = await CapacitorHttp.get({ url });
        return await response.data;
    }
}