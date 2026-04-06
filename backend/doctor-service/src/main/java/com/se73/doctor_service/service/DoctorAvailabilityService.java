package com.se73.doctor_service.service;

import com.se73.doctor_service.dto.AvailabilitySlotRequest;
import com.se73.doctor_service.model.DoctorAvailabilitySlot;
import com.se73.doctor_service.repository.DoctorAvailabilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class DoctorAvailabilityService {
	private final DoctorAvailabilityRepository repository;

	public DoctorAvailabilityService(DoctorAvailabilityRepository repository) {
		this.repository = repository;
	}

	public List<DoctorAvailabilitySlot> getAvailability(String doctorUsername) {
		return repository.findByDoctorUsernameOrderByDayOfWeekAscStartTimeAsc(doctorUsername);
	}

	public List<DoctorAvailabilitySlot> replaceAvailability(String doctorUsername, List<AvailabilitySlotRequest> requests) {
		validateDoctorUsername(doctorUsername);
		validateSlotRequests(requests);

		List<DoctorAvailabilitySlot> slots = mapRequests(doctorUsername, requests);
		validateNoOverlapsWithinBatch(slots);

		repository.deleteByDoctorUsername(doctorUsername);
		return repository.saveAll(slots);
	}

	public DoctorAvailabilitySlot addSlot(String doctorUsername, AvailabilitySlotRequest request) {
		validateDoctorUsername(doctorUsername);
		validateSlotRequest(request);

		DoctorAvailabilitySlot slot = mapRequest(doctorUsername, request);
		validateNoOverlapWithExisting(slot, null);
		return repository.save(slot);
	}

	public void deleteSlot(String doctorUsername, UUID slotId) {
		validateDoctorUsername(doctorUsername);
		DoctorAvailabilitySlot slot = repository.findByIdAndDoctorUsername(slotId, doctorUsername)
				.orElseThrow(() -> new IllegalArgumentException("Availability slot not found"));
		repository.delete(slot);
	}

	private List<DoctorAvailabilitySlot> mapRequests(String doctorUsername, List<AvailabilitySlotRequest> requests) {
		List<DoctorAvailabilitySlot> slots = new ArrayList<>();
		for (AvailabilitySlotRequest request : requests) {
			slots.add(mapRequest(doctorUsername, request));
		}
		return slots;
	}

	private DoctorAvailabilitySlot mapRequest(String doctorUsername, AvailabilitySlotRequest request) {
		validateSlotRequest(request);
		DoctorAvailabilitySlot slot = new DoctorAvailabilitySlot();
		slot.setDoctorUsername(doctorUsername);
		slot.setDayOfWeek(request.getDayOfWeek());
		slot.setStartTime(request.getStartTime());
		slot.setEndTime(request.getEndTime());
		slot.setActive(request.getActive() == null || request.getActive());
		return slot;
	}

	private void validateDoctorUsername(String doctorUsername) {
		if (!StringUtils.hasText(doctorUsername)) {
			throw new IllegalArgumentException("Doctor identity is required");
		}
	}

	private void validateSlotRequests(List<AvailabilitySlotRequest> requests) {
		if (requests == null || requests.isEmpty()) {
			throw new IllegalArgumentException("At least one availability slot is required");
		}

		for (AvailabilitySlotRequest request : requests) {
			validateSlotRequest(request);
		}
	}

	private void validateSlotRequest(AvailabilitySlotRequest request) {
		if (request == null) {
			throw new IllegalArgumentException("Availability slot payload is required");
		}

		DayOfWeek dayOfWeek = request.getDayOfWeek();
		LocalTime startTime = request.getStartTime();
		LocalTime endTime = request.getEndTime();

		if (dayOfWeek == null || startTime == null || endTime == null) {
			throw new IllegalArgumentException("Day, start time, and end time are required");
		}

		if (!startTime.isBefore(endTime)) {
			throw new IllegalArgumentException("Start time must be before end time");
		}
	}

	private void validateNoOverlapWithExisting(DoctorAvailabilitySlot candidate, UUID excludeId) {
		List<DoctorAvailabilitySlot> existingSlots = repository
				.findByDoctorUsernameAndDayOfWeekOrderByStartTimeAsc(candidate.getDoctorUsername(), candidate.getDayOfWeek());

		for (DoctorAvailabilitySlot existing : existingSlots) {
			if (excludeId != null && excludeId.equals(existing.getId())) {
				continue;
			}

			if (!existing.isActive()) {
				continue;
			}

			if (overlaps(candidate.getStartTime(), candidate.getEndTime(), existing.getStartTime(), existing.getEndTime())) {
				throw new IllegalArgumentException("Availability slot overlaps with an existing slot");
			}
		}
	}

	private void validateNoOverlapsWithinBatch(List<DoctorAvailabilitySlot> slots) {
		slots.stream()
				.filter(DoctorAvailabilitySlot::isActive)
				.collect(java.util.stream.Collectors.groupingBy(DoctorAvailabilitySlot::getDayOfWeek))
				.forEach((dayOfWeek, daySlots) -> {
					daySlots.sort(Comparator.comparing(DoctorAvailabilitySlot::getStartTime));
					for (int i = 1; i < daySlots.size(); i++) {
						DoctorAvailabilitySlot previous = daySlots.get(i - 1);
						DoctorAvailabilitySlot current = daySlots.get(i);
						if (overlaps(current.getStartTime(), current.getEndTime(), previous.getStartTime(), previous.getEndTime())) {
							throw new IllegalArgumentException("Availability slots in the same day cannot overlap");
						}
					}
				});
	}

	private boolean overlaps(LocalTime startOne, LocalTime endOne, LocalTime startTwo, LocalTime endTwo) {
		return startOne.isBefore(endTwo) && endOne.isAfter(startTwo);
	}
}