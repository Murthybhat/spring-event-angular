
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http'

declare var EventSource;

@Injectable({
    providedIn: 'root',
})

export class SseFluxService {
    private _reqOptionsArgs = { headers: new HttpHeaders().set('Content-Type', 'application/json') };
    private readonly _coinbase = '/coinbase';

    constructor(private _zone: NgZone, private http: HttpClient) {
    }

    triggerFlux(): Observable<any> {
        return this.http.get('http://localhost:8081/sse-server/emit/johndoe', this._reqOptionsArgs);
    }


    subscribeFlux(): Observable<string> {
        return new Observable<string>(observer => {
            let eventSource = new EventSource('http://localhost:8081/sse-server/subscribe/johndoe');
            console.log(eventSource);
            eventSource.onmessage = (event) => {
                // console.log('Received event: ', event.data);
                // let json = JSON.parse(event.data);
                observer.next(event.data);
            };
            eventSource.onerror = (error) => {
                // readyState === 0 (closed) means the remote source closed the connection,
                // so we can safely treat it as a normal situation. Another way 
                // of detecting the end of the stream is to insert a special element
                // in the stream of events, which the client can identify as the last one.
                if (eventSource.readyState === 0) {
                    console.log('The stream has been closed by the server.');
                    eventSource.close();
                    observer.complete();
                } else {
                    observer.error('EventSource error: ' + error);
                }
            }
        });
    }
}