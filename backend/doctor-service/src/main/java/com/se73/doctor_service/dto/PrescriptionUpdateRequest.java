package com.se73.doctor_service.dto;

import jakarta.validation.constraints.NotBlank;

public class PrescriptionUpdateRequest {
	@NotBlank
	private String medication;

	@NotBlank
	private String dosage;

	@NotBlank
	private String instructions;

	private String notes;

	public String getMedication() {
		return medication;
	}

	public void setMedication(String medication) {
		this.medication = medication;
	}

	public String getDosage() {
		return dosage;
	}

	public void setDosage(String dosage) {
		this.dosage = dosage;
	}

	public String getInstructions() {
		return instructions;
	}

	public void setInstructions(String instructions) {
		this.instructions = instructions;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}
}