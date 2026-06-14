package com.tmic.eggroll.service;

import com.tmic.eggroll.model.*;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ProxyServiceTest {

    @Test
    void buildUrl_appendsEnabledQueryParams() {
        ProxyService svc = new ProxyService(null);
        RequestConfig cfg = new RequestConfig(
            "id", "test", null, "GET",
            "https://example.com/api",
            List.of(
                new KeyValuePair("1", "foo", "bar", true),
                new KeyValuePair("2", "skip", "x", false)
            ),
            List.of(), List.of(), "none", null,
            new AuthConfig("none", null, null, null, null, null)
        );
        String url = svc.buildUrl(cfg);
        assertThat(url).isEqualTo("https://example.com/api?foo=bar");
    }

    @Test
    void buildUrl_replacesPathParams() {
        ProxyService svc = new ProxyService(null);
        RequestConfig cfg = new RequestConfig(
            "id", "test", null, "GET",
            "https://example.com/api/{version}/data",
            List.of(),
            List.of(new KeyValuePair("1", "version", "v2", true)),
            List.of(), "none", null,
            new AuthConfig("none", null, null, null, null, null)
        );
        String url = svc.buildUrl(cfg);
        assertThat(url).isEqualTo("https://example.com/api/v2/data");
    }

    @Test
    void buildHeaders_addsBearerToken() {
        ProxyService svc = new ProxyService(null);
        RequestConfig cfg = new RequestConfig(
            "id", "test", null, "GET", "https://example.com",
            List.of(), List.of(), List.of(), "none", null,
            new AuthConfig("bearer", "mytoken123", null, null, null, null)
        );
        var headers = svc.buildHeaders(cfg);
        assertThat(headers).containsEntry("Authorization", "Bearer mytoken123");
    }

    @Test
    void buildHeaders_addsBasicAuth() {
        ProxyService svc = new ProxyService(null);
        RequestConfig cfg = new RequestConfig(
            "id", "test", null, "GET", "https://example.com",
            List.of(), List.of(), List.of(), "none", null,
            new AuthConfig("basic", null, "user", "pass", null, null)
        );
        var headers = svc.buildHeaders(cfg);
        // Base64("user:pass") = "dXNlcjpwYXNz"
        assertThat(headers).containsEntry("Authorization", "Basic dXNlcjpwYXNz");
    }

    @Test
    void buildHeaders_addsApiKey() {
        ProxyService svc = new ProxyService(null);
        RequestConfig cfg = new RequestConfig(
            "id", "test", null, "GET", "https://example.com",
            List.of(), List.of(), List.of(), "none", null,
            new AuthConfig("api_key", null, null, null, "X-Token", "secret")
        );
        var headers = svc.buildHeaders(cfg);
        assertThat(headers).containsEntry("X-Token", "secret");
    }
}
