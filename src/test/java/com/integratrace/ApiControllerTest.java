package com.integratrace;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Map;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") class ApiControllerTest {
 @Autowired MockMvc mvc; @Autowired ObjectMapper mapper;
 @Test void healthReturnsUp() throws Exception {mvc.perform(get("/api/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));}
 @Test void createListDeactivateAndDashboard() throws Exception {
  String body=mapper.writeValueAsString(Map.of("name","Example health API","description","Test endpoint","url","https://example.com/health","method","GET","expectedStatus",200,"timeoutSeconds",5,"active",true));
  String raw=mvc.perform(post("/api/integrations").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated()).andExpect(jsonPath("$.name").value("Example health API")).andReturn().getResponse().getContentAsString();
  long id=mapper.readTree(raw).get("id").asLong();mvc.perform(get("/api/integrations")).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(id));
  mvc.perform(patch("/api/integrations/"+id+"/active").contentType(MediaType.APPLICATION_JSON).content("{\"active\":false}")).andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
  mvc.perform(get("/api/dashboard")).andExpect(status().isOk()).andExpect(jsonPath("$.totalIntegrations").value(1)).andExpect(jsonPath("$.activeIntegrations").value(0));
 }
 @Test void rejectsInvalidProtocol() throws Exception {String body=mapper.writeValueAsString(Map.of("name","Invalid","description","","url","file:///etc/passwd","method","GET","expectedStatus",200,"timeoutSeconds",5,"active",true));mvc.perform(post("/api/integrations").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());}
}
