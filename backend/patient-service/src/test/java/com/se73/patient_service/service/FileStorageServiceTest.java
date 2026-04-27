package com.se73.patient_service.service;

import com.se73.patient_service.repository.MedicalReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.services.s3.S3Client;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;

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
        org.springframework.test.util.ReflectionTestUtils.setField(fileStorageService, "bucketName", "test-bucket");
    }

    @Test
    void uploadFileThrowsWhenFileIsEmpty() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> fileStorageService.uploadFile(1L, emptyFile, "desc")
        );

        assertEquals("File is empty", exception.getMessage());
        verifyNoInteractions(s3Client);
    }

    @Test
    void deleteFileThrowsWhenReportDoesNotExist() {
        when(medicalReportRepository.findByIdAndPatientId(10L, 1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> fileStorageService.deleteFile(10L, 1L)
        );

        assertEquals("Report not found", exception.getMessage());
        verify(medicalReportRepository).findByIdAndPatientId(10L, 1L);
        verifyNoInteractions(s3Client);
    }

    @Test
    void downloadFileThrowsWhenReportDoesNotExist() {
        when(medicalReportRepository.findByIdAndPatientId(20L, 2L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> fileStorageService.downloadFile(20L, 2L)
        );

        assertEquals("Report not found", exception.getMessage());
        verify(medicalReportRepository).findByIdAndPatientId(20L, 2L);
        verifyNoInteractions(s3Client);
    }
}
