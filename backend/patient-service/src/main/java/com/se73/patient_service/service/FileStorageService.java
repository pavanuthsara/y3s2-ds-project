package com.se73.patient_service.service;

import com.se73.patient_service.model.MedicalReport;
import com.se73.patient_service.repository.MedicalReportRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    private final S3Client s3Client;
    private final MedicalReportRepository medicalReportRepository;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public FileStorageService(S3Client s3Client, MedicalReportRepository medicalReportRepository) {
        this.s3Client = s3Client;
        this.medicalReportRepository = medicalReportRepository;
    }

    public MedicalReport uploadFile(Long patientId, MultipartFile file, String description) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            // Generate unique file key
            String originalFileName = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFileName);
            String uniqueFileName = patientId + "_" + UUID.randomUUID() + "." + fileExtension;
            String s3Key = "reports/" + patientId + "/" + uniqueFileName;

            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromBytes(file.getBytes())
            );

            // Save metadata to database
            MedicalReport report = new MedicalReport(
                    patientId,
                    originalFileName,
                    "s3://" + bucketName + "/" + s3Key,
                    getFileType(file.getContentType()),
                    file.getSize(),
                    description
            );

            return medicalReportRepository.save(report);

        } catch (S3Exception e) {
            throw new RuntimeException("S3 error: " + e.getMessage(), e);
        } catch (IOException e) {
            throw new RuntimeException("IO error: " + e.getMessage(), e);
        }
    }

    public void deleteFile(Long reportId, Long patientId) {
        try {
            MedicalReport report = medicalReportRepository.findByIdAndPatientId(reportId, patientId)
                    .orElseThrow(() -> new RuntimeException("Report not found"));

            // Extract S3 key from minioPath
            // Format: s3://bucket-name/reports/patientId/filename
            String s3Path = report.getMinioPath();
            String s3Key = s3Path.substring(s3Path.indexOf("/") + 1); // Remove s3://bucket/
            s3Key = s3Key.substring(s3Key.indexOf("/") + 1); // Remove bucket-name/

            // Delete from S3
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

            // Delete from database
            medicalReportRepository.deleteById(reportId);

        } catch (S3Exception e) {
            throw new RuntimeException("S3 error: " + e.getMessage(), e);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf(".") + 1);
        }
        return "unknown";
    }

    private String getFileType(String contentType) {
        if (contentType == null) {
            return "unknown";
        }
        if (contentType.contains("pdf")) {
            return "PDF";
        } else if (contentType.contains("image")) {
            return "IMAGE";
        } else if (contentType.contains("word") || contentType.contains("document")) {
            return "DOCUMENT";
        } else if (contentType.contains("sheet")) {
            return "SPREADSHEET";
        }
        return contentType;
    }
}
