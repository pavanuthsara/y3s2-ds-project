package com.se73.patient_service.dto;

import com.se73.patient_service.model.MedicalReport;

import java.time.LocalDateTime;

public class MedicalReportResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String description;
    private LocalDateTime uploadedAt;
    private String downloadUrl;

    public MedicalReportResponse(MedicalReport report, String downloadUrl) {
        this.id = report.getId();
        this.fileName = report.getFileName();
        this.fileType = report.getFileType();
        this.fileSize = report.getFileSize();
        this.description = report.getDescription();
        this.uploadedAt = report.getUploadedAt();
        this.downloadUrl = downloadUrl;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }
}
