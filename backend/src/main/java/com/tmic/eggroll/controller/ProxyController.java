package com.tmic.eggroll.controller;

import com.tmic.eggroll.model.ApiResponse;
import com.tmic.eggroll.model.RequestConfig;
import com.tmic.eggroll.service.ProxyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/eggroll")
public class ProxyController {

    private final ProxyService proxyService;

    public ProxyController(ProxyService proxyService) {
        this.proxyService = proxyService;
    }

    @PostMapping("/proxy")
    public ResponseEntity<ApiResponse> proxy(@RequestBody RequestConfig config) {
        if (config.url() == null || config.url().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        ApiResponse response = proxyService.proxy(config);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ok");
    }
}
