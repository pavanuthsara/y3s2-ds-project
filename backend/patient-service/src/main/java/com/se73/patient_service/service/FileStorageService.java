package com.se73.patient_service.service;

import com.se73.patient_service.model.MedicalReport;
import com.se73.patient_service.repository.MedicalReportRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
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
            // Use a patient-scoped key so reports are easy to isolate and clean up.
            String originalFileName = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFileName);
            String uniqueFileName = patientId + "_" + UUID.randomUUID() + "." + fileExtension;
            String s3Key = "reports/" + patientId + "/" + uniqueFileName;

            // Upload raw bytes to S3; only the metadata is kept in PostgreSQL.
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromBytes(file.getBytes())
            );

            // Save enough metadata for listing, downloading, and deleting the file later.
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

            String s3Key = extractS3Key(report.getMinioPath());

            // Remove the object from storage first so the database does not point to a missing file.
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

            // Then remove the metadata row.
            medicalReportRepository.deleteById(reportId);

        } catch (S3Exception e) {
            throw new RuntimeException("S3 error: " + e.getMessage(), e);
        }
    }

    public DownloadedFile downloadFile(Long reportId, Long patientId) {
        try {
            MedicalReport report = medicalReportRepository.findByIdAndPatientId(reportId, patientId)
                    .orElseThrow(() -> new RuntimeException("Report not found"));

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(extractS3Key(report.getMinioPath()))
                    .build();

            try (ResponseInputStream<GetObjectResponse> objectStream = s3Client.getObject(getObjectRequest)) {
                byte[] fileBytes = objectStream.readAllBytes();
                // Fall back to file-name-based inference when S3 does not return a content type.
                String contentType = objectStream.response().contentType();
                if (contentType == null || contentType.isBlank()) {
                    contentType = inferContentType(report.getFileName());
                }
                return new DownloadedFile(report.getFileName(), contentType, fileBytes);
            }
        } catch (S3Exception e) {
            throw new RuntimeException("S3 error: " + e.getMessage(), e);
        } catch (IOException e) {
            throw new RuntimeException("IO error: " + e.getMessage(), e);
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

    private String extractS3Key(String s3Path) {
        if (s3Path == null || s3Path.isEmpty()) {
            return s3Path;
        }

        if (s3Path.startsWith("s3://")) {
            String withoutScheme = s3Path.substring(5);
            int slashIndex = withoutScheme.indexOf('/');
            if (slashIndex >= 0) {
                return withoutScheme.substring(slashIndex + 1);
            }
        }

        return s3Path;
    }

    private String inferContentType(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "txt" -> "text/plain";
            default -> "application/octet-stream";
        };
    }

    public record DownloadedFile(String fileName, String contentType, byte[] content) {
    }
}
