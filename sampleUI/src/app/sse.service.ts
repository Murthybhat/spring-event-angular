
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http'

declare var EventSource;
const SSE_RECONNECT_UPPER_LIMIT = 64;

@Injectable({
    providedIn: 'root',
})

export class SseService {
    private reqOptions = { headers: new HttpHeaders().set('Content-Type', 'text/plain') };
    eventSource: any;
    sseChannelUrl = 'http://localhost:8080/subscription/johndoe';
    CUSTOM_SSE_EVENTS = [];
    reconnectFrequencySec = 1;
    observer: any;


    constructor(private zone: NgZone, private http: HttpClient) {
    }

    // Creates SSE event source, handles SSE events
    subscribeEmitter(): any {
        return new Observable<string>(observer => {
            this.observer = observer;
            this.createSSEChannel();
        });
    }
    closeSseConnection() {
        if (this.eventSource) {
            this.eventSource.close();
        }
    }

    protected createSSEChannel() {
        // Close event source if current instance of SSE service has some
        if (this.eventSource) {
            this.closeSseConnection();
            this.eventSource = null;
        }

        // Open new channel, create new EventSource
        this.eventSource = new EventSource(this.sseChannelUrl);

        // Process default event
        this.eventSource.onmessage = (event: MessageEvent) => {
            this.zone.run(() => this.observer.next(event.data));
        };

        // Add custom events
        Object.keys(this.CUSTOM_SSE_EVENTS).forEach(key => {
            this.eventSource.addEventListener(this.CUSTOM_SSE_EVENTS[key], event => {
                this.zone.run(() => this.observer.next(event.data));
            });
        });

        // Process connection opened
        this.eventSource.onopen = () => {
            this.reconnectFrequencySec = 1;
        };

        // Process error
        this.eventSource.onerror = (error: any) => {

            this.reconnectOnError();
        };
    }

    // Handles reconnect attempts when the connection fails for some reason.   
    private reconnectOnError(): void {
        console.log('Reconnecting');
        this.closeSseConnection();
        clearTimeout(reconnectTimeout);
        var reconnectTimeout = setTimeout(() => {
            this.createSSEChannel();
            this.reconnectFrequencySec *= 2;
            if (this.reconnectFrequencySec >= SSE_RECONNECT_UPPER_LIMIT) {
                this.reconnectFrequencySec = SSE_RECONNECT_UPPER_LIMIT;
            }
        }, this.reconnectFrequencySec * 1000);
    }


    triggerSSEEvent() {
        return this.http.get('http://localhost:8080/emit/johndoe', this.reqOptions);
    }

}