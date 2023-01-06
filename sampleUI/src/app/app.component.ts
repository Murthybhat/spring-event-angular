import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { SseFluxService } from './sseflux.service';
import { SseService } from './sse.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Streaming';
  private sseStream: Subscription;
  private fluxStream: Subscription;
  messages: Array<string> = [];
  status=null;

  constructor(private zone: NgZone,
    private sseFluxService: SseFluxService,
    private sseService: SseService) {
  }

  ngOnInit() {
  }

  subscribeSSE() {
    // Subscribe for basic SSE emitter (without flux)
    this.sseStream = this.sseService.subscribeEmitter()
      .subscribe(message => {
        this.zone.run(() => {
          this.messages.push('From emitter :' + message);
        });
      });
  }

  subscribeFlux() {
    // Subscribe for stream which uses flux
    this.fluxStream = this.sseFluxService.subscribeFlux()
      .subscribe(message => {
        this.zone.run(() => {
          this.messages.push('From Flux :' + message);
        });
      });
  }

  triggerSSE() {
    this.sseService.triggerSSEEvent()
      .subscribe(response => {
        this.status='SSE Triggered';
      });
  }

  triggerFlux() {
    this.sseFluxService.triggerFlux()
      .subscribe(response => {
        this.status='Flux Triggered';
      });

  }


  ngOnDestroy() {
    if (this.sseStream) {
      this.sseStream.unsubscribe();
    }
    if (this.fluxStream) {
      this.fluxStream.unsubscribe();
    }
  }
}
