package com.se73.notification_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
public class EmailService {
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@healthcare.com}")
    private String fromEmail;
    
    public boolean sendEmail(String to, String subject, String body) {
        try {
            if (mailSender == null) {
                log.warn("Mail sender not configured, using mock email send");
                mockEmailSend(to, subject, body);
                return true;
            }
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true = HTML
            
            mailSender.send(mimeMessage);
            log.info("Email sent successfully to: {}", to);
            return true;
            
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            return false;
        }
    }
    
    public boolean sendPlainTextEmail(String to, String subject, String body) {
        try {
            if (mailSender == null) {
                log.warn("Mail sender not configured, using mock email send");
                mockEmailSend(to, subject, body);
                return true;
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            log.info("Plain text email sent successfully to: {}", to);
            return true;
            
        } catch (Exception e) {
            log.error("Failed to send plain text email to {}: {}", to, e.getMessage(), e);
            return false;
        }
    }
    
    private void mockEmailSend(String to, String subject, String body) {
        log.info("=== MOCK EMAIL SEND ===");
        log.info("To: {}", to);
        log.info("Subject: {}", subject);
        log.info("Body: {}", body);
        log.info("=======================");
    }
}
