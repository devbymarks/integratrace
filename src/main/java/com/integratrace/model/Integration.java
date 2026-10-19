package com.integratrace.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="integrations")
public class Integration {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=100) private String name;
 @Column(length=500) private String description;
 @Column(nullable=false,length=1500) private String url;
 @Column(nullable=false,length=8) private String method="GET";
 @Column(nullable=false) private int expectedStatus=200;
 @Column(nullable=false) private int timeoutSeconds=5;
 @Column(nullable=false) private boolean active=true;
 @Column(nullable=false,updatable=false) private Instant createdAt;
 @Column(nullable=false) private Instant updatedAt;
 @PrePersist void create(){createdAt=Instant.now();updatedAt=createdAt;}
 @PreUpdate void update(){updatedAt=Instant.now();}
 public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;}
 public String getDescription(){return description;} public void setDescription(String v){description=v;}
 public String getUrl(){return url;} public void setUrl(String v){url=v;} public String getMethod(){return method;} public void setMethod(String v){method=v;}
 public int getExpectedStatus(){return expectedStatus;} public void setExpectedStatus(int v){expectedStatus=v;}
 public int getTimeoutSeconds(){return timeoutSeconds;} public void setTimeoutSeconds(int v){timeoutSeconds=v;}
 public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
 public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
}
