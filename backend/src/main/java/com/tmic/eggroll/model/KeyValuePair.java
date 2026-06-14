package com.tmic.eggroll.model;

public record KeyValuePair(
    String id,
    String key,
    String value,
    boolean enabled
) {}
