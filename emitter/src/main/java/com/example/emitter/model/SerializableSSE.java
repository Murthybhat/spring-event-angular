package com.example.emitter.model;

import java.io.Serializable;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public class SerializableSSE extends SseEmitter  implements Serializable{

    public SerializableSSE() {
    }

    public SerializableSSE(Long timeout) {
        super(timeout);
    }
}