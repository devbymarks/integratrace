package com.integratrace.repository;
import com.integratrace.model.Integration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface IntegrationRepository extends JpaRepository<Integration,Long> {
 List<Integration> findAllByOrderByUpdatedAtDesc();
 List<Integration> findByNameContainingIgnoreCaseOrUrlContainingIgnoreCaseOrderByUpdatedAtDesc(String name,String url);
}
