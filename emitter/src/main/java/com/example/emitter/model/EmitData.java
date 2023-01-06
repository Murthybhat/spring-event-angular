package com.example.emitter.model;

public class EmitData {

	private final long id;
	private final String content;

	public EmitData(long id, String content) {
		this.id = id;
		this.content = content;
	}

	public long getId() {
		return id;
	}

	public String getContent() {
		return content;
	}
}