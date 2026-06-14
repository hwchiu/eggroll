package com.tmic.eggroll.model;

public record AuthConfig(
    String type,           // "none" | "bearer" | "basic" | "api_key"
    String bearerToken,
    String basicUsername,
    String basicPassword,
    String apiKeyHeader,
    String apiKeyValue
) {}
