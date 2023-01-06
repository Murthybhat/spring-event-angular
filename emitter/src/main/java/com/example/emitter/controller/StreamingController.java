package com.example.emitter.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter.SseEventBuilder;

import com.example.emitter.model.EmitData;
import com.example.emitter.model.SerializableSSE;

@RestController
public class StreamingController {

	private static final String template = "Hello, %s!";
	private final AtomicLong counter = new AtomicLong();
	Map<String, SerializableSSE> emitterMap = new HashMap<String, SerializableSSE>();
//	SerializableSSE emitter = new SerializableSSE();


	@CrossOrigin
	@GetMapping("/subscription/{userName}")
	public SseEmitter subscribe(@PathVariable("userName") String userName) {
		System.out.println("subscription request");
		SerializableSSE emitter = new SerializableSSE();
		try {
			emitterMap.put(userName, emitter);
			emitter.onCompletion(() -> this.emitterMap.remove(userName));
			emitter.onTimeout(() -> this.emitterMap.remove(userName));
		} catch (Exception e) {
			e.printStackTrace();
		}

		return emitter;
	}

	@CrossOrigin
	@GetMapping("/emit/{userName}")
	public void emit(@PathVariable("userName") String userName) {
		System.out.println("Emit request");
		SseEmitter newEmitter = emitterMap.get(userName);

		SseEventBuilder eventBuilder = SseEmitter.event();
		EmitData emitData = new EmitData(counter.incrementAndGet(), String.format(template, userName));

		try {
			newEmitter.send(eventBuilder.data(emitData).name("message").id(String.valueOf(emitData.hashCode())));
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		return;
	}
	
}