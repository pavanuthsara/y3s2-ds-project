package com.se73.api_gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
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
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors/availability")
public class DoctorAvailabilityProxyController {

	private static final String DOCTOR_SERVICE_AVAILABILITY_URL = "http://localhost:8083/api/doctors/availability";

	private final RestTemplate restTemplate;

	public DoctorAvailabilityProxyController(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}

	@GetMapping("/all")
	public ResponseEntity<?> getAllAvailability(HttpServletRequest request) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return restTemplate.exchange(
				DOCTOR_SERVICE_AVAILABILITY_URL + "/all",
				HttpMethod.GET,
				entity,
				Object.class
		);
	}

	@GetMapping
	public ResponseEntity<?> getAvailability(HttpServletRequest request) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return restTemplate.exchange(
				DOCTOR_SERVICE_AVAILABILITY_URL,
				HttpMethod.GET,
				entity,
				Object.class
		);
	}

	@PutMapping
	public ResponseEntity<?> replaceAvailability(
			HttpServletRequest request,
			@RequestBody Map<String, Object> body
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

		return restTemplate.exchange(
				DOCTOR_SERVICE_AVAILABILITY_URL,
				HttpMethod.PUT,
				entity,
				Object.class
		);
	}

	@PostMapping("/slots")
	public ResponseEntity<?> addAvailabilitySlot(
			HttpServletRequest request,
			@RequestBody Map<String, Object> body
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

		return restTemplate.exchange(
				DOCTOR_SERVICE_AVAILABILITY_URL + "/slots",
				HttpMethod.POST,
				entity,
				Object.class
		);
	}

	@DeleteMapping("/slots/{slotId}")
	public ResponseEntity<?> deleteAvailabilitySlot(
			HttpServletRequest request,
			@PathVariable UUID slotId
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return restTemplate.exchange(
				DOCTOR_SERVICE_AVAILABILITY_URL + "/slots/" + slotId,
				HttpMethod.DELETE,
				entity,
				Object.class
		);
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
