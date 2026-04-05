package com.se73.auth_service.availability;

import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository repository;

    public DoctorAvailabilityService(DoctorAvailabilityRepository repository) {
        this.repository = repository;
    }

    public List<DoctorAvailabilitySlot> getAvailability(String doctorUsername) {
        return repository.findByDoctorUsernameOrderByDayOfWeekAscStartTimeAsc(doctorUsername);
    }

    public List<DoctorAvailabilitySlot> replaceAvailability(String doctorUsername, List<AvailabilitySlotRequest> slotRequests) {
        validateNoOverlaps(slotRequests);

        repository.deleteByDoctorUsername(doctorUsername);
        List<DoctorAvailabilitySlot> slots = slotRequests.stream()
                .map(slotRequest -> toEntity(doctorUsername, slotRequest))
                .toList();

        return repository.saveAll(slots);
    }

    public DoctorAvailabilitySlot addSlot(String doctorUsername, AvailabilitySlotRequest slotRequest) {
        validateSlotTimes(slotRequest);

        List<DoctorAvailabilitySlot> sameDaySlots = repository.findByDoctorUsernameAndDayOfWeekOrderByStartTimeAsc(
                doctorUsername,
                slotRequest.getDayOfWeek()
        );

        LocalTime candidateStart = slotRequest.getStartTime();
        LocalTime candidateEnd = slotRequest.getEndTime();

        for (DoctorAvailabilitySlot existingSlot : sameDaySlots) {
            if (isOverlapping(candidateStart, candidateEnd, existingSlot.getStartTime(), existingSlot.getEndTime())) {
                throw new IllegalArgumentException("Time slot overlaps with an existing slot");
            }
        }

        return repository.save(toEntity(doctorUsername, slotRequest));
    }

    public void deleteSlot(String doctorUsername, Long slotId) {
        DoctorAvailabilitySlot slot = repository.findByIdAndDoctorUsername(slotId, doctorUsername)
                .orElseThrow(() -> new IllegalArgumentException("Availability slot not found"));

        repository.delete(slot);
    }

    private DoctorAvailabilitySlot toEntity(String doctorUsername, AvailabilitySlotRequest slotRequest) {
        DoctorAvailabilitySlot slot = new DoctorAvailabilitySlot();
        slot.setDoctorUsername(doctorUsername);
        slot.setDayOfWeek(slotRequest.getDayOfWeek());
        slot.setStartTime(slotRequest.getStartTime());
        slot.setEndTime(slotRequest.getEndTime());
        slot.setActive(true);
        return slot;
    }

    private void validateNoOverlaps(List<AvailabilitySlotRequest> slotRequests) {
        if (slotRequests == null) {
            throw new IllegalArgumentException("Slots list is required");
        }

        List<AvailabilitySlotRequest> sortedSlots = new ArrayList<>(slotRequests);
        sortedSlots.sort(Comparator
                .comparing(AvailabilitySlotRequest::getDayOfWeek)
                .thenComparing(AvailabilitySlotRequest::getStartTime));

        for (AvailabilitySlotRequest slotRequest : sortedSlots) {
            validateSlotTimes(slotRequest);
        }

        for (int i = 1; i < sortedSlots.size(); i++) {
            AvailabilitySlotRequest previous = sortedSlots.get(i - 1);
            AvailabilitySlotRequest current = sortedSlots.get(i);

            if (previous.getDayOfWeek() == current.getDayOfWeek() &&
                    isOverlapping(previous.getStartTime(), previous.getEndTime(), current.getStartTime(), current.getEndTime())) {
                throw new IllegalArgumentException("Availability slots contain overlap on " + current.getDayOfWeek());
            }
        }
    }

    private void validateSlotTimes(AvailabilitySlotRequest slotRequest) {
        if (slotRequest.getDayOfWeek() == null || slotRequest.getStartTime() == null || slotRequest.getEndTime() == null) {
            throw new IllegalArgumentException("Day, start time and end time are required");
        }

        if (!slotRequest.getStartTime().isBefore(slotRequest.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private boolean isOverlapping(LocalTime startA, LocalTime endA, LocalTime startB, LocalTime endB) {
        return startA.isBefore(endB) && startB.isBefore(endA);
    }
}
