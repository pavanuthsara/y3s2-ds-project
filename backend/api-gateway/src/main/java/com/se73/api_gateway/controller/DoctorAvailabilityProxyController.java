package com.se73.api_gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors/availability")
public class DoctorAvailabilityProxyController {

	private final RestTemplate restTemplate;
	private final String doctorServiceAvailabilityUrl;

	public DoctorAvailabilityProxyController(
			RestTemplate restTemplate,
			@Value("${services.doctor.base-url}") String doctorServiceBaseUrl
	) {
		this.restTemplate = restTemplate;
		this.doctorServiceAvailabilityUrl = doctorServiceBaseUrl + "/availability";
	}

	@GetMapping("/all")
	public ResponseEntity<?> getAllAvailability(HttpServletRequest request) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return forwardRequest(doctorServiceAvailabilityUrl + "/all", HttpMethod.GET, entity);
	}

	@GetMapping
	public ResponseEntity<?> getAvailability(HttpServletRequest request) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return forwardRequest(doctorServiceAvailabilityUrl, HttpMethod.GET, entity);
	}

	@PutMapping
	public ResponseEntity<?> replaceAvailability(
			HttpServletRequest request,
			@RequestBody Map<String, Object> body
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

		return forwardRequest(doctorServiceAvailabilityUrl, HttpMethod.PUT, entity);
	}

	@PostMapping("/slots")
	public ResponseEntity<?> addAvailabilitySlot(
			HttpServletRequest request,
			@RequestBody Map<String, Object> body
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

		return forwardRequest(doctorServiceAvailabilityUrl + "/slots", HttpMethod.POST, entity);
	}

	@DeleteMapping("/slots/{slotId}")
	public ResponseEntity<?> deleteAvailabilitySlot(
			HttpServletRequest request,
			@PathVariable UUID slotId
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return forwardRequest(doctorServiceAvailabilityUrl + "/slots/" + slotId, HttpMethod.DELETE, entity);
	}

	private ResponseEntity<?> forwardRequest(String url, HttpMethod method, HttpEntity<?> entity) {
		try {
			return restTemplate.exchange(url, method, entity, Object.class);
		} catch (RestClientResponseException ex) {
			return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
		}
	}

	private HttpHeaders buildForwardHeaders(HttpServletRequest request) {
		HttpHeaders headers = new HttpHeaders();

		String authorization = request.getHeader("Authorization");
		String userId = request.getHeader("X-User-Id");
		String userRole = request.getHeader("X-User-Role");

		if (authorization != null) {
			headers.set("Authorization", authorization);
		}
		if (userId != null) {
			headers.set("X-User-Id", userId);
		}
		if (userRole != null) {
			headers.set("X-User-Role", userRole);
		}

		return headers;
	}
}
