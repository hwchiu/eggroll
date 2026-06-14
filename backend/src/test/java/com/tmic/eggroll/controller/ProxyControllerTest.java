package com.tmic.eggroll.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tmic.eggroll.model.*;
import com.tmic.eggroll.service.ProxyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProxyController.class)
class ProxyControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    ProxyService proxyService;

    @Test
    void proxy_returns200WithApiResponse() throws Exception {
        RequestConfig req = new RequestConfig(
            "id", "test", null, "GET",
            "https://example.com/api",
            List.of(), List.of(), List.of(), "none", null,
            new AuthConfig("none", null, null, null, null, null)
        );

        ApiResponse mockResp = new ApiResponse(
            200, "OK",
            Map.of("content-type", "application/json"),
            Map.of("result", "ok"),
            123L, null
        );

        when(proxyService.proxy(any(RequestConfig.class))).thenReturn(mockResp);

        mockMvc.perform(post("/api/eggroll/proxy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(200))
            .andExpect(jsonPath("$.statusText").value("OK"))
            .andExpect(jsonPath("$.durationMs").value(123));
    }

    @Test
    void proxy_returns400WhenUrlMissing() throws Exception {
        RequestConfig req = new RequestConfig(
            "id", "test", null, "GET",
            "",  // empty URL
            List.of(), List.of(), List.of(), "none", null,
            new AuthConfig("none", null, null, null, null, null)
        );

        mockMvc.perform(post("/api/eggroll/proxy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest());
    }
}
