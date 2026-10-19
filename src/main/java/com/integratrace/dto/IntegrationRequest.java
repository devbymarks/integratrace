package com.integratrace.dto;
import jakarta.validation.constraints.*;
import java.net.URI;
public record IntegrationRequest(
 @NotBlank @Size(max=100) String name,
 @Size(max=500) String description,
 @NotBlank @Size(max=1500) String url,
 @NotBlank @Pattern(regexp="(?i)GET|HEAD",message="Method must be GET or HEAD") String method,
 @Min(100) @Max(599) int expectedStatus,
 @Min(1) @Max(15) int timeoutSeconds,
 boolean active) {
 public IntegrationRequest {
  if(url!=null&&!url.isBlank()) try {
   URI u=URI.create(url.trim()); String s=u.getScheme();
   if(!u.isAbsolute()||u.getHost()==null||!("http".equalsIgnoreCase(s)||"https".equalsIgnoreCase(s))) throw new IllegalArgumentException();
  } catch(IllegalArgumentException ex){throw new IllegalArgumentException("Enter a valid absolute HTTP or HTTPS URL.");}
 }
}
