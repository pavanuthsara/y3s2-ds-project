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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
public class DoctorProfileProxyController {

	private final RestTemplate restTemplate;
	private final String doctorServiceBaseUrl;

	public DoctorProfileProxyController(
			RestTemplate restTemplate,
			@Value("${services.doctor.base-url}") String doctorServiceBaseUrl
	) {
		this.restTemplate = restTemplate;
		this.doctorServiceBaseUrl = doctorServiceBaseUrl;
	}

	@GetMapping
	public ResponseEntity<?> getAllDoctorProfiles(HttpServletRequest request) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return forwardRequest(doctorServiceBaseUrl, HttpMethod.GET, entity);
	}

	@GetMapping("/profile")
	public ResponseEntity<?> getOwnDoctorProfile(HttpServletRequest request) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return forwardRequest(doctorServiceBaseUrl + "/profile", HttpMethod.GET, entity);
	}

	@GetMapping("/{doctorUsername}/profile")
	public ResponseEntity<?> getDoctorProfile(
			HttpServletRequest request,
			@PathVariable String doctorUsername
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return forwardRequest(doctorServiceBaseUrl + "/" + doctorUsername + "/profile", HttpMethod.GET, entity);
	}

	@PutMapping("/profile")
	public ResponseEntity<?> upsertOwnDoctorProfile(
			HttpServletRequest request,
			@RequestBody Map<String, Object> body
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

		return forwardRequest(doctorServiceBaseUrl + "/profile", HttpMethod.PUT, entity);
	}

	@PutMapping("/{doctorUsername}/profile")
	public ResponseEntity<?> upsertDoctorProfile(
			HttpServletRequest request,
			@PathVariable String doctorUsername,
			@RequestBody Map<String, Object> body
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

		return forwardRequest(doctorServiceBaseUrl + "/" + doctorUsername + "/profile", HttpMethod.PUT, entity);
	}

	@DeleteMapping("/{doctorUsername}")
	public ResponseEntity<?> deleteDoctorProfile(
			HttpServletRequest request,
			@PathVariable String doctorUsername
	) {
		HttpHeaders headers = buildForwardHeaders(request);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		return forwardRequest(doctorServiceBaseUrl + "/" + doctorUsername, HttpMethod.DELETE, entity);
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
