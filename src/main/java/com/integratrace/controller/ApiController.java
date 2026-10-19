package com.integratrace.controller;
import com.integratrace.dto.IntegrationRequest;
import com.integratrace.model.CheckRun;
import com.integratrace.model.Integration;
import com.integratrace.service.IntegrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;
@RestController @RequestMapping("/api")
public class ApiController {
 private final IntegrationService service; public ApiController(IntegrationService s){service=s;}
 @GetMapping("/health") public Map<String,Object> health(){return Map.of("status","UP","application","IntegraTrace","time",Instant.now());}
 @GetMapping("/dashboard") public IntegrationService.Dashboard dashboard(){return service.dashboard();}
 @GetMapping("/integrations") public List<Integration> list(@RequestParam(required=false)String q,@RequestParam(required=false)Boolean active){return service.list(q,active);}
 @PostMapping("/integrations") @ResponseStatus(HttpStatus.CREATED) public Integration create(@Valid @RequestBody IntegrationRequest r){return service.create(r);}
 @GetMapping("/integrations/{id}") public Integration get(@PathVariable Long id){return service.get(id);}
 @PutMapping("/integrations/{id}") public Integration update(@PathVariable Long id,@Valid @RequestBody IntegrationRequest r){return service.update(id,r);}
 @PatchMapping("/integrations/{id}/active") public Integration active(@PathVariable Long id,@RequestBody Map<String,Boolean> body){if(body.get("active")==null)throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"Field 'active' is required");return service.setActive(id,body.get("active"));}
 @DeleteMapping("/integrations/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){service.delete(id);}
 @PostMapping("/integrations/{id}/checks") public CheckRun check(@PathVariable Long id){return service.runCheck(id);}
 @GetMapping("/integrations/{id}/checks") public List<CheckRun> history(@PathVariable Long id){return service.history(id);}
 @GetMapping("/check-runs") public List<CheckRun> recent(){return service.recent();}
}
