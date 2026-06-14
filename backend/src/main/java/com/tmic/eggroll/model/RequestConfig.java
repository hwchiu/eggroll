package com.tmic.eggroll.model;

import java.util.List;

public record RequestConfig(
    String id,
    String name,
    String description,
    String method,         // GET | POST | PUT | PATCH | DELETE
    String url,
    List<KeyValuePair> queryParams,
    List<KeyValuePair> pathParams,
    List<KeyValuePair> headers,
    String bodyType,       // "none" | "json" | "form"
    String bodyJson,
    AuthConfig auth
) {}
