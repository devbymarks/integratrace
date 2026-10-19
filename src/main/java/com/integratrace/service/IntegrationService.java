package com.integratrace.service;
import com.integratrace.dto.IntegrationRequest;
import com.integratrace.model.CheckRun;
import com.integratrace.model.Integration;
import com.integratrace.repository.CheckRunRepository;
import com.integratrace.repository.IntegrationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
@Service
public class IntegrationService {
 private final IntegrationRepository integrations; private final CheckRunRepository checks;
 public IntegrationService(IntegrationRepository i,CheckRunRepository c){integrations=i;checks=c;}
 public List<Integration> list(String q,Boolean active){
  List<Integration> out=(q==null||q.isBlank())?integrations.findAllByOrderByUpdatedAtDesc():integrations.findByNameContainingIgnoreCaseOrUrlContainingIgnoreCaseOrderByUpdatedAtDesc(q.trim(),q.trim());
  return active==null?out:out.stream().filter(i->i.isActive()==active).toList();
 }
 public Integration get(Long id){return integrations.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Integration not found"));}
 public Integration create(IntegrationRequest r){Integration i=new Integration();apply(i,r);return integrations.save(i);}
 public Integration update(Long id,IntegrationRequest r){Integration i=get(id);apply(i,r);return integrations.save(i);}
 private void apply(Integration i,IntegrationRequest r){i.setName(r.name().trim());i.setDescription(r.description()==null?"":r.description().trim());i.setUrl(r.url().trim());i.setMethod(r.method().toUpperCase(Locale.ROOT));i.setExpectedStatus(r.expectedStatus());i.setTimeoutSeconds(r.timeoutSeconds());i.setActive(r.active());}
 public Integration setActive(Long id,boolean active){Integration i=get(id);i.setActive(active);return integrations.save(i);}
 @Transactional public void delete(Long id){Integration i=get(id);if(!checks.findTop50ByIntegration_IdOrderByCheckedAtDesc(id).isEmpty())throw new ResponseStatusException(HttpStatus.CONFLICT,"This integration has check history. Deactivate it instead of deleting it.");integrations.delete(i);}
 @Transactional public CheckRun runCheck(Long id){
  Integration i=get(id);CheckRun r=new CheckRun();r.setIntegration(i);long start=System.nanoTime();Integer status=null;String result,message;
  try{HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(i.getTimeoutSeconds())).followRedirects(HttpClient.Redirect.NEVER).build();
   HttpRequest.Builder b=HttpRequest.newBuilder(URI.create(i.getUrl())).timeout(Duration.ofSeconds(i.getTimeoutSeconds())).header("User-Agent","IntegraTrace/1.0");
   if("HEAD".equals(i.getMethod()))b.method("HEAD",HttpRequest.BodyPublishers.noBody());else b.GET();
   HttpResponse<Void> response=client.send(b.build(),HttpResponse.BodyHandlers.discarding());status=response.statusCode();boolean ok=status==i.getExpectedStatus();result=ok?"SUCCESS":"FAILED";message=ok?"Expected HTTP status received.":"Expected HTTP "+i.getExpectedStatus()+" but received HTTP "+status+".";
  }catch(Exception ex){result="FAILED";message=ex.getClass().getSimpleName()+": "+safe(ex.getMessage());}
  r.setHttpStatus(status);r.setLatencyMs(Duration.ofNanos(System.nanoTime()-start).toMillis());r.setResult(result);r.setMessage(message);r.setCheckedAt(Instant.now());return checks.save(r);
 }
 private String safe(String s){if(s==null||s.isBlank())return "Request could not be completed.";s=s.replaceAll("[\\r\\n\\t]+"," ");return s.length()>800?s.substring(0,800):s;}
 public List<CheckRun> history(Long id){get(id);return checks.findTop50ByIntegration_IdOrderByCheckedAtDesc(id);}
 public List<CheckRun> recent(){return checks.findTop100ByOrderByCheckedAtDesc();}
 public Dashboard dashboard(){List<Integration> all=integrations.findAll();List<CheckRun> runs=checks.findTop500ByOrderByCheckedAtDesc();long ok=runs.stream().filter(r->"SUCCESS".equals(r.getResult())).count();long fail=runs.stream().filter(r->"FAILED".equals(r.getResult())).count();double avg=runs.stream().mapToLong(CheckRun::getLatencyMs).average().orElse(0);return new Dashboard(all.size(),all.stream().filter(Integration::isActive).count(),ok,fail,Math.round(avg),runs.size());}
 public record Dashboard(long totalIntegrations,long activeIntegrations,long successfulChecks,long failedChecks,long averageLatencyMs,long checksInWindow){}
}
