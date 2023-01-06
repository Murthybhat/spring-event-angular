package com.example.webflux.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import reactor.core.publisher.Sinks.EmitResult;
import reactor.core.publisher.Sinks.Many;

@RestController
@RequestMapping("/sse-server")
public class WebFluxStreamingController {
	final AtomicLong counter;
	Map<String, Sinks.Many> sinkMap = new HashMap<>();

	public WebFluxStreamingController() {
		this.counter = new AtomicLong();
	}

	@RequestMapping(value = "/subscribe/{userid}", method = RequestMethod.GET, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public Flux<ServerSentEvent> sse(@PathVariable("userid") String userid) {
		Many<Object> sink = Sinks.many().multicast().onBackpressureBuffer();
		try {
			sinkMap.put(userid, sink);
//			sink.onCompletion(() -> this.emitterMap.remove(userName));
//			sink.onTimeout(() -> this.emitterMap.remove(userName));
		} catch (Exception e) {
			e.printStackTrace();
		}
		return sink.asFlux().map(e -> ServerSentEvent.builder(e).build());
	}

	@GetMapping("/emit/{username}")
	public void emit(@PathVariable("username") String userName) {
		Many newSink = sinkMap.get(userName);
		EmitResult result = newSink.tryEmitNext("Hello " + userName + " #" + counter.getAndIncrement());

		if (result.isFailure()) {
			// do something here, since emission failed
		}

		return;
	}

}