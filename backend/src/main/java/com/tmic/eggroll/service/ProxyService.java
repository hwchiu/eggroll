package com.tmic.eggroll.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tmic.eggroll.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProxyService {

    private static final Logger log = LoggerFactory.getLogger(ProxyService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;

    public ProxyService(RestClient restClient) {
        this.restClient = restClient;
    }

    public ApiResponse proxy(RequestConfig config) {
        String url = buildUrl(config);
        Map<String, String> headers = buildHeaders(config);
        long start = System.currentTimeMillis();

        try {
            HttpMethod method = HttpMethod.valueOf(config.method());

            var spec = restClient.method(method).uri(url);

            for (var entry : headers.entrySet()) {
                spec = spec.header(entry.getKey(), entry.getValue());
            }

            if ("json".equals(config.bodyType()) && config.bodyJson() != null) {
                spec = spec.contentType(MediaType.APPLICATION_JSON)
                           .body(config.bodyJson());
            } else if ("form".equals(config.bodyType())) {
                String formBody = buildFormBody(config);
                spec = spec.contentType(MediaType.APPLICATION_FORM_URLENCODED)
                           .body(formBody);
            }

            ResponseEntity<String> response = spec.retrieve()
                .toEntity(String.class);

            long durationMs = System.currentTimeMillis() - start;
            Map<String, String> resHeaders = response.getHeaders().toSingleValueMap();
            Object body = tryParseJson(response.getBody(), resHeaders.getOrDefault("content-type", ""));

            return new ApiResponse(
                response.getStatusCode().value(),
                response.getStatusCode().toString(),
                resHeaders,
                body,
                durationMs,
                null
            );

        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            long durationMs = System.currentTimeMillis() - start;
            Map<String, String> resHeaders = ex.getResponseHeaders() != null
                ? ex.getResponseHeaders().toSingleValueMap()
                : Map.of();
            Object body = tryParseJson(ex.getResponseBodyAsString(),
                resHeaders.getOrDefault("content-type", ""));
            return new ApiResponse(
                ex.getStatusCode().value(),
                ex.getStatusText(),
                resHeaders,
                body,
                durationMs,
                null
            );
        } catch (Exception ex) {
            log.error("Proxy request failed: {}", ex.getMessage());
            return new ApiResponse(
                0,
                "Network Error",
                Map.of(),
                null,
                System.currentTimeMillis() - start,
                ex.getMessage()
            );
        }
    }

    String buildUrl(RequestConfig config) {
        String url = config.url();

        if (config.pathParams() != null) {
            for (KeyValuePair p : config.pathParams()) {
                if (p.enabled() && p.key() != null && !p.key().isBlank()) {
                    String encoded = URLEncoder.encode(p.value(), StandardCharsets.UTF_8);
                    url = url.replace("{" + p.key() + "}", encoded);
                    url = url.replace(":" + p.key(), encoded);
                }
            }
        }

        if (config.queryParams() != null) {
            String qs = config.queryParams().stream()
                .filter(p -> p.enabled() && p.key() != null && !p.key().isBlank())
                .map(p -> URLEncoder.encode(p.key(), StandardCharsets.UTF_8)
                        + "=" + URLEncoder.encode(p.value(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
            if (!qs.isBlank()) {
                url += (url.contains("?") ? "&" : "?") + qs;
            }
        }

        return url;
    }

    Map<String, String> buildHeaders(RequestConfig config) {
        Map<String, String> h = new LinkedHashMap<>();

        if (config.headers() != null) {
            for (KeyValuePair row : config.headers()) {
                if (row.enabled() && row.key() != null && !row.key().isBlank()) {
                    h.put(row.key(), row.value());
                }
            }
        }

        if (config.auth() != null) {
            switch (config.auth().type()) {
                case "bearer" -> {
                    if (config.auth().bearerToken() != null) {
                        h.put("Authorization", "Bearer " + config.auth().bearerToken());
                    }
                }
                case "basic" -> {
                    if (config.auth().basicUsername() != null) {
                        String creds = config.auth().basicUsername() + ":"
                            + (config.auth().basicPassword() != null ? config.auth().basicPassword() : "");
                        String encoded = Base64.getEncoder().encodeToString(
                            creds.getBytes(StandardCharsets.UTF_8));
                        h.put("Authorization", "Basic " + encoded);
                    }
                }
                case "api_key" -> {
                    if (config.auth().apiKeyValue() != null) {
                        String headerName = config.auth().apiKeyHeader() != null
                            ? config.auth().apiKeyHeader() : "X-API-Key";
                        h.put(headerName, config.auth().apiKeyValue());
                    }
                }
            }
        }

        return h;
    }

    private String buildFormBody(RequestConfig config) {
        if (config.queryParams() == null) return "";
        return config.queryParams().stream()
            .filter(p -> p.enabled() && p.key() != null && !p.key().isBlank())
            .map(p -> URLEncoder.encode(p.key(), StandardCharsets.UTF_8)
                    + "=" + URLEncoder.encode(p.value(), StandardCharsets.UTF_8))
            .collect(Collectors.joining("&"));
    }

    private Object tryParseJson(String body, String contentType) {
        if (body == null) return null;
        if (contentType.contains("application/json")) {
            try {
                return objectMapper.readValue(body, Object.class);
            } catch (Exception e) {
                return body;
            }
        }
        return body;
    }
}
