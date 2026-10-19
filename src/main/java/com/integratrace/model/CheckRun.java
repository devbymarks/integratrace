package com.integratrace.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="check_runs")
public class CheckRun {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.EAGER,optional=false) @JoinColumn(name="integration_id",nullable=false) private Integration integration;
 @Column(nullable=false,length=12) private String result;
 private Integer httpStatus;
 @Column(nullable=false) private long latencyMs;
 @Column(length=1000) private String message;
 @Column(nullable=false) private Instant checkedAt;
 @PrePersist void create(){if(checkedAt==null)checkedAt=Instant.now();}
 public Long getId(){return id;} public Long getIntegrationId(){return integration==null?null:integration.getId();}
 public String getIntegrationName(){return integration==null?null:integration.getName();}
 public Integration getIntegration(){return integration;} public void setIntegration(Integration v){integration=v;}
 public String getResult(){return result;} public void setResult(String v){result=v;} public Integer getHttpStatus(){return httpStatus;} public void setHttpStatus(Integer v){httpStatus=v;}
 public long getLatencyMs(){return latencyMs;} public void setLatencyMs(long v){latencyMs=v;} public String getMessage(){return message;} public void setMessage(String v){message=v;}
 public Instant getCheckedAt(){return checkedAt;} public void setCheckedAt(Instant v){checkedAt=v;}
}
