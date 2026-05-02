package com.se73.patient_service.unit.service;

import com.se73.patient_service.model.MedicalReport;
import com.se73.patient_service.repository.MedicalReportRepository;
import com.se73.patient_service.service.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.AbortableInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayInputStream;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileStorageServiceTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private MedicalReportRepository medicalReportRepository;

    @InjectMocks
    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(fileStorageService, "bucketName", "patient-reports-damith-001");
    }

    @Test
    void uploadFileStoresObjectInS3AndSavesMetadata() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "lab-report.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "report-content".getBytes()
        );
        when(medicalReportRepository.save(any(MedicalReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MedicalReport savedReport = fileStorageService.uploadFile(2L, file, "Blood work");

        ArgumentCaptor<PutObjectRequest> putRequestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        ArgumentCaptor<RequestBody> requestBodyCaptor = ArgumentCaptor.forClass(RequestBody.class);
        ArgumentCaptor<MedicalReport> reportCaptor = ArgumentCaptor.forClass(MedicalReport.class);

        verify(s3Client).putObject(putRequestCaptor.capture(), requestBodyCaptor.capture());
        verify(medicalReportRepository).save(reportCaptor.capture());

        PutObjectRequest putRequest = putRequestCaptor.getValue();
        MedicalReport storedMetadata = reportCaptor.getValue();

        assertThat(putRequest.bucket()).isEqualTo("patient-reports-damith-001");
        assertThat(putRequest.key()).startsWith("reports/2/2_").endsWith(".docx");
        assertThat(putRequest.contentType()).isEqualTo(file.getContentType());

        assertThat(savedReport.getPatientId()).isEqualTo(2L);
        assertThat(storedMetadata.getFileName()).isEqualTo("lab-report.docx");
        assertThat(storedMetadata.getDescription()).isEqualTo("Blood work");
        assertThat(storedMetadata.getFileType()).isEqualTo("DOCUMENT");
        assertThat(storedMetadata.getFileSize()).isEqualTo(file.getSize());
        assertThat(storedMetadata.getMinioPath())
                .isEqualTo("s3://patient-reports-damith-001/" + putRequest.key());
    }

    @Test
    void uploadFileRejectsEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> fileStorageService.uploadFile(2L, emptyFile, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("File is empty");
    }

    @Test
    void downloadFileUsesExtractedS3KeyAndFallsBackToFileExtensionContentType() {
        MedicalReport report = new MedicalReport(
                2L,
                "lab-report.docx",
                "s3://patient-reports-damith-001/reports/2/2_abc.docx",
                "DOCUMENT",
                42L,
                "Blood work"
        );
        when(medicalReportRepository.findByIdAndPatientId(10L, 2L)).thenReturn(Optional.of(report));

        byte[] content = "docx-content".getBytes();
        GetObjectResponse getObjectResponse = GetObjectResponse.builder()
                .contentType("")
                .build();
        ResponseInputStream<GetObjectResponse> objectStream = new ResponseInputStream<>(
                getObjectResponse,
                AbortableInputStream.create(new ByteArrayInputStream(content))
        );
        when(s3Client.getObject(any(GetObjectRequest.class))).thenReturn(objectStream);

        FileStorageService.DownloadedFile downloadedFile = fileStorageService.downloadFile(10L, 2L);

        ArgumentCaptor<GetObjectRequest> requestCaptor = ArgumentCaptor.forClass(GetObjectRequest.class);
        verify(s3Client).getObject(requestCaptor.capture());

        assertThat(requestCaptor.getValue().bucket()).isEqualTo("patient-reports-damith-001");
        assertThat(requestCaptor.getValue().key()).isEqualTo("reports/2/2_abc.docx");
        assertThat(downloadedFile.fileName()).isEqualTo("lab-report.docx");
        assertThat(downloadedFile.contentType())
                .isEqualTo("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        assertThat(downloadedFile.content()).isEqualTo(content);
    }

    @Test
    void deleteFileUsesExtractedS3KeyAndDeletesRepositoryEntry() {
        MedicalReport report = new MedicalReport(
                2L,
                "lab-report.pdf",
                "s3://patient-reports-damith-001/reports/2/2_abc.pdf",
                "PDF",
                25L,
                "Scan"
        );
        when(medicalReportRepository.findByIdAndPatientId(15L, 2L)).thenReturn(Optional.of(report));

        fileStorageService.deleteFile(15L, 2L);

        ArgumentCaptor<DeleteObjectRequest> deleteRequestCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(deleteRequestCaptor.capture());
        verify(medicalReportRepository).deleteById(15L);

        assertThat(deleteRequestCaptor.getValue().bucket()).isEqualTo("patient-reports-damith-001");
        assertThat(deleteRequestCaptor.getValue().key()).isEqualTo("reports/2/2_abc.pdf");
    }

    @Test
    void downloadFileThrowsWhenReportDoesNotExist() {
        when(medicalReportRepository.findByIdAndPatientId(99L, 2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fileStorageService.downloadFile(99L, 2L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Report not found");
    }
}
