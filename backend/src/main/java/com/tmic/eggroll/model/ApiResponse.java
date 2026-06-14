package com.tmic.eggroll.model;

import java.util.Map;

public record ApiResponse(
    int status,
    String statusText,
    Map<String, String> headers,
    Object body,
    long durationMs,
    String error
) {}
