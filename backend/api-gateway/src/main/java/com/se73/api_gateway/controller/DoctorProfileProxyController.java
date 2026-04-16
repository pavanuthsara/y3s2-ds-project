package com.se73.api_gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
public class DoctorProfileProxyController {

	private static final String DOCTOR_SERVICE_BASE_URL = "http://localhost:8083/api/doctors";

	private final RestTemplate restTemplate;

	public DoctorProfileProxyController(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}

	@GetMapping
	public ResponseEntity<?> getAllDoctorProfiles(HttpServletRequest request) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return restTemplate.exchange(
				DOCTOR_SERVICE_BASE_URL,
				HttpMethod.GET,
				entity,
				Object.class
		);
	}

	@GetMapping("/profile")
	public ResponseEntity<?> getOwnDoctorProfile(HttpServletRequest request) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return restTemplate.exchange(
				DOCTOR_SERVICE_BASE_URL + "/profile",
				HttpMethod.GET,
				entity,
				Object.class
		);
	}

	@GetMapping("/{doctorUsername}/profile")
	public ResponseEntity<?> getDoctorProfile(
			HttpServletRequest request,
			@PathVariable String doctorUsername
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return restTemplate.exchange(
				DOCTOR_SERVICE_BASE_URL + "/" + doctorUsername + "/profile",
				HttpMethod.GET,
				entity,
				Object.class
		);
	}

	@PutMapping("/profile")
	public ResponseEntity<?> upsertOwnDoctorProfile(
			HttpServletRequest request,
			@RequestBody Map<String, Object> body
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

		return restTemplate.exchange(
				DOCTOR_SERVICE_BASE_URL + "/profile",
				HttpMethod.PUT,
				entity,
				Object.class
		);
	}

	@PutMapping("/{doctorUsername}/profile")
	public ResponseEntity<?> upsertDoctorProfile(
			HttpServletRequest request,
			@PathVariable String doctorUsername,
			@RequestBody Map<String, Object> body
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

		return restTemplate.exchange(
				DOCTOR_SERVICE_BASE_URL + "/" + doctorUsername + "/profile",
				HttpMethod.PUT,
				entity,
				Object.class
		);
	}

	@DeleteMapping("/{doctorUsername}")
	public ResponseEntity<?> deleteDoctorProfile(
			HttpServletRequest request,
			@PathVariable String doctorUsername
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return restTemplate.exchange(
				DOCTOR_SERVICE_BASE_URL + "/" + doctorUsername,
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
